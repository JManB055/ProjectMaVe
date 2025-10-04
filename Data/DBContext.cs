//using ProjectMaVe.Data.Entities;
using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Data;
using ProjectMaVe.Models;

namespace ProjectMaVe.Data
{
    public class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }



        public DbSet<UserInfo> Users { get; set; }

        public DbSet<Workout> Workouts { get; set; }

        public DbSet<Exercise> Exercises { get; set; }

        public DbSet<WorkoutExercise> WorkoutExercises { get; set; }
    }
}
