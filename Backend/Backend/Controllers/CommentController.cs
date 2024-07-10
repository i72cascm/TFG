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
                    .Join(_commentContext.Users, 
                          comment => comment.UserID, 
                          user => user.UserID, 
                          (comment, user) => new
                          {
                              comment.RecipeCommentID,
                              user.UserName, 
                              comment.RecipeID,
                              comment.Comment,
                              comment.CreatedAt,
                              comment.ParentCommentID
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

                var timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");
                var localDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneInfo);

                var comment = new RecipeComment
                {
                    UserID = user.UserID,
                    RecipeID = recipeCommentInsertDto.RecipeID,
                    Comment = recipeCommentInsertDto.Comment,
                    CreatedAt = localDateTime,
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

        // Método auxiliar para eliminar comentarios recursivamente
        private async Task RemoveCommentAndChildren(int commentId)
        {
            var comment = await _commentContext.RecipeComments.FindAsync(commentId);
            if (comment != null)
            {
                // Buscar comentarios hijo
                var childComments = await _commentContext.RecipeComments
                    .Where(c => c.ParentCommentID == commentId)
                    .ToListAsync();

                // Eliminar recursivamente los comentarios hijo
                foreach (var childComment in childComments)
                {
                    await RemoveCommentAndChildren(childComment.RecipeCommentID);
                }

                // Eliminar este comentario
                _commentContext.RecipeComments.Remove(comment);
            }
        }

        // Eliminar un comentario
        [HttpDelete("{commentId}")]
        public async Task<ActionResult> RemoveComment(int commentId)
        {
            try
            {
                // Buscar el comentario
                var comment = await _commentContext.RecipeComments.FindAsync(commentId);
                if (comment == null)
                {
                    return NotFound(new { Message = "Comment not found." });
                }

                // Llamada as función recursiva de eliminar comentario y sus hijos (EncoderServiceCollectionExtensions caso de tenerlos)
                await RemoveCommentAndChildren(commentId);

                // Eliminar y guardar la BD
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
