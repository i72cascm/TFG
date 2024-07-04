using Amazon.S3.Model;
using Amazon.S3;
using Backend.DTOs;
using Backend.Filters;
using Backend.Modelos;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class LikeController(DBContext likeContext) : Controller
    {
        private readonly DBContext _likeContext = likeContext;

        // Comprobar si el usuario ha dado like a la receta
        [HttpGet("{userName}")]
        public async Task<ActionResult> HasLiked(string userName, [FromQuery] int recipeId)
        {
            try
            {
                // Buscar el ID del usuario por email
                var user = await _likeContext.Users.SingleOrDefaultAsync(u => u.UserName == userName);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Buscar la receta por ID
                var recipe = await _likeContext.Recipes.FindAsync(recipeId);
                if (recipe == null)
                {
                    return NotFound(new { Message = "Recipe not found." });
                }

                // Verificar si el usuario ya ha dado "me gusta" a la receta
                var hasLiked = await _likeContext.RecipeLikes
                    .AnyAsync(rl => rl.UserID == user.UserID && rl.RecipeID == recipeId);

                // Devuelve true o false dependiendo de si el usuario ha dado "me gusta"
                return Ok(new { HasLiked = hasLiked });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Dar Like
        [HttpPost("{userName}")]
        public async Task<ActionResult<RecipeInsertDto>> GiveLike(string userName, [FromQuery] int recipeId)
        {
            try
            {

                // Buscar el ID del usuario por email
                var user = await _likeContext.Users.SingleOrDefaultAsync(u => u.UserName == userName);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Buscar la receta por ID
                var recipe = await _likeContext.Recipes.FindAsync(recipeId);
                if (recipe == null)
                {
                    return NotFound(new { Message = "Recipe not found." });
                }

                // Verificar si el usuario ya ha dado "me gusta" a la receta
                var existingLike = await _likeContext.RecipeLikes
                    .AnyAsync(rl => rl.UserID == user.UserID && rl.RecipeID == recipeId);
                if (existingLike)
                {
                    return BadRequest(new { Message = "Like already given." });
                }

                // Crear y guardar el nuevo "me gusta"
                var newLike = new RecipeLike
                {
                    UserID = user.UserID,
                    RecipeID = recipeId
                };
                _likeContext.RecipeLikes.Add(newLike);
                await _likeContext.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Quitar Like
        [HttpDelete("{userName}")]
        public async Task<ActionResult<RecipeInsertDto>> RemoveLike(string userName, [FromQuery] int recipeId)
        {
            try
            {

                // Buscar el ID del usuario por email
                var user = await _likeContext.Users.SingleOrDefaultAsync(u => u.UserName == userName);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Buscar la receta por ID
                var recipe = await _likeContext.Recipes.FindAsync(recipeId);
                if (recipe == null)
                {
                    return NotFound(new { Message = "Recipe not found." });
                }

                // Buscar el registro "me gusta" existente
                var like = await _likeContext.RecipeLikes
                    .FirstOrDefaultAsync(rl => rl.UserID == user.UserID && rl.RecipeID == recipeId);
                if (like == null)
                {
                    return NotFound(new { Message = "Like not found." });
                }
                _likeContext.RecipeLikes.Remove(like);
                await _likeContext.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }
    }
}
