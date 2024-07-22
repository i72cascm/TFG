using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.DTOs;
using Backend.Modelos;
using Backend.Models;
using Backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Backend.Services;
using Backend.Filters;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(DBContext userContext, RecipeController recipeController) : ControllerBase
    {
        private readonly DBContext _userContext = userContext; // Contexto de la base de datos
        private readonly RecipeController _recipeController = recipeController; // Inyección de dependencias del contorlador de recetas para usar sus métodos aquí

        // Obtener todos los usuarios de la base de datos
        [HttpGet]
        public async Task<IEnumerable<UserDto>> Get() =>
            await _userContext.Users.Select(b => new UserDto
            {
                ID = b.UserID,
                Email = b.Email,
                Name = b.Name,
                LastNames = b.LastNames,
                UserName = b.UserName,
                BirthDate = b.BirthDate,
                Role = b.Role,
            }).ToListAsync();

        // Obtener todos los usuarios de la base de datos paginados
        [HttpGet("paged")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersPaged(int page = 1, int pageSize = 15, string search = "")
        {
            try
            {
                // Query para la DDBB
                IQueryable<User> query = _userContext.Users;

                // Filtrar si 'search' no está vacío
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(u => u.Email.Contains(search));
                }

                // Calculo total de usuarios en la BD y de páginas
                var totalUsers = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);

                // Verificar si la página solicitada está dentro del rango o si no hay páginas
                if (totalPages == 0)
                {
                    // No hay usuarios que coincidan con el filtro o no hay usuarios en absoluto
                    return Ok(new { Users = new List<UserDto>(), PageInfo = new { CurrentPage = 0, TotalPages = 0, PageSize = pageSize, TotalUsers = 0 } });
                }
                else if (page < 1 || page > totalPages)
                {
                    return BadRequest(new { Message = $"Page {page} is out of bounds. Please enter a page number between 1 and {totalPages}." });
                }

                // Calculo total de documentos a omitir dependiendo de la pagina solicitada
                int skip = (page - 1) * pageSize;

                // Obtener la página de usuarios solicitada
                var users = await query
                   .OrderBy(u => u.Email)
                   .Skip(skip)
                   .Take(pageSize)
                   .Select(b => new UserDto
                   {
                       ID = b.UserID,
                       Email = b.Email,
                       Name = b.Name,
                       LastNames = b.LastNames,
                       UserName = b.UserName,
                       BirthDate = b.BirthDate,
                       Role = b.Role,
                   })
                   .ToListAsync();

                // Retornar la lista de usuarios paginada junto con información de la paginación
                return Ok(new { Users = users, PageInfo = new { CurrentPage = page, TotalPages = totalPages, PageSize = pageSize, TotalUsers = totalUsers } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Obtener un único usuario a partir de su Email
        [HttpGet("{email}")]
        public async Task<ActionResult<UserDto>> GetByEmail(string email)
        {
            var user = await _userContext.Users.SingleOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                Name = user.Name,
                LastNames = user.LastNames,
                UserName = user.UserName,
                BirthDate = user.BirthDate,
                Role = user.Role,
            };

            return Ok(userDto);
        }

        // Modificar un usuario
        [HttpPut("{email}")]
        public async Task<ActionResult<UserDto>> UpdateUser(string email, UserUpdateDto userUpdateDto)
        {
            var user = await _userContext.Users.SingleOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound();
            }

            // Comprobar si el nuevo UserName ya existe en la base de datos
            var userNameExists = await _userContext.Users.AnyAsync(u => u.UserName == userUpdateDto.UserName && u.Email != email);
            if (userNameExists)
            {
                return BadRequest(new { message = "The UserName is already taken.." });
            }

            user.Name = userUpdateDto.Name;
            user.LastNames = userUpdateDto.LastNames;
            user.UserName = userUpdateDto.UserName;
            user.BirthDate = userUpdateDto.BirthDate;

            await _userContext.SaveChangesAsync(); // Guardar datos en la BD (no se añade al entity framework porque ya ha sido cargado previamente mediante FindAsync)

            var userDto = new UserDto
            {
                Name = user.Name,
                LastNames = user.LastNames,
                UserName = user.UserName,
                BirthDate = user.BirthDate
            };

            return Ok(userDto);
        }

        // Método auxiliar para eliminar comentarios recursivamente
        private async Task RemoveCommentAndChildren(int commentId)
        {
            var comment = await _userContext.RecipeComments.FindAsync(commentId);
            if (comment != null)
            {
                // Buscar comentarios hijo
                var childComments = await _userContext.RecipeComments
                    .Where(c => c.ParentCommentID == commentId)
                    .ToListAsync();

                // Eliminar recursivamente los comentarios hijo
                foreach (var childComment in childComments)
                {
                    await RemoveCommentAndChildren(childComment.RecipeCommentID);
                }

                // Eliminar este comentario
                _userContext.RecipeComments.Remove(comment);
            }
        }

        // Eliminar un usuario
        [HttpDelete("{email}")]
        public async Task<ActionResult> DeleteUser(string email)
        {
            var user = await _userContext.Users.SingleOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound();
            }

            // Eliminar las recetas del usuario mediante el controlador de recetas (inyección de dependencias)
            var result = await _recipeController.DeleteUserRecipes(email);
            if (result is NotFoundObjectResult)
            {
                return NotFound(new { Message = "User not found or no recipes found." });
            }
            else if (result is ObjectResult errorResult && errorResult.StatusCode == 500)
            {
                return StatusCode(500, new { Message = "Error deleting user recipes." });
            }

            // Obtener todos los likes del usuario y borrarlos
            var likes = _userContext.RecipeLikes.Where(rl => rl.UserID == user.UserID);
            _userContext.RecipeLikes.RemoveRange(likes);

            // Eliminar todas los comentarios del usuario (y las respuestas de estos)
            var comments = await _userContext.RecipeComments
                              .Where(c => c.UserID == user.UserID)
                              .ToListAsync();
            foreach (var comment in comments)
            {
                await RemoveCommentAndChildren(comment.RecipeCommentID);
            }

            // Eliminar usuario
            _userContext.Users.Remove(user);
            await _userContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
