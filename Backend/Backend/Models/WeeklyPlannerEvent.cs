using Backend.Modelos;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class WeeklyPlannerEvent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EventID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; } 

        [ForeignKey("Recipe")]
        public int RecipeID { get; set; } 

        [Required]
        public required string Title { get; set; }

        [Required]
        public DateTime Start { get; set; }

        [Required]
        public DateTime End { get; set; }

    }
}
