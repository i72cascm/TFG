using Backend.Services;
using Backend.Modelos;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EdamamController : ControllerBase
    {
        private readonly EdamamService _edamamService;

        public EdamamController(EdamamService edamamService)
        {
            _edamamService = edamamService;
        }

        [HttpGet("test")]
        public async Task<IActionResult> Test()
        {
            try
            {
                var query = "chocolate";
                var healthLabels = new List<string> { "tree-nut-free", "keto-friendly", "shellfish-free", "lupine-free", "wheat-free", "paleo" };
                var dietLabels = new List<string> { "high-protein", "low-carb" };
                var recipeInfos = await _edamamService.GetRecipesAsync(query, healthLabels, dietLabels);

                // Escribir los nombres de las recetas en la consola
                foreach (var recipeInfo in recipeInfos)
                {
                    Console.WriteLine($"Label: {recipeInfo.Label}");
                }

                return Ok("Check the console for the recipe details.");
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
