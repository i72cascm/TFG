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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Email debe ser único
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email )
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
        }
    }
}
