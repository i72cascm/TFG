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
    public class RecipeController(DBContext recipeContext, IAuthService authService) : Controller
    {
        private readonly DBContext _recipeContext = recipeContext; // Contexto de la DB
        private readonly IAuthService _authService = authService;

        // Obtener todas las recetas existentes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetAllRecipes()
        {
            try
            {
                // Obtener todas las recetas
                var recipes = await _recipeContext.Recipes.Include(r => r.User).ToListAsync();

                var client = new AmazonS3Client();
                var bucketName = "i72cascm-recipes-web-app";
                var recipesDto = new List<RecipeDto>();

                foreach (var recipe in recipes)
                {
                    // Obtener la imagen desde S3
                    var getRequest = new GetObjectRequest
                    {
                        BucketName = bucketName,
                        Key = recipe.RecipeImage
                    };

                    using (var response = await client.GetObjectAsync(getRequest))
                    using (var responseStream = response.ResponseStream)
                    using (var memoryStream = new MemoryStream())
                    {
                        responseStream.CopyTo(memoryStream);
                        byte[] imageBytes = memoryStream.ToArray();

                        // Convertir bytes a base64
                        string base64Image = Convert.ToBase64String(imageBytes);
                        string imageDataUrl = $"data:{response.Headers["Content-Type"]};base64,{base64Image}";

                        // Agregar a la lista de DTOs
                        recipesDto.Add(new RecipeDto
                        {
                            ID = recipe.RecipeID,
                            UserID = recipe.UserID,
                            PreparationTime = recipe.PreparationTime,
                            ServingsNumber = recipe.ServingsNumber,
                            RecipeImage = imageDataUrl,
                            Steps = recipe.Steps,
                            Ingredients = recipe.Ingredients,
                            Tag = recipe.Tag
                        });
                    }
                }
                return Ok(recipesDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Obtener todas las recetas del usuario actual
        [HttpGet("user/{email}")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetUserRecipes(string email)
        {
            try
            {
                // Buscar el ID del usuario por email
                var user = await _recipeContext.Users.SingleOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Obtener las recetas del usuario a partir de su ID
                var recipes = await _recipeContext.Recipes
                    .Where(r => r.UserID == user.UserID)
                    .Include(r => r.User)
                    .ToListAsync();

                var client = new AmazonS3Client();
                var bucketName = "i72cascm-recipes-web-app";
                var recipesDto = new List<RecipeDto>();

                foreach (var recipe in recipes)
                {
                    // Obtener la imagen desde S3
                    var getRequest = new GetObjectRequest
                    {
                        BucketName = bucketName,
                        Key = recipe.RecipeImage
                    };

                    using (var response = await client.GetObjectAsync(getRequest))
                    using (var responseStream = response.ResponseStream)
                    using (var memoryStream = new MemoryStream())
                    {
                        responseStream.CopyTo(memoryStream);
                        byte[] imageBytes = memoryStream.ToArray();

                        // Convertir bytes a base64
                        string base64Image = Convert.ToBase64String(imageBytes);
                        string imageDataUrl = $"data:{response.Headers["Content-Type"]};base64,{base64Image}";

                        // Agregar a la lista de DTOs
                        recipesDto.Add(new RecipeDto
                        {
                            ID = recipe.RecipeID,
                            UserID = recipe.UserID,
                            PreparationTime = recipe.PreparationTime,
                            ServingsNumber = recipe.ServingsNumber,
                            RecipeImage = imageDataUrl,
                            Steps = recipe.Steps,
                            Ingredients = recipe.Ingredients,
                            Tag = recipe.Tag
                        });
                    }
                }
                return Ok(recipesDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Obtener una receta a través de su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<RecipeDto>> GetRecipeById(int id)
        {
            var recipe = await _recipeContext.Recipes.FindAsync(id);

            if (recipe == null)
            {
                return NotFound();
            }

            var recipeDto = new RecipeDto
            {
                ID = recipe.RecipeID,
                UserID = recipe.UserID,
                PreparationTime = recipe.PreparationTime,
                ServingsNumber = recipe.ServingsNumber,
                Steps = recipe.Steps,
                Ingredients = recipe.Ingredients,
                Tag = recipe.Tag
            };

            return Ok(recipeDto);
        }

        // Crear nueva Receta
        [HttpPost]
        public async Task<ActionResult<RecipeInsertDto>> Add(RecipeInsertDto recipeInsertDto)
        {
            try
            {
                var user = await _recipeContext.Users.SingleOrDefaultAsync(u => u.Email == recipeInsertDto.UserEmail);
                if (user == null)
                {
                    return BadRequest(new { Message = "User does not exist." });
                }

                var client = new AmazonS3Client();
                var bucketName = "i72cascm-recipes-web-app";
                var bucketExists = await Amazon.S3.Util.AmazonS3Util.DoesS3BucketExistV2Async(client, bucketName);
                if (!bucketExists)
                {
                    return BadRequest(new { Message = "Bucket does not exist." });
                }

                // Convertir la imagen en base64 a array de bytes
                var base64Data = recipeInsertDto.RecipeImage.Substring(recipeInsertDto.RecipeImage.IndexOf(',') + 1);
                var contentType = recipeInsertDto.RecipeImage.Substring(5, recipeInsertDto.RecipeImage.IndexOf(';') - 5);

                byte[] imageBytes = Convert.FromBase64String(base64Data);
                var fileExtension = contentType.Split('/')[1]; // "png", "jpeg", "jpg"
                var imageFileName = $"{Guid.NewGuid()}.{fileExtension}";

                //Subir la imagen a S3
                var putRequest = new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = imageFileName,
                    InputStream = new MemoryStream(imageBytes),
                    ContentType = contentType
                };
                await client.PutObjectAsync(putRequest);

                var recipe = new Recipe
                {
                    UserID = user.UserID,
                    PreparationTime = recipeInsertDto.PreparationTime,
                    ServingsNumber = recipeInsertDto.ServingsNumber,
                    RecipeImage = imageFileName,
                    Steps = recipeInsertDto.Steps,
                    Ingredients = recipeInsertDto.Ingredients,
                    Tag = recipeInsertDto.Tag
                };

                Console.WriteLine(recipe);

                _recipeContext.Recipes.Add(recipe);
                await _recipeContext.SaveChangesAsync();

                var recipeDto = new RecipeDto
                {
                    PreparationTime = recipeInsertDto.PreparationTime,
                    ServingsNumber = recipeInsertDto.ServingsNumber,
                    RecipeImage = imageFileName,
                    Steps = recipeInsertDto.Steps,
                    Ingredients = recipeInsertDto.Ingredients,
                    Tag = recipeInsertDto.Tag
                };

                return CreatedAtAction(nameof(GetRecipeById), new { id = recipe.RecipeID }, recipeDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
            
        }
    }
}
