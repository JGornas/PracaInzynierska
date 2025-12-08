using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    [AllowAnonymous]
    public class ReportsController : ControllerBase
    {
        public class ReportsFilterPayload
        {
            public int? CampaignId { get; set; }
            public int? GroupId { get; set; }
            public string? DateFrom { get; set; }
            public string? DateTo { get; set; }
        }

        public class ReportsExportPayload
        {
            public FiltersLabel? Filters { get; set; }
            public ReportsFilterPayload? FiltersRaw { get; set; }
            public string? Title { get; set; }
            public string? GeneratedAt { get; set; }
            public SummaryDto? Summary { get; set; }
            public MetricsDto? Metrics { get; set; }
            public List<BarDto>? Bars { get; set; }
            public List<RowDto>? Rows { get; set; }
        }

        public class FiltersLabel
        {
            public string? Campaign { get; set; }
            public string? Group { get; set; }
            public string? Range { get; set; }
        }

        public class SummaryDto
        {
            public int Sent { get; set; }
            public int Opened { get; set; }
            public int Clicked { get; set; }
        }

        public class MetricsDto
        {
            public double OpenRate { get; set; }
            public double ClickRate { get; set; }
            public double ClickToOpenRate { get; set; }
        }

        public class BarDto
        {
            public string? Label { get; set; }
            public double Value { get; set; }
            public string? ColorStart { get; set; }
            public string? ColorEnd { get; set; }
        }

        public class RowDto
        {
            public string? Recipient { get; set; }
            public string? Status { get; set; }
            public string? Sent { get; set; }
            public string? Opened { get; set; }
            public string? Clicked { get; set; }
        }

        [HttpPost(Routes.ReportsExport)]
        [HttpPost(Routes.ReportsExportHtml)]
        public async Task<IActionResult> Export([FromBody] ReportsExportPayload payload)
        {
            var safePayload = payload ?? new ReportsExportPayload();
            var nodePayload = MapToNodePayload(safePayload);

            var scriptPath = ResolvePuppeteerScriptPath();
            if (!System.IO.File.Exists(scriptPath))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Brak skryptu Puppeteer: {scriptPath}");
            }

            var tempDir = Path.Combine(Path.GetTempPath(), "phishapp-report");
            Directory.CreateDirectory(tempDir);

            var jsonPath = Path.Combine(tempDir, $"payload-{Guid.NewGuid():N}.json");
            var pdfPath = Path.Combine(tempDir, $"report-{Guid.NewGuid():N}.pdf");

            var serializerOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var json = JsonSerializer.Serialize(nodePayload, serializerOptions);
            await System.IO.File.WriteAllTextAsync(jsonPath, json, new UTF8Encoding(encoderShouldEmitUTF8Identifier: false));

            try
            {
                var result = await RunNodePuppeteer(scriptPath, jsonPath, pdfPath);
                if (!result.Success)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, $"Generowanie PDF zakończyło się błędem: {result.Error}");
                }

                if (!System.IO.File.Exists(pdfPath))
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Nie znaleziono pliku PDF wygenerowanego przez Puppeteer.");
                }

                var pdfBytes = await System.IO.File.ReadAllBytesAsync(pdfPath);
                var fileName = BuildFileName(nodePayload.Title);
                return File(pdfBytes, "application/pdf", fileName);
            }
            finally
            {
                TryDelete(jsonPath);
                TryDelete(pdfPath);
            }
        }

        private static NodeReportPayload MapToNodePayload(ReportsExportPayload payload)
        {
            var filtersLabel = payload.Filters;
            var filtersRaw = payload.FiltersRaw;

            var filters = new NodeFilters
            {
                Campaign = filtersLabel?.Campaign ?? (filtersRaw?.CampaignId?.ToString() ?? "Wszystkie"),
                Group = filtersLabel?.Group ?? (filtersRaw?.GroupId?.ToString() ?? "Wszystkie"),
                Range = filtersLabel?.Range ?? BuildRange(filtersRaw)
            };

            var bars = payload.Bars ?? new List<BarDto>();
            if (bars.Count == 0 && payload.Summary is { })
            {
                bars = new List<BarDto>
                {
                    new() { Label = "Wysłane maile", Value = payload.Summary.Sent, ColorStart = "#0f172a", ColorEnd = "#334155" },
                    new() { Label = "Otwarcia", Value = payload.Summary.Opened, ColorStart = "#1d4ed8", ColorEnd = "#60a5fa" },
                    new() { Label = "Kliknięcia", Value = payload.Summary.Clicked, ColorStart = "#0f766e", ColorEnd = "#14b8a6" }
                };
            }

            return new NodeReportPayload
            {
                Title = string.IsNullOrWhiteSpace(payload.Title) ? "Raport kampanii" : payload.Title!,
                GeneratedAt = string.IsNullOrWhiteSpace(payload.GeneratedAt) ? DateTime.Now.ToString("g") : payload.GeneratedAt!,
                Filters = filters,
                Summary = payload.Summary ?? new SummaryDto(),
                Metrics = payload.Metrics ?? new MetricsDto(),
                Bars = bars.Select(b => new NodeBar
                {
                    Label = b.Label ?? string.Empty,
                    Value = b.Value,
                    ColorStart = string.IsNullOrWhiteSpace(b.ColorStart) ? "#1d4ed8" : b.ColorStart!,
                    ColorEnd = string.IsNullOrWhiteSpace(b.ColorEnd) ? "#60a5fa" : b.ColorEnd!
                }).ToList(),
                Rows = (payload.Rows ?? new List<RowDto>()).Select(MapRow).ToList()
            };
        }

        private static NodeRow MapRow(RowDto row)
        {
            var statusText = row.Status ?? string.Empty;
            return new NodeRow
            {
                Recipient = row.Recipient ?? string.Empty,
                Status = statusText,
                StatusColor = InferStatusColor(statusText),
                Sent = row.Sent ?? "--",
                Opened = row.Opened ?? "--",
                Clicked = row.Clicked ?? "--"
            };
        }

        private static string BuildRange(ReportsFilterPayload? filtersRaw)
        {
            var from = string.IsNullOrWhiteSpace(filtersRaw?.DateFrom) ? "--" : filtersRaw!.DateFrom!;
            var to = string.IsNullOrWhiteSpace(filtersRaw?.DateTo) ? "--" : filtersRaw!.DateTo!;
            return $"{from} - {to}";
        }

        private static string InferStatusColor(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return "#334155";
            }

            var normalized = status.ToLowerInvariant();
            if (normalized.Contains("klik"))
            {
                return "#0f766e";
            }

            if (normalized.Contains("otw"))
            {
                return "#1d4ed8";
            }

            return "#334155";
        }

        private static string ResolvePuppeteerScriptPath()
        {
            var baseDir = AppContext.BaseDirectory;
            var relative = Path.Combine(baseDir, "..", "..", "..", "..", "..", "Client", "phish-app-client", "tools", "report-pdf", "generate-report-pdf.js");
            return Path.GetFullPath(relative);
        }

        private static string BuildFileName(string title)
        {
            var invalidChars = Path.GetInvalidFileNameChars();
            var normalized = string.IsNullOrWhiteSpace(title) ? "raport" : title.Trim().ToLowerInvariant();
            var safeTitle = string.Concat(normalized.Select(ch => invalidChars.Contains(ch) ? '-' : ch)).Replace(' ', '-');
            var date = DateTime.UtcNow.ToString("yyyy-MM-dd");
            return $"{safeTitle}-{date}.pdf";
        }

        private static async Task<(bool Success, string? Error)> RunNodePuppeteer(string scriptPath, string dataPath, string outputPath)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "node",
                Arguments = $"\"{scriptPath}\" --data \"{dataPath}\" --out \"{outputPath}\"",
                WorkingDirectory = Path.GetDirectoryName(scriptPath),
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(startInfo);
            if (process == null)
            {
                return (false, "Nie udało się uruchomić procesu node/puppeteer.");
            }

            var stdoutTask = process.StandardOutput.ReadToEndAsync();
            var stderrTask = process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();
            var stdout = await stdoutTask;
            var stderr = await stderrTask;

            if (process.ExitCode != 0)
            {
                var message = $"Kod wyjścia {process.ExitCode}. stdout: {stdout}. stderr: {stderr}";
                return (false, message);
            }

            if (!System.IO.File.Exists(outputPath))
            {
                return (false, "Brak pliku PDF po zakończeniu skryptu Puppeteer.");
            }

            return (true, null);
        }

        private static void TryDelete(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return;
            }

            try
            {
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
            catch
            {
                // ignore cleanup issues
            }
        }

        private class NodeReportPayload
        {
            public string Title { get; set; } = string.Empty;
            public string GeneratedAt { get; set; } = string.Empty;
            public NodeFilters Filters { get; set; } = new();
            public SummaryDto Summary { get; set; } = new();
            public MetricsDto Metrics { get; set; } = new();
            public List<NodeBar> Bars { get; set; } = new();
            public List<NodeRow> Rows { get; set; } = new();
        }

        private class NodeFilters
        {
            public string Campaign { get; set; } = "Wszystkie";
            public string Group { get; set; } = "Wszystkie";
            public string Range { get; set; } = "--";
        }

        private class NodeBar
        {
            public string Label { get; set; } = string.Empty;
            public double Value { get; set; }
            public string ColorStart { get; set; } = "#1d4ed8";
            public string ColorEnd { get; set; } = "#60a5fa";
        }

        private class NodeRow
        {
            public string Recipient { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public string StatusColor { get; set; } = "#334155";
            public string Sent { get; set; } = "--";
            public string Opened { get; set; } = "--";
            public string Clicked { get; set; } = "--";
        }
    }
}
