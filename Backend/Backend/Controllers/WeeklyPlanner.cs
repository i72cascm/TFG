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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WeeklyPlannerEvent>>> GetAllEvents()
        {
            try
            {
                var events = await _weeklyPlannerContext.WeeklyPlannerEvents.ToListAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                // Aquí se maneja cualquier error que pueda ocurrir durante la consulta a la base de datos
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
    }
}
