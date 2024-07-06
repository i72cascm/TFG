using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class RecipeCommentInsertDto
    {
        [Required]
        public int RecipeID { get; set; }

        [Required]
        [MaxLength(300)]
        public required string Comment { get; set; }

        public int? ParentCommentID { get; set; }
    }
}
