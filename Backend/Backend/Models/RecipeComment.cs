using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models;

namespace Backend.Modelos
{
    public class RecipeComment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RecipeCommentID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        [ForeignKey("Recipe")]
        public int RecipeID { get; set; }

        [Required]
        [MaxLength(300)]
        public required string Comment { get; set; }

        public DateTime CreatedAt { get; set; }

        public int? ParentCommentID { get; set; }
    }
}
