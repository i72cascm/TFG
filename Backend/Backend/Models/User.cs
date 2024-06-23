using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using Backend.Models;

namespace Backend.Modelos
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserID { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string LastNames { get; set; }

        [Required]
        public required string UserName { get; set; }

        [Required]
        public required string Password { get; set; }

        public DateOnly BirthDate { get; set; }

        public List<Recipe>? Recipes { get; set; }

        public required string Role { get; set; }

        public Boolean Validate { get; set; }

        public required string ValidateToken { get; set; }

        public required string ResetPasswordToken { get; set; }

        // Lista de UserTags para gestionar la relación con los tags
        public List<UserTag>? UserTags { get; set; }
    }
}
