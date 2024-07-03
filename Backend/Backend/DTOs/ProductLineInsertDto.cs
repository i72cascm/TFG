using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class ProductLineInsertDto
    {
        [Required]
        public required string ProductName { get; set; }

        [Required]
        public int Amount { get; set; }

        [Required]
        public float Price { get; set; }

    }
}
