using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models;

namespace Backend.Modelos
{
    public class UserTag
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserTagID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        [ForeignKey("RecipeTag")]
        public int RecipeTagID { get; set; }

        public User? User { get; set; }
        public RecipeTag? RecipeTag { get; set; }

    }
}
