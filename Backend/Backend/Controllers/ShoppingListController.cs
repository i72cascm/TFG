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

        ///////////////////////////////////////////////////////////////////////////////
        /////////////////////////// SHOPPING LISTS ////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////

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
                                   ShoppingListName = sl.ShoppingListName
                               })
                               .ToListAsync();


            // Si el usuario no tiene listas de recetas, regresar lista vacía
            if (shoppingLists == null)
            {
                return Ok(new List<ShoppingList>());
            }

            return Ok(shoppingLists);
        }

        [HttpPost("{email}")]
        public async Task<ActionResult<ShoppingList>> UpdateUserTags(string email, [FromBody] ShoppingListInsertDto request)
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
                ProductLines = new List<ProductLine>() // Inicializar la lista de líneas de producto
            };

            _shoppingListContext.ShoppingLists.Add(newShoppingList);
            await _shoppingListContext.SaveChangesAsync();

            return Ok(newShoppingList);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShoppingList(int id)
        {
            // Find the shopping list by ID
            var shoppingList = await _shoppingListContext.ShoppingLists
                .FirstOrDefaultAsync(sl => sl.ShoppingListID == id);

            if (shoppingList == null)
            {
                return NotFound(new { Message = "Shopping list not found." });
            }

            // Remove the shopping list from the context
            _shoppingListContext.ShoppingLists.Remove(shoppingList);
            await _shoppingListContext.SaveChangesAsync();

            return Ok(new { Message = "Shopping list deleted successfully." });
        }

        ///////////////////////////////////////////////////////////////////////////////
        /////////////////////////// PRODUCT lINES /////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////

        // Get all product lines associated with a specific shopping list
        [HttpGet("productLines/{shoppingListID}")]
        public async Task<ActionResult<List<ProductLine>>> GetProductLinesByShoppingListId(int shoppingListID)
        {
            // Find the shopping list by ID to ensure it exists
            var shoppingList = await _shoppingListContext.ShoppingLists
                .FirstOrDefaultAsync(sl => sl.ShoppingListID == shoppingListID);

            if (shoppingList == null)
            {
                return NotFound(new { Message = "Shopping list not found." });
            }

            // Fetch the product lines associated with the shopping list
            var productLines = await _shoppingListContext.ProductLines
                .Where(pl => pl.ShoppingListID == shoppingListID)
                .ToListAsync();

            return Ok(productLines);
        }

        [HttpPost("productLines/{shoppingListID}")]
        public async Task<ActionResult<ProductLine>> AddProductLine(int shoppingListID, [FromBody] ProductLineInsertDto productLineDto)
        {
            // Encuentra la lista de compras a la que pertenecerá la nueva línea
            var shoppingList = await _shoppingListContext.ShoppingLists
                .FirstOrDefaultAsync(sl => sl.ShoppingListID == shoppingListID);

            if (shoppingList == null)
            {
                return NotFound(new { Message = "Shopping list not found." });
            }

            // Crea la nueva línea de producto
            var newProductLine = new ProductLine
            {
                ShoppingListID = shoppingListID,
                ProductName = productLineDto.ProductName,
                Amount = productLineDto.Amount,
                Price = productLineDto.Price
            };

            _shoppingListContext.ProductLines.Add(newProductLine);
            await _shoppingListContext.SaveChangesAsync();

            return Ok(newProductLine);
        }

        [HttpPut("productLines/{productLineID}")]
        public async Task<ActionResult<ProductLine>> UpdateProductLine(int productLineID, [FromBody] ProductLineInsertDto productLineDto)
        {
            var productLine = await _shoppingListContext.ProductLines
                .FirstOrDefaultAsync(pl => pl.ProductLineID == productLineID);

            if (productLine == null)
            {
                return NotFound(new { Message = "Product line not found." });
            }

            productLine.ProductName = productLineDto.ProductName;
            productLine.Amount = productLineDto.Amount;
            productLine.Price = productLineDto.Price;

            await _shoppingListContext.SaveChangesAsync();

            return Ok(productLine);
        }

        [HttpDelete("productLines/{productLineID}")]
        public async Task<IActionResult> DeleteProductLine(int productLineID)
        {
            var productLine = await _shoppingListContext.ProductLines
                .FirstOrDefaultAsync(pl => pl.ProductLineID == productLineID);

            if (productLine == null)
            {
                return NotFound(new { Message = "Product line not found." });
            }

            _shoppingListContext.ProductLines.Remove(productLine);
            await _shoppingListContext.SaveChangesAsync();

            return Ok(new { Message = "Product line deleted successfully." });
        }

    }
}
