namespace PhishApp.WebApi.Models.Reports
{
    public class ReportExportResult
    {
        public bool Success { get; set; }
        public byte[]? FileBytes { get; set; }
        public string ContentType { get; set; } = "application/pdf";
        public string FileName { get; set; } = "report.pdf";
        public string? ErrorMessage { get; set; }

        public static ReportExportResult Fail(string error)
            => new() { Success = false, ErrorMessage = error };

        public static ReportExportResult Ok(byte[] bytes, string fileName)
            => new()
            {
                Success = true,
                FileBytes = bytes,
                FileName = fileName
            };
    }

}
