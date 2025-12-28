using System.Globalization;

namespace PhishApp.WebApi.Helpers
{
    public class DateTimeHelper
    {
        private const string Format = "yyyy-MM-ddTHH:mm";

        public static string? ToLocalString(DateTime? dateTime)
        {
            if (dateTime == null) return null;
            return dateTime.Value.ToString(Format);
        }

        public static DateTime? FromLocalString(string? dateTimeString)
        {
            if (string.IsNullOrEmpty(dateTimeString)) return null;
            return DateTime.ParseExact(dateTimeString, Format, CultureInfo.InvariantCulture);
        }

        public static DateTime? ParseDate(string? value, bool endOfDay)
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
    }
}
