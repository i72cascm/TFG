namespace Backend.DTOs
{
    public class ShoppingListInsertDto
    {
        public required string Email { get; set; }
        public required string ShoppingListName { get; set; }
    }
}
