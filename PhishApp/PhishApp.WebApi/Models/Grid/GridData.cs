namespace PhishApp.WebApi.Models.Grid
{
    public class GridData<T>
    {
        public List<T> Items { get; set; } = new();
        public GridPageInfo PageInfo { get; set; } = new();
    }
}
