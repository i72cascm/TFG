namespace Backend.DTOs
{
    public class ShoppingListInsertDto
    {
        public required string NameList { get; set; }
        public string? Ingredients { get; set; }
    }
}
