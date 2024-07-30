using Backend.Modelos;
using Backend.Models;

namespace Backend.Services
{

    #pragma warning disable CS8625

    public interface IEdamamRecipeService
    {
        Task<List<RecipeInfo>> GetRecipesAsync(string query, List<string> healthLabels = null, List<string> dietLabels = null);
    }

    public interface IEdamamNutritionService
    {
        Task<NutritionInfo> GetNutritionInfoAsync(List<string> ingredients);
    }

    #pragma warning restore CS8625
}
