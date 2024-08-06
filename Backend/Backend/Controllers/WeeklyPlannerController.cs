using Backend.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using Backend.DTOs;
using Backend.Modelos;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class WeeklyPlannerController : ControllerBase
    {
        private readonly DBContext _weeklyPlannerContext;
        private readonly IAuthService _authService;

        public WeeklyPlannerController(DBContext weeklyPlannerContext, IAuthService authService)
        {
            _weeklyPlannerContext = weeklyPlannerContext;
            _authService = authService;
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<IEnumerable<WeeklyPlannerEvent>>> GetUserEvents(string email)
        {
            try
            {
                var user = await _weeklyPlannerContext.Users
                        .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Obtener eventos del usuario
                var events = await _weeklyPlannerContext.WeeklyPlannerEvents
                                 .Where(e => e.UserID == user.UserID)
                                 .ToListAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("{email}")]
        public async Task<ActionResult<ShoppingList>> CreateShoppingList(string email, [FromBody] List<WeeklyPlannerInsertDto> events)
        {
            // Buscar al usuario por email
            var user = await _weeklyPlannerContext.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            // Eliminar todos los eventos existentes del usuario
            var existingEvents = await _weeklyPlannerContext.WeeklyPlannerEvents
                                 .Where(e => e.UserID == user.UserID)
                                 .ToListAsync();
            _weeklyPlannerContext.WeeklyPlannerEvents.RemoveRange(existingEvents);
            await _weeklyPlannerContext.SaveChangesAsync();

            // Agregar nuevos eventos
            foreach (var eventDto in events)
            {
                var eventItem = new WeeklyPlannerEvent
                {
                    UserID = user.UserID,
                    RecipeID = eventDto.RecipeID,
                    Title = eventDto.Title,
                    Start = eventDto.Start.AddHours(2), // UTC + 2
                    End = eventDto.End.AddHours(2),
                    EventID = eventDto.EventID
                };
                _weeklyPlannerContext.WeeklyPlannerEvents.Add(eventItem);
            }
            await _weeklyPlannerContext.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("sumNutrition")]
        public async Task<ActionResult<NutritionSummaryDto>> GetNutritionSummary([FromQuery] int[] recipeIds)
        {
            try
            {
                if (recipeIds == null || recipeIds.Length == 0)
                {
                    var emptyNutritionSummary = new NutritionSummaryDto
                    {
                        TotalCalories = 0,
                        TotalFat = 0,
                        TotalProtein = 0,
                        TotalCarbohydrate = 0
                    };

                    return Ok(emptyNutritionSummary);
                }

                float totalCalories = 0;
                float totalFat = 0;
                float totalProtein = 0;
                float totalCarbohydrate = 0;

                foreach (var recipeId in recipeIds)
                {
                    var recipe = await _weeklyPlannerContext.Recipes
                                    .FirstOrDefaultAsync(r => r.RecipeID == recipeId);

                    if (recipe != null)
                    {
                        totalCalories += recipe.Calories;
                        totalFat += recipe.Fat;
                        totalProtein += recipe.Protein;
                        totalCarbohydrate += recipe.Carbohydrate;
                    }
                }

                var nutritionSummary = new NutritionSummaryDto
                {
                    TotalCalories = totalCalories,
                    TotalFat = totalFat,
                    TotalProtein = totalProtein,
                    TotalCarbohydrate = totalCarbohydrate
                };

                return Ok(nutritionSummary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}

