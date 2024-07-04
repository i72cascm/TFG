using Backend.Modelos;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options) : base(options)
        { }

        public DbSet<User> Users { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<RecipeTag> RecipeTags { get; set; }
        public DbSet<UserTag> UserTags { get; set; }
        public DbSet<ShoppingList> ShoppingLists { get; set; }
        public DbSet<ProductLine> ProductLines { get; set; }
        public DbSet<RecipeLike> RecipeLikes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Email debe ser único
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Username debe ser único
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UserName)
                .IsUnique();

            // Configuración de la relación uno a muchos entre User y Recipe
            modelBuilder.Entity<User>()
                .HasMany(u => u.Recipes)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserID);

            // Configuración para la relación uno a muchos entre User y UserTags
            modelBuilder.Entity<User>()
                .HasMany(u => u.UserTags)
                .WithOne(ut => ut.User)
                .HasForeignKey(ut => ut.UserID)
                .OnDelete(DeleteBehavior.Cascade); // Asegurar la eliminación en cascada (eliminar al usuario implica eliminar sus tags)

            // Configuración para la relación uno a muchos entre RecipeTag y UserTag
            modelBuilder.Entity<UserTag>()
                .HasOne(ut => ut.RecipeTag)
                .WithMany()
                .HasForeignKey(ut => ut.RecipeTagID)
                .OnDelete(DeleteBehavior.Cascade);

            // Asegura que un usuario no tenga una tag repetida en sus intereses
            modelBuilder.Entity<UserTag>()
                .HasIndex(ut => new { ut.UserID, ut.RecipeTagID })
                .IsUnique();

            // Configuración de la relación uno a muchos entre User y ShoppingList
            modelBuilder.Entity<User>()
                .HasMany(u => u.ShoppingLists)
                .WithOne()
                .HasForeignKey(sl => sl.UserID)
                .OnDelete(DeleteBehavior.Cascade);


            // Configuración de la relación uno a muchos entre ShoppingList y ProductLine
            modelBuilder.Entity<ShoppingList>()
                .HasMany(sl => sl.ProductLines) 
                .WithOne() 
                .HasForeignKey(pl => pl.ShoppingListID)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuración de la relación muchos-a-muchos para RecipeLikes sin eliminación en cascada
            modelBuilder.Entity<RecipeLike>()
                .HasKey(rl => new { rl.UserID, rl.RecipeID });  // Clave primaria compuesta

            modelBuilder.Entity<RecipeLike>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(rl => rl.UserID)
                .OnDelete(DeleteBehavior.Restrict);  // Cambio a Restrict para evitar problemas de cascada

            modelBuilder.Entity<RecipeLike>()
                .HasOne<Recipe>()
                .WithMany()
                .HasForeignKey(rl => rl.RecipeID)
                .OnDelete(DeleteBehavior.Restrict);  // Cambio a Restrict para evitar problemas de cascada

            // Añadir índice único para prevenir likes duplicados
            modelBuilder.Entity<RecipeLike>()
                .HasIndex(rl => new { rl.UserID, rl.RecipeID })
                .IsUnique();
        }
    }
}
