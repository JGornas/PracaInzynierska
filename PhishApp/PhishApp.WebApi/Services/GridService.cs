using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System.Linq.Expressions;

namespace PhishApp.WebApi.Services
{
    public class GridService : IGridService
    {
        private readonly IGridRepository _gridRepository;

        public GridService(IGridRepository gridRepository)
        {
            _gridRepository = gridRepository;
        }

        public async Task<GridData<T>> GetGridData<T>(GridRequest request) where T : class
        {
            return await _gridRepository.GetGridData<T>(request);
        }
    }
}
