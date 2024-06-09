namespace Backend.DTOs
{
    public class RecipeInsertDto
    {
        public string UserEmail { get; set; }
        public string Title { get; set; }
        public int PreparationTime { get; set; }
        public int ServingsNumber { get; set; }
        public string RecipeImage { get; set; }
        public string Steps { get; set; }
        public string Ingredients { get; set; }
        public string Tag { get; set; }
    }
}