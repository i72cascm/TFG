namespace Backend.DTOs
{
    public class ShoppingListDto
    {
        public int ShoppingListID { get; set; }
        public required string ShoppingListName { get; set; }
        public float Total { get; set; }
    }
}
