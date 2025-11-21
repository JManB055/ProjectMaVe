document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM ELEMENTS =====
    const workoutForm = document.getElementById("workoutForm");
    const workoutDateInput = document.getElementById("workoutDate");
    const addStrengthExerciseBtn = document.getElementById("addStrengthExerciseBtn");
    const addCardioActivityBtn = document.getElementById("addCardioActivityBtn");
    const strengthExerciseTableBody = document.getElementById("strengthExerciseTableBody");
    const cardioTableBody = document.getElementById("cardioTableBody");

    // ===== AVAILABLE EXERCISES (will be fetched from DB) =====
    var availableExercises = [];
    /* Static test variables:
    var availableExercises = [
        { name: "Bench Press", muscle: "Chest" },
        { name: "Incline Press", muscle: "Chest" },
        { name: "Shoulder Press", muscle: "Shoulders" },
        { name: "Lateral Raise", muscle: "Shoulders" },
        { name: "Squat", muscle: "Legs" },
        { name: "Leg Press", muscle: "Legs" },
        { name: "Deadlift", muscle: "Back" },
        { name: "Pull-ups", muscle: "Back" },
        { name: "Lat Pulldown", muscle: "Back" },
        { name: "Barbell Row", muscle: "Back" },
        { name: "Bicep Curl", muscle: "Arms" },
        { name: "Tricep Extension", muscle: "Arms" },
        { name: "Plank", muscle: "Core" },
        { name: "Crunches", muscle: "Core" },
    ];

    const cardioActivities = [
        "Running",
        "Cycling",
        "Swimming",
        "Rowing",
        "Elliptical",
        "Stair Climber",
        "Jump Rope",
        "Walking",
    ];
    */

    // ===== INITIALIZE =====
    async function init() {
        // Fetch exercises from database
        await fetchExercisesFromDB();
        
        // Set default date to today
        if (workoutDateInput) {
            const today = new Date().toISOString().split('T')[0];
            workoutDateInput.value = today;
        }

        // Add one default strength exercise row
        createStrengthRow();
    }

    // ===== API FUNCTIONS =====
    async function fetchExercisesFromDB() {
        try {
            // Get the anti-forgery token (handle if it doesn't exist)
            const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
            const headers = { 'Content-Type': 'application/json' };
            
            if (tokenInput) {
                headers['RequestVerificationToken'] = tokenInput.value;
            }

            const response = await fetch(`/Workouts/Add?handler=Exercises`, {
                method: 'GET',
                headers: headers
            });

            const result = await response.json();
            // console.log("Raw Response: ", result);

            if (result.success) {
                console.log('Workouts loaded successfully:', result.exercises);
                availableExercises = result.exercises; // Replace current availableExercises array
            } else {
                console.warn('Failed to load workouts:', result.message);
            }

        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    }

    async function saveWorkout(workoutData) {
        try {
            console.log("Sending data:", workoutData);
            
            // Get the anti-forgery token (handle if it doesn't exist)
            const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
            const headers = { 'Content-Type': 'application/json' };
            
            if (tokenInput) {
                headers['RequestVerificationToken'] = tokenInput.value;
            }
            
            const response = await fetch('/Workouts/Add?handler=SaveWorkoutExercises', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    workoutDate: workoutData.workout_date,
                    exercises: workoutData.exercises
                })
            });

            console.log("Response status:", response.status);
            const result = await response.json();
            console.log("Response data:", result);

            if (result.success) {
                showSuccess("Workout logged successfully!");
                setTimeout(() => {
                    window.location.href = "/Workouts";
                }, 500);
            } else {
                showError(result.message || "Failed to save workout");
            }
        } catch (error) {
            console.error("Error saving workout:", error);
            showError("Failed to save workout. Please try again.");
        }
    }

    // ===== CREATE EXERCISE ROWS =====
    function createStrengthRow() {
        const tr = document.createElement("tr");

        const exerciseOptions = availableExercises
            .filter(ex => ex.muscleGroup !== "Speed" && ex.muscleGroup !== "Endurance")
            .map(ex => `<option value="${ex.exerciseID}" data-muscle="${ex.muscleGroup}">${ex.name}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select exercise-select rounded-3" required>
                    <option value="" disabled selected>Select exercise</option>
                    ${exerciseOptions}
                </select>
            </td>
            <td><input type="text" class="form-control rounded-3 muscle-input" placeholder="Auto-filled" readonly></td>
            <td><input type="number" class="form-control rounded-3 sets-input" min="1" placeholder="Sets" required></td>
            <td><input type="number" class="form-control rounded-3 reps-input" min="1" placeholder="Reps" required></td>
            <td><input type="number" class="form-control rounded-3 weight-input" min="0" step="0.5" placeholder="lbs"></td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-btn" title="Remove exercise">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Auto-fill muscle group on exercise selection
        const select = tr.querySelector(".exercise-select");
        const muscleInput = tr.querySelector(".muscle-input");
        select.addEventListener("change", (e) => {
            const selected = e.target.selectedOptions[0];
            muscleInput.value = selected.dataset.muscleGroup || "";
        });

        // Remove row
        tr.querySelector(".remove-btn").addEventListener("click", () => {
            tr.remove();
        });

        strengthExerciseTableBody.appendChild(tr);
    }

    function createCardioRow() {
        const tr = document.createElement("tr");

        const cardioOptions = availableExercises
            .filter(ex => ex.muscleGroup == "Speed" || ex.muscleGroup == "Endurance")
            .map(activity => `<option value="${activity.exerciseID}">${activity.name}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select cardio-select rounded-3" required>
                    <option value="" disabled selected>Select activity</option>
                    ${cardioOptions}
                </select>
            </td>
            <td><input type="number" class="form-control rounded-3 duration-input" min="1" placeholder="Minutes" required></td>
            <td><input type="number" class="form-control rounded-3 distance-input" min="0" step="0.1" placeholder="mi"></td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-btn" title="Remove activity">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Remove row
        tr.querySelector(".remove-btn").addEventListener("click", () => {
            tr.remove();
        });

        cardioTableBody.appendChild(tr);
    }

    // ===== COLLECT FORM DATA =====
    function collectWorkoutData() {
        const workoutDate = workoutDateInput.value;
        const exercises = [];

        // Collect strength exercises
        strengthExerciseTableBody.querySelectorAll("tr").forEach(row => {
            const select = row.querySelector(".exercise-select");
            const exerciseID = parseInt(select.value);
            if (!exerciseID) return;

            const muscle = row.querySelector(".muscle-input").value;
            const sets = parseInt(row.querySelector(".sets-input").value) || 0;
            const reps = parseInt(row.querySelector(".reps-input").value) || 0;
            const weight = parseFloat(row.querySelector(".weight-input").value) || 0;

            if (sets > 0 && reps > 0) {
                exercises.push({
                    exerciseID: exerciseID,
                    muscle_group: muscle,
                    sets: sets,
                    reps: reps,
                    weight: weight,
                    duration: null,
                    distance: null
                });
            }
        });

        // Collect cardio activities
        cardioTableBody.querySelectorAll("tr").forEach(row => {
            const activity = row.querySelector(".cardio-select");
            const exerciseID = parseInt(activity.value);
            if (!exerciseID) return;

            const duration = parseInt(row.querySelector(".duration-input").value) || 0;
            const distance = parseFloat(row.querySelector(".distance-input").value) || 0;

            if (duration > 0) {
                exercises.push({
                    exerciseID: exerciseID,
                    muscle_group: "Cardio",
                    sets: null,
                    reps: null,
                    weight: null,
                    duration: duration,
                    distance: distance > 0 ? distance : null
                });
            }
        });

        return {
            workout_date: workoutDate,
            exercises: exercises
        };
    }

    // ===== FORM SUBMISSION =====
    function handleSubmit(e) {
        e.preventDefault();

        const workoutData = collectWorkoutData();

        // Validation
        if (workoutData.exercises.length === 0) {
            showError("Please add at least one exercise or activity.");
            return;
        }

        // Save to database
        saveWorkout(workoutData);
    }

    // ===== HELPERS =====
    function showSuccess(message) {
        // TODO: Implement toast notification system
        alert(message);
    }

    function showError(message) {
        // TODO: Implement toast notification system
        alert(message);
    }

    // ===== EVENT LISTENERS =====
    addStrengthExerciseBtn.addEventListener("click", createStrengthRow);
    addCardioActivityBtn.addEventListener("click", createCardioRow);
    workoutForm.addEventListener("submit", handleSubmit);

    // ===== INITIALIZE =====
    init();
});
