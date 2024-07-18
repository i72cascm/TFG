namespace Backend.Modelos
{
    using System.Collections.Generic;

    public class EdamamRecipe
    {
        public string? Q { get; set; }
        public int From { get; set; }
        public int To { get; set; }
        public bool More { get; set; }
        public int Count { get; set; }
        public List<Hit>? Hits { get; set; }
    }

    public class Hit
    {
        public RecipeLabel? Recipe { get; set; }
    }

    public class RecipeLabel
    {
        public string? Label { get; set; }
        public string? Image { get; set; }
        public string? Url { get; set; }
    }

    public class RecipeInfo
    {
        public string? Label { get; set; }
        public string? Image { get; set; }
        public string? Url { get; set; }
    }

    public class RecipeSearchModel
    {
        public required string Query { get; set; }
        public required List<string> Tags { get; set; }
    }
}
