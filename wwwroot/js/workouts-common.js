// TODO: Somehow verify user???????
async function getWorkoutExercises(workoutId) {
    try {
        const response = await fetch(`/Workout?handler=WorkoutExercises&workoutId=${workoutId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            console.log('Workout exercises loaded:', result.exercises);
            workoutExercises = result.exercises;
            renderWorkoutExercises(workoutExercises); // optional
        } else {
            console.warn('Failed to load workout exercises:', result.message);
        }
    } catch (error) {
        console.error('Error loading workout exercises:', error);
    }
}

// TODO: Somehow verify user???????
async function saveWorkoutExercises(workoutId, exercises) {
    try {
        const payload = {
            workoutID: workoutId,
            exercises: exercises
        };

        const response = await fetch('/Workout?handler=SaveWorkoutExercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            console.log('Workout exercises saved successfully!');
        } else {
            console.warn('Failed to save workout exercises:', result.message);
        }
    } catch (error) {
        console.error('Error saving workout exercises:', error);
    }
}
