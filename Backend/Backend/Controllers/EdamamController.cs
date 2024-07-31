using Backend.Modelos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EdamamController : ControllerBase
    {
        private readonly IEdamamRecipeService _edamamRecipeService;
        private readonly IEdamamNutritionService _edamamNutritionService;

        public EdamamController(IEdamamRecipeService edamamRecipeService, IEdamamNutritionService edamamNutritionService)
        {
            _edamamRecipeService = edamamRecipeService;
            _edamamNutritionService = edamamNutritionService;
            
        }

        [HttpPost]
        public async Task<IActionResult> GetHealthyRecipes([FromBody] RecipeSearchModel searchModel)
        {
            try
            {
                var search = searchModel.Query;
                var tags = searchModel.Tags;

                // Posibles etiquetas 
                var possibleHealthLabels = new List<string> { "alcohol-cocktail", "alcohol-free", "celery-free", "crustacean-free", "dairy-free", "egg-free", "fish-free", "fodmap-free", "gluten-free", "immuno-supportive", "keto-friendly", "kidney-friendly", "low-fat-abs", "low-potassium", "low-sugar", "lupine-free", "mollusk-free", "mustard-free", "no-oil-added", "paleo", "peanut-free", "pescatarian", "pork-free", "red-meat-free", "sesame-free", "shellfish-free", "soy-free", "sugar-conscious", "sulfite-free", "tree-nut-free", "vegan", "vegetarian", "wheat-free" };
                var possibleDietLabels = new List<string> { "balanced", "high-fiber", "high-protein", "low-carb", "low-fat", "low-sodium" };

                // Filtrar etiquetas basadas en los tags del modelo
                var healthLabels = tags.Where(tag => possibleHealthLabels.Contains(tag)).ToList();
                var dietLabels = tags.Where(tag => possibleDietLabels.Contains(tag)).ToList();

                // Llamar a la API de Edamam
                var recipeInfos = await _edamamRecipeService.GetRecipesAsync(search, healthLabels, dietLabels);
         
                return Ok(recipeInfos);
            }
            catch (Exception ex)
            {
                // Escribir el error en la consola
                Console.WriteLine(ex.Message);
                return StatusCode(500, "An error occurred while fetching recipes.");
            }
        }
    }
}
