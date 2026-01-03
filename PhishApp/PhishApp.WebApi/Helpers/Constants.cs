namespace PhishApp.WebApi.Helpers
{
    public class Constants
    {
        public static string TokenProvider = "PhishApp";
        public static string RefreshTokenName = "RefreshToken";
        public static int RefreshTokenValidityPeriod = 5;

        public static string Ascending = "asc";
        public static string Descending = "desc";


        // 1x1 PNG transparent
        public static readonly byte[] Pixel = Convert.FromHexString(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000100" +
            "05FE02FEA7579FA90000000049454E44AE426082");

        public static readonly string PublicUrl = "https://noreen-electrometric-aleida.ngrok-free.dev";
    }
}
