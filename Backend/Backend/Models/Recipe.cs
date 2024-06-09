using System.ComponentModel.DataAnnotations;
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

        public string Title { get; set; }

        public int PreparationTime { get; set; }

        public int ServingsNumber { get; set; }

        [Required]
        public string RecipeImage { get; set; }

        [Required]
        public string Steps {  get; set; }

        [Required]
        public string Ingredients { get; set; }

        [Required]
        public string Tag { get; set; }

        public User User { get; set; }

    }
}
