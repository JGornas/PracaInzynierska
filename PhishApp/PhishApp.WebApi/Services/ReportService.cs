using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Reports;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System.Diagnostics;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;

namespace PhishApp.WebApi.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<ReportsFiltersDto> GetFilters()
        {
            var campaigns = await _reportRepository.GetReportCampaignsFilter();
            var groups = await _reportRepository.GetReportGroupsFilter();

            return new ReportsFiltersDto
            {
                Campaigns = campaigns,
                Groups = groups
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

        public async Task<List<InteractionReportDto>> GetInteractions(ReportsFilterPayload payload)
        {            
            var interactionReportDto = await _reportRepository.GetInteractionRow(payload);

            return interactionReportDto;
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
            var date = DateTime.Now.ToString("yyyy-MM-dd");
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

        public async Task<SummaryDto> GetReportSummary(ReportsFilterPayload payload)
        {
            var reportSummaryDto = await _reportRepository.GetReportSummary(payload);
            
            return reportSummaryDto;
        }

        public async Task<ReportExportResult> ExportReportAsync(ReportsExportPayload payload)
        {
            var nodePayload = MapToNodePayload(payload);

            var scriptPath = ResolvePuppeteerScriptPath();
            if (!File.Exists(scriptPath))
            {
                return ReportExportResult.Fail(
                    $"Brak skryptu Puppeteer: {scriptPath}");
            }

            var tempDir = Path.Combine(Path.GetTempPath(), "phishapp-report");
            Directory.CreateDirectory(tempDir);

            var jsonPath = Path.Combine(tempDir, $"payload-{Guid.NewGuid():N}.json");
            var pdfPath = Path.Combine(tempDir, $"report-{Guid.NewGuid():N}.pdf");

            try
            {
                var serializerOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };

                var json = JsonSerializer.Serialize(nodePayload, serializerOptions);
                await File.WriteAllTextAsync(
                    jsonPath,
                    json,
                    new UTF8Encoding(false));

                var result = await RunNodePuppeteer(scriptPath, jsonPath, pdfPath);
                if (!result.Success)
                {
                    return ReportExportResult.Fail(
                        $"Generowanie PDF zakończyło się błędem: {result.Error}");
                }

                if (!File.Exists(pdfPath))
                {
                    return ReportExportResult.Fail(
                        "Nie znaleziono pliku PDF wygenerowanego przez Puppeteer.");
                }

                var pdfBytes = await File.ReadAllBytesAsync(pdfPath);
                var fileName = BuildFileName(nodePayload.Title);

                return ReportExportResult.Ok(pdfBytes, fileName);
            }
            catch (Exception ex)
            {
                return ReportExportResult.Fail(ex.Message);
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

    }
}
