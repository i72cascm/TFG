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
        }
    }
}
