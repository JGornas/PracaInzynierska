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
using PhishApp.WebApi.Models.Reports;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;


        public ReportsController( IReportService reportService)
        {
            _reportService = reportService;
        }


        [HttpGet(Routes.ReportsFilters)]
        public async Task<RestResponse<ReportsFiltersDto>> GetFilters()
        {
            var filters = await _reportService.GetFilters();
            return RestResponse<ReportsFiltersDto>.CreateResponse(filters);
        }

        

        [HttpPost(Routes.ReportsInteractions)]
        public async Task<RestResponse<List<InteractionReportDto>>> GetInteractions([FromBody] ReportsFilterPayload payload)
        {
            List<InteractionReportDto> result = await _reportService.GetInteractions(payload);

            return RestResponse<List<InteractionReportDto>>.CreateResponse(result);
        }

        

        [HttpPost(Routes.ReportsSummary)]
        public async Task<RestResponse<SummaryDto>> GetSummary([FromBody] ReportsFilterPayload payload)
        {
            var summary = await _reportService.GetReportSummary(payload);

            return RestResponse<SummaryDto>.CreateResponse(summary);
        }


        [HttpPost(Routes.ReportsExport)]
        [HttpPost(Routes.ReportsExportHtml)]
        public async Task<IActionResult> Export([FromBody] ReportsExportPayload payload)
        {
            var safePayload = payload ?? new ReportsExportPayload();

            var exportResult = await _reportService.ExportReportAsync(safePayload);

            if (!exportResult.Success)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    exportResult.ErrorMessage);
            }

            return File(
                exportResult.FileBytes,
                exportResult.ContentType,
                exportResult.FileName);
        }

    }
}
