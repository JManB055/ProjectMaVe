namespace ProjectMaVe.Pages.Workouts
{
    public class SaveWorkoutRequest
    {
        public int? WorkoutID { get; set; } // null for new workouts
        public string WorkoutDate { get; set; } = string.Empty;
        public List<ExerciseData> Exercises { get; set; } = new();
    }

    public class ExerciseData
    {
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public int? Sets { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public int? Duration { get; set; }
        public decimal? Distance { get; set; }
    }
}
