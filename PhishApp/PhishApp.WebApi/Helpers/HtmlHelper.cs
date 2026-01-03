using HtmlAgilityPack;
using System.Web;

namespace PhishApp.WebApi.Helpers
{
    public class HtmlHelper
    {

        public static bool ContainsClickableElements(string htmlContent)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
                return false;

            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            var hasLinks = doc.DocumentNode.SelectSingleNode("//a[@href]") != null;
            var hasButtons = doc.DocumentNode.SelectSingleNode("//button") != null;

            return hasLinks || hasButtons;
        }

        public static bool ContainsFormElements(string htmlContent)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
                return false;

            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            return doc.DocumentNode.SelectSingleNode("//form") != null;
        }

        public static string GetEmailContentWithPixel(string? templateContent, Guid pixelId)
        {
            string pixelUrl = $"{Constants.PublicUrl}/api/pixel/{pixelId}.png";

            string pixelHtml = $"<img src=\"{pixelUrl}\" width=\"1\" height=\"1\" />";


            string content = templateContent ?? string.Empty;

            if (string.IsNullOrWhiteSpace(content))
            {
                return $"<html><body>{pixelHtml}</body></html>";
            }

            const string bodyClosingTag = "</body>";
            int index = content.IndexOf(bodyClosingTag, StringComparison.OrdinalIgnoreCase);

            if (index >= 0)
            {
                return content.Insert(index, pixelHtml + "\n");
            }

            return content + "\n" + pixelHtml;
        }

        public static string AddQuizRedirects(string htmlContent, int quizzId)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
                return htmlContent;

            string landingBaseUrl = $"{Constants.PublicUrl}/quiz/{quizzId}";

            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            var aNodes = doc.DocumentNode.SelectNodes("//a[@href]");
            if (aNodes != null)
            {
                foreach (var a in aNodes)
                {
                    a.SetAttributeValue("href", landingBaseUrl);
                }
            }

            var buttonNodes = doc.DocumentNode.SelectNodes("//button[@onclick]");
            if (buttonNodes != null)
            {
                foreach (var button in buttonNodes)
                {
                    string onclick = button.GetAttributeValue("onclick", "");

                    if (onclick.Contains("window.location", StringComparison.OrdinalIgnoreCase))
                    {
                        button.SetAttributeValue(
                            "onclick",
                            $"window.location='{landingBaseUrl}'"
                        );
                    }
                }
            }

            return doc.DocumentNode.OuterHtml;
        }


        public static string AddLandingRedirects(string htmlContent, Guid landingId)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
                return htmlContent;

            string landingBaseUrl = $"{Constants.PublicUrl}/landing/{landingId}";

            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            var aNodes = doc.DocumentNode.SelectNodes("//a[@href]");
            if (aNodes != null)
            {
                foreach (var a in aNodes)
                {
                    string originalHref = a.GetAttributeValue("href", "#");
                    string targetUrl = HttpUtility.UrlEncode(originalHref);
                    a.SetAttributeValue("href", landingBaseUrl);
                }
            }

            var buttonNodes = doc.DocumentNode.SelectNodes("//button[@onclick]");
            if (buttonNodes != null)
            {
                foreach (var button in buttonNodes)
                {
                    string onclick = button.GetAttributeValue("onclick", "");
                    var start = onclick.IndexOf("window.location='", StringComparison.OrdinalIgnoreCase);
                    if (start >= 0)
                    {
                        start += "window.location='".Length;
                        var end = onclick.IndexOf("'", start);
                        if (end > start)
                        {
                            string originalUrl = onclick.Substring(start, end - start);
                            string targetUrl = HttpUtility.UrlEncode(originalUrl);
                            button.SetAttributeValue("onclick", $"window.location='{landingBaseUrl}?target={targetUrl}'");
                        }
                    }
                }
            }

            var formNodes = doc.DocumentNode.SelectNodes("//form[@action]");
            if (formNodes != null)
            {
                foreach (var form in formNodes)
                {
                    form.SetAttributeValue("action", landingBaseUrl);
                }
            }

            return doc.DocumentNode.OuterHtml;
        }


        public static string AddSubmitRedirects(string htmlContent, Guid formSubmitId)
        {
            if (string.IsNullOrWhiteSpace(htmlContent))
                return htmlContent;

            string submitUrl = $"{Constants.PublicUrl}/result/{formSubmitId}";

            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            var aNodes = doc.DocumentNode.SelectNodes("//a[@href]");
            if (aNodes != null)
            {
                foreach (var a in aNodes)
                {
                    a.SetAttributeValue("href", submitUrl);
                }
            }

            var buttonNodes = doc.DocumentNode.SelectNodes("//button[@onclick]");
            if (buttonNodes != null)
            {
                foreach (var button in buttonNodes)
                {
                    string onclick = button.GetAttributeValue("onclick", "");
                    if (onclick.Contains("window.location", StringComparison.OrdinalIgnoreCase))
                    {
                        button.SetAttributeValue("onclick", $"window.location='{submitUrl}'");
                    }
                }
            }

            var formNodes = doc.DocumentNode.SelectNodes("//form[@action]");
            if (formNodes != null)
            {
                foreach (var form in formNodes)
                {
                    form.SetAttributeValue("action", submitUrl);
                }
            }

            return doc.DocumentNode.OuterHtml;
        }
    }
}
