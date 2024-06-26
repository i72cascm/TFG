using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Models;

namespace Backend.Modelos
{
    public class ProductLine
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductLineID { get; set; }

        [ForeignKey("ShoppingList")]
        public int ShoppingListID { get; set; }

        [Required]
        public int Amount { get; set; }

        [Required]
        public float Price { get; set; }

        public ShoppingList? ShoppingList { get; set; }
    }
}
