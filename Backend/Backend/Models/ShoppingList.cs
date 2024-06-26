using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models;

namespace Backend.Modelos
{
    public class ShoppingList
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ShoppingListID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        [Required]
        public required string Name { get; set; }

        public float Total { get; set; }

        public User? User { get; set; }

        // Lista de ProductLine para gestionar la relación con las líneas de producto
        public List<ProductLine>? ProductLines { get; set; }
    }
}
