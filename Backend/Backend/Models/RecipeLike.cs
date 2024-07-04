using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models;

namespace Backend.Modelos
{
    public class RecipeLike
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RecipeLikeID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        [ForeignKey("Recipe")]
        public int RecipeID { get; set; }

    }
}
