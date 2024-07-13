namespace Backend.DTOs
{
    public class RecipeDto
    {
        public int ID { get; set; }
        public string? UserName { get; set; }
        public required string Title { get; set; }
        public int PreparationTime { get; set; }
        public int ServingsNumber { get; set; }
        public required string RecipeImage { get; set; }
        public required string Steps { get; set; }
        public required string Ingredients { get; set; }
        public string? TagName { get; set; }
        public bool IsPublish {  get; set; }
    }
}