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
using Backend.Migrations;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeController(DBContext recipeContext, IAuthService authService, IEdamamNutritionService edamamNutritionService) : Controller
    {
        private readonly DBContext _recipeContext = recipeContext; // Contexto de la DB
        private readonly IAuthService _authService = authService;
        private readonly IEdamamNutritionService _edamamNutritionService = edamamNutritionService;

        // Obtener todas las recetas paginadas para la tabla Admin
        [HttpGet("paged")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipesPagedAdmin(int page = 1, int pageSize = 15, string search = "")
        {
            try
            {
                // Query para la DDBB
                IQueryable<Recipe> query = _recipeContext.Recipes
                    .Include(r => r.User)
                    .Include(r => r.RecipeTag);

                // Filtrar si 'search' no está vacío
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(r => r.Title.Contains(search) || r.User!.Email.Contains(search) || r.User.UserName.Contains(search));
                }

                // Calculo total de recetas en la BD y de páginas
                var totalRecipes = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalRecipes / (double)pageSize);

                // Verificar si la página solicitada está dentro del rango o si no hay páginas
                if (totalPages == 0)
                {
                    // No hay usuarios que coincidan con el filtro o no hay recetas en absoluto
                    return Ok(new { Recipes = new List<RecipeDto>(), PageInfo = new { CurrentPage = 0, TotalPages = 0, PageSize = pageSize, TotalRecipes = 0 } });
                }
                else if (page < 1 || page > totalPages)
                {
                    return BadRequest(new { Message = $"Page {page} is out of bounds. Please enter a page number between 1 and {totalPages}." });
                }

                // Calculo total de documentos a omitir dependiendo de la pagina solicitada
                int skip = (page - 1) * pageSize;

                // Obtener la página de recetas solicitada
                var recipes = await query
                   .OrderBy(r => r.Title)
                   .Skip(skip)
                   .Take(pageSize)
                   .Select(r => new RecipeDto
                   {
                       ID = r.RecipeID,
                       UserName = r.User!.UserName,
                       Email = r.User.Email,
                       Title = r.Title,
                       PreparationTime = r.PreparationTime,
                       ServingsNumber = r.ServingsNumber,
                       TagName = r.RecipeTag != null ? r.RecipeTag.TagName : null,
                       IsPublish = r.IsPublish
                   })
                   .ToListAsync();

                // Retornar la lista de recetas paginada junto con información de la paginación
                return Ok(new { Recipes = recipes, PageInfo = new { CurrentPage = page, TotalPages = totalPages, PageSize = pageSize, TotalRecipes = totalRecipes } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Método de búsqueda avanzado para la Home page
        [HttpGet("paged/home/{email}")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipesPagedHome(string email, int pageParam = 1, int pageSize = 15, bool sortByLikes = false, string inputValue = "", int category = 0, int maxTime = 0)
        {

            try
            {

                // Obtener los tags de interes del usuario
                var user = await _recipeContext.Users
                    .Include(u => u.UserTags!)
                    .ThenInclude(ut => ut.RecipeTag)
                    .SingleOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Obtener los IDs de los tags asociados al usuario
                var userTagIds = user.UserTags?.Select(ut => ut.RecipeTagID).ToArray() ?? Array.Empty<int>();     

                // Continuar con la query base que ya filtra por publicación
                IQueryable<Recipe> baseQuery = _recipeContext.Recipes
                    .Where(r => r.IsPublish == true);

                // Filtrar si 'search' no está vacío
                if (!string.IsNullOrWhiteSpace(inputValue))
                {
                    baseQuery = baseQuery.Where(r => r.Title.Contains(inputValue) || r.Ingredients.Contains(inputValue) || r.User!.UserName.Contains(inputValue));
                }

                // Filtrar por categoría en caso de haber elegido una
                if (category != 0)
                {
                    baseQuery = baseQuery.Where(r => r.RecipeTagID == category);
                }

                // Restricción de tiempo máximo
                if (maxTime > 0)
                {
                    baseQuery = baseQuery.Where(r => r.PreparationTime <= maxTime);
                }

                if (userTagIds.Any() && category == 0)
                {
                    baseQuery = baseQuery.Select(r => new
                    {
                        Recipe = r,
                        Priority = userTagIds.Contains(r.RecipeTagID) ? 0 : 1
                    })
                        .OrderBy(x => x.Priority)
                        .ThenBy(x => x.Recipe.RecipeID)
                        .Select(x => x.Recipe);
                }
                else
                {
                    baseQuery = baseQuery.OrderBy(r => r.RecipeID);
                }

                if (sortByLikes)
                {
                    baseQuery = baseQuery
                        .GroupJoin(_recipeContext.RecipeLikes, r => r.RecipeID, rl => rl.RecipeID, (r, rl) => new { Recipe = r, Likes = rl.Count() })
                        .OrderByDescending(x => x.Likes)
                        .Select(x => x.Recipe);
                }

                // Calculo de recetas a omitir dependiendo de la página solicitada
                int skip = (pageParam - 1) * pageSize;

                // Obtener la página de recetas solicitada
                var recipes = await baseQuery
                    .Include(r => r.User)
                    .Include(r => r.RecipeTag)
                    .Select(r => new RecipeDto
                    {
                        ID = r.RecipeID,
                        UserName = r.User!.UserName,
                        Title = r.Title,
                        ImageUrl = r.ImageUrl,
                        PreparationTime = r.PreparationTime,
                        ServingsNumber = r.ServingsNumber,
                        TagName = r.RecipeTag!.TagName,
                        IsPublish = r.IsPublish
                    })
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    data = recipes,
                    nextCursor = recipes.Count < pageSize ? (int?)null : pageParam + 1
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Obtener todas las recetas del usuario actual
        [HttpGet("user/{email}")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetUserRecipes(string email, int pageParam = 1, int pageSize = 10, bool isPublish = true, string search = "")
        {
            try
            {
                // Buscar el ID del usuario por email
                var user = await _recipeContext.Users.SingleOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Calculo de recetas a omitir dependiendo de la página solicitada
                int skip = (pageParam - 1) * pageSize;

                // Crear la consulta base de recetas
                IQueryable<Recipe> baseQuery = _recipeContext.Recipes
                    .Where(r => r.UserID == user.UserID && r.IsPublish == isPublish);

                // Filtrar por el título de la receta si se proporciona un término de búsqueda
                if (!string.IsNullOrEmpty(search))
                {
                    baseQuery = baseQuery.Where(r => r.Title.Contains(search));
                }

                // Obtener las recetas del usuario paginadas y ordenadas
                var recipes = await baseQuery
                    .Include(r => r.User)
                    .Include(r => r.RecipeTag)
                    .OrderBy(r => r.RecipeID)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var recipesDto = new List<RecipeDto>();

                foreach (var recipe in recipes)
                {
                    recipesDto.Add(new RecipeDto
                    {
                        ID = recipe.RecipeID,
                        UserName = user.UserName,
                        Title = recipe.Title,
                        PreparationTime = recipe.PreparationTime,
                        ServingsNumber = recipe.ServingsNumber,
                        ImageUrl = recipe.ImageUrl,
                        Steps = recipe.Steps,
                        Ingredients = recipe.Ingredients,
                        TagName = recipe.RecipeTag?.TagName,
                        IsPublish = recipe.IsPublish,
                    });
                }

                return Ok(new
                {
                    data = recipesDto,
                    nextCursor = recipes.Count < pageSize ? (int?)null : pageParam + 1
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Obtener todas las recetas del usuario actual (weeklyPlanner)
        [HttpGet("user/planner/{email}")]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetUserRecipesWeeklyPlanner(string email, string search = "")
        {
            try
            {
                // Buscar el ID del usuario por email
                var user = await _recipeContext.Users.SingleOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Si el término de búsqueda está vacío, no devolver nada
                if (string.IsNullOrEmpty(search))
                {
                    return Ok(new List<RecipeDto>());
                }

                // Crear la consulta base de recetas
                IQueryable<Recipe> baseQuery = _recipeContext.Recipes
                    .Where(r => r.UserID == user.UserID);

                // Filtrar por el título de la receta si se proporciona un término de búsqueda        
                baseQuery = baseQuery.Where(r => r.Title.Contains(search));

                // Obtener todas las recetas del usuario y ordenarlas
                var recipes = await baseQuery
                    .Include(r => r.User)
                    .Include(r => r.RecipeTag)
                    .OrderBy(r => r.RecipeID)
                    .ToListAsync();

                var recipesDto = new List<RecipeDto>();

                foreach (var recipe in recipes)
                {
                    recipesDto.Add(new RecipeDto
                    {
                        ID = recipe.RecipeID,
                        UserName = user.UserName,
                        Title = recipe.Title,
                    });
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
            try
            {
                var recipe = await _recipeContext.Recipes
                    .Include(r => r.User)
                    .Include(r => r.RecipeTag)
                    .FirstOrDefaultAsync(r => r.RecipeID == id);

                if (recipe == null)
                {
                    return NotFound();
                }

                var recipeDto = new RecipeDto
                {
                    ID = recipe.RecipeID,
                    UserName = recipe.User?.UserName,
                    Title = recipe.Title,
                    PreparationTime = recipe.PreparationTime,
                    ServingsNumber = recipe.ServingsNumber,
                    ImageUrl = recipe.ImageUrl,
                    Steps = recipe.Steps,
                    Ingredients = recipe.Ingredients,
                    TagName = recipe.RecipeTag?.TagName,
                    IsPublish = recipe.IsPublish,
                    Calories = recipe.Calories,
                    Fat = recipe.Fat,
                    Protein = recipe.Protein,
                    Carbohydrate = recipe.Carbohydrate
                };
                return Ok(recipeDto);
                

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error {ex.Message}" });
            }
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

                // Procesar la entrada de ingredientes para manejar ambos formatos
                var ingredientsList = recipeInsertDto.Ingredients
                                    .Split(new[] { ',', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                                    .Select(ingredient => ingredient.Trim())
                                    .ToList();

                // Obtener información nutricional
                var nutritionInfo = await _edamamNutritionService.GetNutritionInfoAsync(ingredientsList);

                // Datos S3 AWS
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

                // Generar la URL de la imagen
                var imageUrl = $"https://{bucketName}.s3.eu-west-3.amazonaws.com/{imageFileName}";

                var recipe = new Recipe
                {
                    UserID = user.UserID,
                    Title = recipeInsertDto.Title,
                    PreparationTime = recipeInsertDto.PreparationTime,
                    ServingsNumber = recipeInsertDto.ServingsNumber,
                    RecipeImage = imageFileName,
                    ImageUrl = imageUrl,
                    Steps = recipeInsertDto.Steps,
                    Ingredients = recipeInsertDto.Ingredients,
                    RecipeTagID = recipeInsertDto.RecipeTagID,
                    Calories = nutritionInfo?.Calories ?? 0,  
                    Carbohydrate = nutritionInfo?.TotalNutrients?.Carbohydrate?.Quantity ?? 0, 
                    Fat = nutritionInfo?.TotalNutrients?.Fat?.Quantity ?? 0,  
                    Protein = nutritionInfo?.TotalNutrients?.Protein?.Quantity ?? 0

                };

                _recipeContext.Recipes.Add(recipe);
                await _recipeContext.SaveChangesAsync();

                var recipeDto = new RecipeDto
                {
                    ID = recipe.RecipeID,
                    Title = recipeInsertDto.Title,
                    PreparationTime = recipeInsertDto.PreparationTime,
                    ServingsNumber = recipeInsertDto.ServingsNumber,
                    ImageUrl = imageFileName,
                    Steps = recipeInsertDto.Steps,
                    Ingredients = recipeInsertDto.Ingredients,
                    TagName = recipe.RecipeTag?.TagName
                };

                return CreatedAtAction(nameof(GetRecipeById), new { id = recipe.RecipeID }, recipeDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Publicar Receta existente
        [HttpPost("publish/{id}")]
        public async Task<IActionResult> PublishRecipe(int id)
        {
            try
            {
                var recipe = await _recipeContext.Recipes
                    .FirstOrDefaultAsync(r => r.RecipeID == id);

                if (recipe == null)
                {
                    return NotFound(new { Message = "Recipe not found." });
                }

                recipe.IsPublish = true;
                await _recipeContext.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Eliminar una receta dada su ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            try
            {
                var recipe = await _recipeContext.Recipes
                    .FirstOrDefaultAsync(r => r.RecipeID == id);

                if (recipe == null)
                {
                    return NotFound(new { Message = "Recipe not found." });
                }

                // Eliminar la imagen en S3
                var client = new AmazonS3Client();
                var bucketName = "i72cascm-recipes-web-app";
                var deleteRequest = new DeleteObjectRequest
                {
                    BucketName = bucketName,
                    Key = recipe.RecipeImage
                };
                await client.DeleteObjectAsync(deleteRequest);

                // Eliminar los likes asociados a la receta
                var recipeLikes = await _recipeContext.RecipeLikes
                    .Where(rl => rl.RecipeID == recipe.RecipeID)
                    .ToListAsync();
                _recipeContext.RecipeLikes.RemoveRange(recipeLikes);

                // Eliminar los comentarios asociados a la receta
                var recipeComments = await _recipeContext.RecipeComments
                        .Where(rc => rc.RecipeID == recipe.RecipeID)
                        .ToListAsync();
                    _recipeContext.RecipeComments.RemoveRange(recipeComments);

                // Eliminar los eventos asociados a la receta
                var recipeEvents = await _recipeContext.WeeklyPlannerEvents
                    .Where(wpe => wpe.RecipeID == recipe.RecipeID)
                    .ToListAsync();
                _recipeContext.WeeklyPlannerEvents.RemoveRange(recipeEvents);

                // Eliminar la receta de la base de datos
                _recipeContext.Recipes.Remove(recipe);
                await _recipeContext.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

        // Eliminar todas las recetas de un usuario dado su email
        [HttpDelete("user/{email}")]
        public async Task<IActionResult> DeleteUserRecipes(string email)
        {
            try
            {
                // Buscar el usuario por email
                var user = await _recipeContext.Users.SingleOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found." });
                }

                // Obtener todas las recetas del usuario
                var userRecipes = await _recipeContext.Recipes
                    .Where(r => r.UserID == user.UserID)
                    .ToListAsync();

                if (userRecipes.Count == 0)
                {
                    return Ok(new { Message = "No recipes found for this user." });
                }

                // Eliminar las imágenes de S3
                var client = new AmazonS3Client();
                var bucketName = "i72cascm-recipes-web-app";
                foreach (var recipe in userRecipes)
                {
                    // Eliminar los likes asociados a la receta
                    var recipeLikes = await _recipeContext.RecipeLikes
                        .Where(rl => rl.RecipeID == recipe.RecipeID)
                        .ToListAsync();
                    _recipeContext.RecipeLikes.RemoveRange(recipeLikes);

                    // Eliminar los comentarios asociados a la receta
                    var recipeComments = await _recipeContext.RecipeComments
                        .Where(rc => rc.RecipeID == recipe.RecipeID)
                        .ToListAsync();
                    _recipeContext.RecipeComments.RemoveRange(recipeComments);

                    // Eliminar los eventos asociados a la receta
                    var recipeEvents = await _recipeContext.WeeklyPlannerEvents
                        .Where(wpe => wpe.RecipeID == recipe.RecipeID)
                        .ToListAsync();
                    _recipeContext.WeeklyPlannerEvents.RemoveRange(recipeEvents);

                    // Eliminar imagen asociada en el bucket de AWS S3
                    var deleteRequest = new DeleteObjectRequest
                    {
                        BucketName = bucketName,
                        Key = recipe.RecipeImage
                    };
                    await client.DeleteObjectAsync(deleteRequest);
                }

                // Eliminar las recetas de la base de datos
                _recipeContext.Recipes.RemoveRange(userRecipes);
                await _recipeContext.SaveChangesAsync();

                return Ok(new { Message = "All recipes deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
            }
        }

    }
}
