using Backend.Modelos;
using Microsoft.AspNetCore.Mvc;

#pragma warning disable CS8625 
#pragma warning disable CS8602 

namespace Backend.Services
{
    public interface IEdamamService
    {
        Task<List<RecipeInfo>> GetRecipesAsync(string query, List<string> healthLabels = null, List<string> dietLabels = null);
    }
}

#pragma warning restore CS8625
#pragma warning restore CS8602
