﻿namespace Backend.DTOs
{
    public class RecipeDto
    {
        public int ID { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public required string Title { get; set; }
        public int PreparationTime { get; set; }
        public int ServingsNumber { get; set; }
        public string? ImageUrl { get; set; }
        public string? Steps { get; set; }
        public string? Ingredients { get; set; }
        public int? TagId { get; set; }
        public string? TagName { get; set; }
        public bool IsPublish {  get; set; }
        public bool Pending { get; set; }
        public float Calories { get; set; }
        public float Fat { get; set; }
        public float Protein { get; set; }
        public float Carbohydrate { get; set; }
    }
}