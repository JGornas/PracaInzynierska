
using PhishApp.WebApi.Helpers;

namespace PhishApp.WebApi.Models.Grid
{
    public class GridRequest
    {
        public string Sort { get; set; } = string.Empty;
        public string Order { get; set; } = Constants.Ascending;
        public GridPageInfo PageInfo { get; set; } = new GridPageInfo();
        public string Filter { get; set; } = string.Empty;
        public int? SelectedItemId { get; set; } = null;
    }
}
