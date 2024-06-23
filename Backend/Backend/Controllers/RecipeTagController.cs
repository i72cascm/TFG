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
                Name = b.Name,
            }).ToListAsync();

        // Obtener un tag a partir de su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<RecipeTag>> GetTagById(int id)
        {
            var tag = await _recipeTagContext.RecipeTags.SingleOrDefaultAsync(t => t.RecipeTagID == id);

            if (tag == null)
            {
                return NotFound();
            }

            return Ok(tag);
        }
    }
}
