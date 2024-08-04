using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class WeeklyPlannerInsertDto
    {
        public required string EventID { get; set; }
        public int RecipeID { get; set; }
        public required string Title { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
}
