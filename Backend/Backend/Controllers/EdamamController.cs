using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

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
                var healthLabels = new List<string> { "tree-nut-free" };
                var dietLabels = new List<string> { "high-protein", "low-carb" };
                var recipes = await _edamamService.GetRecipesAsync(query, healthLabels, dietLabels);

                // Escribir los resultados en la consola
                Console.WriteLine(recipes);

                return Ok("Check the console for the API response.");
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
