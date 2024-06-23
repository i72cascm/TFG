namespace Backend.DTOs
{
    public class RecipeInsertDto
    {
        public required string UserEmail { get; set; }
        public required string Title { get; set; }
        public int PreparationTime { get; set; }
        public int ServingsNumber { get; set; }
        public required string RecipeImage { get; set; }
        public required string Steps { get; set; }
        public required string Ingredients { get; set; }
        public int RecipeTagID { get; set; }
    }
}