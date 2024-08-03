using Backend.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;

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
    }
}
