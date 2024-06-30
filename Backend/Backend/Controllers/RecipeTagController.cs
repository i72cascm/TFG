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
using Amazon.S3;
using Amazon.S3.Model;
using Azure;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeTagController(DBContext recipeTagContext) : Controller
    {
        private readonly DBContext _recipeTagContext = recipeTagContext; // Contexto de la DB      

        // Obtener todos los tags de recetas de la base de datos
        [HttpGet]
        public async Task<IEnumerable<RecipeTag>> GetAllTags() =>
            await _recipeTagContext.RecipeTags.Select(b => new RecipeTag
            {
                RecipeTagID = b.RecipeTagID,
                TagName = b.TagName,
            }).ToListAsync();

        // Obtener tags de un usuario por email
        [HttpGet("{email}")]
        public async Task<ActionResult<RecipeTag>> GetTagByEmail(string email)
        {
            // Buscar al usuario por email
            var user = await _recipeTagContext.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Obtener los tags del usuario
            var userTags = await _recipeTagContext.UserTags
                    .Include(ut => ut.RecipeTag)
                    .Where(ut => ut.UserID == user.UserID)
                    .ToListAsync();

            // Si el usuario no tiene tags, regresar lista vacía
            if (user.UserTags == null)
            {
                return Ok(new List<RecipeTag>());
            }

            // Extraer y retornar solo los RecipeTags asociados a los UserTags del usuario
            var tags = user.UserTags.Select(ut => ut.RecipeTag).ToList();

            return Ok(tags);
        }

        // Actualizar tags de intereses de usuario (borrar los existentes y añadir los nuevos)
        [HttpPost("{email}")]
        public async Task<ActionResult<RecipeTag>> UpdateUserTags(string email, int[] tags)
        {
            // Buscar al usuario por email
            var user = await _recipeTagContext.Users
                            .Include(u => u.UserTags)
                            .SingleOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Borrar todos los UserTags existentes asociados a este usuario
            _recipeTagContext.UserTags.RemoveRange(user.UserTags!);
            await _recipeTagContext.SaveChangesAsync(); // Guardar cambios

            // Añadir los nuevos tags a la tabla UserTags (idUser + idTag)
            foreach (var tagId in tags)
            {
                var newUserTag = new UserTag
                {
                    UserID = user.UserID,
                    RecipeTagID = tagId
                };
                _recipeTagContext.UserTags.Add(newUserTag);
            }

            // Guardar cambios en la base de datos
            await _recipeTagContext.SaveChangesAsync();

            return Ok();
        }
    }
}
