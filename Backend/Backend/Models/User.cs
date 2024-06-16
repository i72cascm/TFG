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
        public string Email { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string LastNames { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }

        public DateOnly BirthDate { get; set; }

        public List<Recipe> Recipes { get; set; }

        public string Role { get; set; }

        public Boolean Validate { get; set; }

        public string ValidateToken { get; set; }

        public string ResetPasswordToken { get; set; }
    }
}
