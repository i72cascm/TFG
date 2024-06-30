using Backend.Modelos;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Filters;
using Backend.DTOs;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class ShoppingListController : Controller
    {
        private readonly DBContext _shoppingListContext;

        public ShoppingListController(DBContext shoppingListContext)
        {
            _shoppingListContext = shoppingListContext;
        }

        // Obtener todas las listas de compra de un usuario
        [HttpGet("{email}")]
        public async Task<ActionResult<ShoppingList>> GetShoppingListsByEmail(string email)
        {
            // Buscar al usuario por email
            var user = await _shoppingListContext.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            // Buscar sus listas de compra
            var shoppingLists = await _shoppingListContext.ShoppingLists
                               .Where(sl => sl.UserID == user.UserID)
                               .Select(sl => new ShoppingListDto
                               {
                                   ShoppingListID = sl.ShoppingListID,
                                   ShoppingListName = sl.ShoppingListName,
                                   Total = sl.Total
                               })
                               .ToListAsync();


            // Si el usuario no tiene listas de recetas, regresar lista vacía
            if (shoppingLists == null)
            {
                return Ok(new List<ShoppingList>());
            }

            return Ok(shoppingLists);
        }

        public class NewListRequest
        {
            public required string NameList { get; set; }
        }

        [HttpPost("{email}")]
        public async Task<ActionResult<ShoppingList>> UpdateUserTags(string email, [FromBody] NewListRequest request)
        {
            // Buscar al usuario por email
            var user = await _shoppingListContext.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            // Crear nueva lista de compra
            var newShoppingList = new ShoppingList
            {
                UserID = user.UserID,
                ShoppingListName = request.NameList,
                Total = 0,
                ProductLines = new List<ProductLine>() // Inicializar la lista de líneas de producto
            };

            _shoppingListContext.ShoppingLists.Add(newShoppingList);
            await _shoppingListContext.SaveChangesAsync();

            return Ok(newShoppingList);
        }
    }
}
