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
using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.RestApi;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    [AllowAnonymous]
    public class ReportsController : ControllerBase
    {
        private readonly DataContext _context;

        public ReportsController(DataContext context)
        {
            _context = context;
        }

        public class ReportsFilterPayload
        {
            public int? CampaignId { get; set; }
            public int? GroupId { get; set; }
            public string? DateFrom { get; set; }
            public string? DateTo { get; set; }
        }

        public class ReportSelectOption
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
        }

        public class ReportGroupOption : ReportSelectOption
        {
            public int? CampaignId { get; set; }
        }

        public class ReportsFiltersDto
        {
            public List<ReportSelectOption> Campaigns { get; set; } = new();
            public List<ReportGroupOption> Groups { get; set; } = new();
        }

        public class InteractionReportDto
        {
            public int Id { get; set; }
            public int CampaignId { get; set; }
            public string CampaignName { get; set; } = string.Empty;
            public int? GroupId { get; set; }
            public string? GroupName { get; set; }
            public string RecipientEmail { get; set; } = string.Empty;
            public string? RecipientName { get; set; }
            public DateTime? SentAt { get; set; }
            public DateTime? OpenedAt { get; set; }
            public DateTime? ClickedAt { get; set; }
            public bool Opened { get; set; }
            public bool Clicked { get; set; }
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

        [HttpGet(Routes.ReportsFilters)]
        public async Task<RestResponse<ReportsFiltersDto>> GetFilters()
        {
            var campaigns = await _context.Campaigns
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new ReportSelectOption
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();

            var groups = await _context.CampaignRecipientGroups
                .AsNoTracking()
                .Select(g => new { g.CampaignId, g.RecipientGroupId, g.RecipientGroup.Name })
                .GroupBy(g => new { g.CampaignId, g.RecipientGroupId, g.Name })
                .Select(g => new ReportGroupOption
                {
                    Id = g.Key.RecipientGroupId,
                    Name = g.Key.Name,
                    CampaignId = g.Key.CampaignId
                })
                .OrderBy(g => g.Name)
                .ToListAsync();

            return RestResponse<ReportsFiltersDto>.CreateResponse(new ReportsFiltersDto
            {
                Campaigns = campaigns,
                Groups = groups
            });
        }

        [HttpPost(Routes.ReportsInteractions)]
        public async Task<RestResponse<List<InteractionReportDto>>> GetInteractions([FromBody] ReportsFilterPayload payload)
        {
            var query = BuildFilteredQuery(payload, includeDetails: true);

            var raw = await query
                .OrderByDescending(i => i.SentAt)
                .Select(item => new
                {
                    item.Id,
                    item.CampaignId,
                    CampaignName = item.Campaign.Name,
                    GroupId = (int?)item.RecipientMember.GroupId,
                    GroupName = item.RecipientMember.Group.Name,
                    RecipientEmail = item.RecipientMember.Recipient.Email,
                    RecipientFirstName = item.RecipientMember.Recipient.FirstName,
                    RecipientLastName = item.RecipientMember.Recipient.LastName,
                    item.SentAt,
                    OpenedAt = item.OpenedTime,
                    ClickedAt = item.FormSubmittedTime ?? item.RedirectedToLandingPageTime,
                    Opened = item.IsEmailOpened,
                    Clicked = item.IsRedirectedToLandingPage || item.IsFormSubmitted
                })
                .ToListAsync();

            var result = raw.Select(item => new InteractionReportDto
            {
                Id = item.Id,
                CampaignId = item.CampaignId,
                CampaignName = item.CampaignName,
                GroupId = item.GroupId,
                GroupName = item.GroupName,
                RecipientEmail = item.RecipientEmail,
                RecipientName = BuildRecipientName(item.RecipientFirstName, item.RecipientLastName),
                SentAt = item.SentAt,
                OpenedAt = item.OpenedAt,
                ClickedAt = item.ClickedAt,
                Opened = item.Opened,
                Clicked = item.Clicked
            }).ToList();

            return RestResponse<List<InteractionReportDto>>.CreateResponse(result);
        }

        [HttpPost(Routes.ReportsSummary)]
        public async Task<RestResponse<SummaryDto>> GetSummary([FromBody] ReportsFilterPayload payload)
        {
            var query = BuildFilteredQuery(payload, includeDetails: false);

            var summary = await query
                .GroupBy(_ => 1)
                .Select(group => new SummaryDto
                {
                    Sent = group.Count(x => x.IsSent),
                    Opened = group.Count(x => x.IsEmailOpened),
                    Clicked = group.Count(x => x.IsRedirectedToLandingPage || x.IsFormSubmitted)
                })
                .FirstOrDefaultAsync() ?? new SummaryDto();

            return RestResponse<SummaryDto>.CreateResponse(summary);
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

        private IQueryable<CampaignGroupMemberEmailInfoEntity> BuildFilteredQuery(ReportsFilterPayload? payload, bool includeDetails)
        {
            var query = _context.CampaignGroupMemberEmailInfos.AsNoTracking();
            if (includeDetails)
            {
                query = query
                    .Include(x => x.Campaign)
                    .Include(x => x.RecipientMember)
                        .ThenInclude(m => m.Group)
                    .Include(x => x.RecipientMember)
                        .ThenInclude(m => m.Recipient);
            }

            if (payload?.CampaignId is > 0)
            {
                query = query.Where(x => x.CampaignId == payload.CampaignId);
            }

            if (payload?.GroupId is > 0)
            {
                query = query.Where(x => x.RecipientMember.GroupId == payload.GroupId);
            }

            var from = ParseDate(payload?.DateFrom, endOfDay: false);
            if (from.HasValue)
            {
                query = query.Where(x => x.SentAt != null && x.SentAt >= from.Value);
            }

            var to = ParseDate(payload?.DateTo, endOfDay: true);
            if (to.HasValue)
            {
                query = query.Where(x => x.SentAt != null && x.SentAt < to.Value);
            }

            return query;
        }

        private static DateTime? ParseDate(string? value, bool endOfDay)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            if (!DateTime.TryParse(value, out var parsed))
            {
                return null;
            }

            var date = parsed.Date;
            return endOfDay ? date.AddDays(1) : date;
        }

        private static string? BuildRecipientName(string? firstName, string? lastName)
        {
            var first = firstName?.Trim();
            var last = lastName?.Trim();

            if (string.IsNullOrWhiteSpace(first) && string.IsNullOrWhiteSpace(last))
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(first))
            {
                return last;
            }

            if (string.IsNullOrWhiteSpace(last))
            {
                return first;
            }

            return $"{first} {last}";
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
