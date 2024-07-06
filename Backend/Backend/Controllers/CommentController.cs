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
    public class CommentController(DBContext commentContext) : Controller
    {
        private readonly DBContext _commentContext = commentContext;

        // Obtener todos los comentarios de una receta
        [HttpGet("{recipeId}")]
        public async Task<ActionResult<IEnumerable<RecipeComment>>> GetComments(int recipeId)
        {
            try
            {
                var comments = await _commentContext.RecipeComments
                    .Where(c => c.RecipeID == recipeId)
                    .Select(c => new RecipeComment
                    {
                        RecipeCommentID = c.RecipeCommentID,
                        UserID = c.UserID,
                        RecipeID = c.RecipeID,
                        Comment = c.Comment,
                        CreatedAt = c.CreatedAt,
                        ParentCommentID = c.ParentCommentID
                    })
                    .ToListAsync();
      
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Postear un comentario
        [HttpPost("{userName}")]
        public async Task<ActionResult> PostComment(string userName, [FromBody] RecipeCommentInsertDto recipeCommentInsertDto)
        {
            try
            {
                // Buscar el ID del usuario por email
                var user = await _commentContext.Users.SingleOrDefaultAsync(u => u.UserName == userName);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                var comment = new RecipeComment
                {
                    UserID = user.UserID,
                    RecipeID = recipeCommentInsertDto.RecipeID,
                    Comment = recipeCommentInsertDto.Comment,
                    CreatedAt = DateTime.UtcNow,
                    ParentCommentID = null
                };

                // Verificar si el ParentCommentID existe, si es proporcionado
                if (recipeCommentInsertDto.ParentCommentID.HasValue)
                {
                    var parentComment = await _commentContext.RecipeComments.FindAsync(recipeCommentInsertDto.ParentCommentID.Value);
                    if (parentComment != null)
                    {
                        // Si el comentario padre existe, asignarlo
                        comment.ParentCommentID = recipeCommentInsertDto.ParentCommentID;
                    }
                    // Si el comentario padre no existe, simplemente no asignarParentCommentID
                }

                // Añadir y guardar BD
                _commentContext.RecipeComments.Add(comment);
                await _commentContext.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Quitar Like
        [HttpDelete("{commentId}")]
        public async Task<ActionResult> RemoveComment(int commentId)
        {
            try
            {
                // Buscar el comentario
                var comment = await _commentContext.RecipeComments.FindAsync(commentId);
                if (comment == null)
                {
                    return NotFound(new {Message = "Comment not found." });
                }

                // Eliminar y guardar la BD
                _commentContext.RecipeComments.Remove(comment);
                await _commentContext.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }
    }
}
