using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Repositories.Interfaces;
using System.Linq.Expressions;

namespace PhishApp.WebApi.Repositories
{
    public class GridRepository : IGridRepository
    {
        private readonly DataContext _context;

        public GridRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<GridData<T>> GetGridData<T>(GridRequest request) where T : class
        {
            IQueryable<T> query = _context.Set<T>();

            // Filtrowanie po wszystkich właściwościach jako string
            if (!string.IsNullOrWhiteSpace(request.Filter))
            {
                var parameter = Expression.Parameter(typeof(T), "x");
                var filterValue = Expression.Constant(request.Filter.ToLower());
                Expression? orExpression = null;

                foreach (var prop in typeof(T).GetProperties())
                {
                    if (!prop.CanRead) continue;

                    var propAccess = Expression.Property(parameter, prop);
                    Expression toStringExpr = Expression.Call(
                        propAccess,
                        "ToString",
                        Type.EmptyTypes
                    );
                    var toLowerExpr = Expression.Call(toStringExpr, typeof(string).GetMethod("ToLower", Type.EmptyTypes)!);
                    var containsExpr = Expression.Call(
                        toLowerExpr,
                        typeof(string).GetMethod("Contains", new[] { typeof(string) })!,
                        filterValue
                    );

                    orExpression = orExpression == null ? containsExpr : Expression.OrElse(orExpression, containsExpr);
                }

                if (orExpression != null)
                {
                    var lambda = Expression.Lambda<Func<T, bool>>(orExpression, parameter);
                    query = query.Where(lambda);
                }
            }

            // Sortowanie
            if (!string.IsNullOrEmpty(request.Sort))
            {
                var prop = typeof(T).GetProperty(request.Sort);
                if (prop != null)
                {
                    query = request.Order.ToLower() == Constants.Descending
                        ? query.OrderByDescending(e => EF.Property<object>(e, request.Sort))
                        : query.OrderBy(e => EF.Property<object>(e, request.Sort));
                }
            }

            // Liczba wszystkich rekordów po filtrze
            var totalCount = await query.CountAsync();

            // Obsługa SelectedItemId
            int pageIndex = request.PageInfo.PageIndex;

            if (request.SelectedItemId.HasValue && request.SelectedItemId.Value > 0)
            {
                var idProp = typeof(T).GetProperty("Id");
                if (idProp != null)
                {
                    var idValue = request.SelectedItemId.Value;

                    // Pobierz wszystkie Id w aktualnym sortowaniu i filtrze
                    var allIds = await query.Select(e => EF.Property<int>(e, "Id")).ToListAsync();

                    var position = allIds.IndexOf(idValue);
                    if (position >= 0)
                    {
                        pageIndex = position / request.PageInfo.PageSize;
                    }
                }
            }

            // Paginacja
            var items = await query
                .Skip(pageIndex * request.PageInfo.PageSize)
                .Take(request.PageInfo.PageSize)
                .ToListAsync();

            return new GridData<T>
            {
                Items = items,
                PageInfo = new GridPageInfo
                {
                    TotalCount = totalCount,
                    PageIndex = pageIndex,
                    PageSize = request.PageInfo.PageSize
                }
            };
        }

    }
}
