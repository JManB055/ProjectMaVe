//using ProjectMaVe.Data.Entities;
using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Data;
using ProjectMaVe.Models;
using System.Reflection.Metadata;

namespace ProjectMaVe.Data
{
    public class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserInfo>()
                .Property(b => b.UserID)
                .ValueGeneratedOnAdd()
                .IsRequired();
        }

        public DbSet<UserInfo> Users { get; set; }

        public DbSet<Workout> Workouts { get; set; }

        public DbSet<Exercise> Exercises { get; set; }

        public DbSet<WorkoutExercise> WorkoutExercises { get; set; }
    }
}
