﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using Backend.Models;

namespace Backend.Modelos
{
    public class Recipe
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RecipeID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        [Required]
        public required string Title { get; set; }

        [Required]
        public int PreparationTime { get; set; }

        [Required]
        public int ServingsNumber { get; set; }

        [Required]
        public required string RecipeImage { get; set; }

        [Required]
        public required string ImageUrl { get; set; }

        [Required]
        public required string Steps {  get; set; }

        [Required]
        public required string Ingredients { get; set; }

        public float Calories { get; set; }

        public float Fat { get; set; }

        public float Protein { get; set; }

        public float Carbohydrate { get; set; }

        [ForeignKey("RecipeTag")]
        public int RecipeTagID { get; set; }

        [Required]
        public bool IsPublish {  get; set; }

        [Required]
        public bool Pending { get; set; }

        public User? User { get; set; }
        public RecipeTag? RecipeTag { get; set; }

    }
}
