document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM ELEMENTS =====
    const workoutDateDisplay = document.getElementById("workoutDateDisplay");
    const editWorkoutDate = document.getElementById("editWorkoutDate");
    const workoutTypeBadge = document.getElementById("workoutTypeBadge");
    const totalExercisesCount = document.getElementById("totalExercisesCount");
    const strengthSection = document.getElementById("strengthSection");
    const cardioSection = document.getElementById("cardioSection");
    const strengthExerciseTableBody = document.getElementById("strengthExerciseTableBody");
    const cardioTableBody = document.getElementById("cardioTableBody");
    const addStrengthExerciseBtn = document.getElementById("addStrengthExerciseBtn");
    const addCardioActivityBtn = document.getElementById("addCardioActivityBtn");
    const saveChangesBtn = document.getElementById("saveChangesBtn");
    const deleteWorkoutBtn = document.getElementById("deleteWorkoutBtn");
    const lastSaved = document.getElementById("lastSaved");

    // ===== STATE =====
    let workoutId = null;
    let workoutData = null;
    let hasUnsavedChanges = false;

    // ===== AVAILABLE EXERCISES (will be fetched from DB) =====
    const availableExercises = [
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
        "Running", "Cycling", "Swimming", "Rowing", 
        "Elliptical", "Stair Climber", "Jump Rope", "Walking"
    ];

    // ===== INITIALIZE =====
    function init() {
        // Get workout ID from URL
        const pathParts = window.location.pathname.split('/');
        workoutId = parseInt(pathParts[pathParts.length - 1]);

        if (!workoutId || isNaN(workoutId)) {
            showError("Invalid workout ID");
            setTimeout(() => window.location.href = "/Workouts", 2000);
            return;
        }

        fetchWorkoutDetails();
    }

    // ===== API FUNCTIONS =====
    async function fetchWorkoutDetails() {
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/workouts/${workoutId}`);
            // workoutData = await response.json();

            // Mock data for now
            workoutData = {
                id: workoutId,
                date: "2025-11-06",
                exercises: [
                    { id: 1, exercise: "Bench Press", muscle: "Chest", sets: 4, reps: 8, weight: 185 },
                    { id: 2, exercise: "Shoulder Press", muscle: "Shoulders", sets: 3, reps: 10, weight: 95 },
                    { id: 3, exercise: "Running", muscle: "Cardio", duration: 30, distance: 5 }
                ]
            };

            renderWorkoutDetails();
        } catch (error) {
            console.error("Error fetching workout:", error);
            showError("Failed to load workout details");
        }
    }

    async function saveWorkoutChanges() {
        try {
            const updatedData = collectWorkoutData();
            
            // TODO: Replace with actual API call

            console.log("Saving changes:", updatedData);
            
            hasUnsavedChanges = false;
            updateLastSaved();
            showSuccess("Changes saved successfully!");
        } catch (error) {
            console.error("Error saving changes:", error);
            showError("Failed to save changes");
        }
    }

    async function deleteWorkout() {
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    async function confirmDelete() {
        try {
            // TODO: Replace with actual API call

            showSuccess("Workout deleted successfully!");
            setTimeout(() => window.location.href = "/Workouts", 1500);
        } catch (error) {
            console.error("Error deleting workout:", error);
            showError("Failed to delete workout");
        }
    }

    // ===== RENDER =====
    function renderWorkoutDetails() {
        if (!workoutData) return;

        // Update header info
        const formattedDate = formatDate(workoutData.date);
        workoutDateDisplay.textContent = formattedDate;
        editWorkoutDate.value = workoutData.date;

        // Separate exercises by type
        const strengthExercises = workoutData.exercises.filter(ex => ex.muscle !== "Cardio");
        const cardioExercises = workoutData.exercises.filter(ex => ex.muscle === "Cardio");

        // Update stats
        totalExercisesCount.textContent = workoutData.exercises.length;
        
        // Update workout type badge
        if (strengthExercises.length > 0 && cardioExercises.length > 0) {
            workoutTypeBadge.textContent = "Mixed";
            workoutTypeBadge.className = "badge bg-info";
        } else if (strengthExercises.length > 0) {
            workoutTypeBadge.textContent = "Strength";
            workoutTypeBadge.className = "badge bg-primary";
        } else {
            workoutTypeBadge.textContent = "Cardio";
            workoutTypeBadge.className = "badge bg-success";
        }

        // Show/hide sections
        if (strengthExercises.length > 0) {
            strengthSection.style.display = "block";
            renderStrengthExercises(strengthExercises);
        }

        if (cardioExercises.length > 0) {
            cardioSection.style.display = "block";
            renderCardioExercises(cardioExercises);
        }
    }

    function renderStrengthExercises(exercises) {
        strengthExerciseTableBody.innerHTML = "";
        exercises.forEach(ex => createStrengthRow(ex));
    }

    function renderCardioExercises(exercises) {
        cardioTableBody.innerHTML = "";
        exercises.forEach(ex => createCardioRow(ex));
    }

    // ===== CREATE EDITABLE ROWS =====
    function createStrengthRow(data = null) {
        const tr = document.createElement("tr");

        const exerciseOptions = availableExercises
            .map(ex => `<option value="${ex.name}" data-muscle="${ex.muscle}" ${data && data.exercise === ex.name ? 'selected' : ''}>${ex.name}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select exercise-select rounded-3">
                    <option value="" disabled>Select exercise</option>
                    ${exerciseOptions}
                </select>
            </td>
            <td><input type="text" class="form-control rounded-3 muscle-input" value="${data ? data.muscle : ''}" readonly></td>
            <td><input type="number" class="form-control rounded-3 sets-input" min="1" value="${data ? data.sets : ''}" placeholder="Sets"></td>
            <td><input type="number" class="form-control rounded-3 reps-input" min="1" value="${data ? data.reps : ''}" placeholder="Reps"></td>
            <td><input type="number" class="form-control rounded-3 weight-input" min="0" step="0.5" value="${data ? data.weight : ''}" placeholder="kg"></td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Auto-fill muscle group
        const select = tr.querySelector(".exercise-select");
        const muscleInput = tr.querySelector(".muscle-input");
        select.addEventListener("change", (e) => {
            const selected = e.target.selectedOptions[0];
            muscleInput.value = selected.dataset.muscle || "";
            markAsChanged();
        });

        // Mark as changed on input
        tr.querySelectorAll("input, select").forEach(input => {
            input.addEventListener("change", markAsChanged);
        });

        // Remove row
        tr.querySelector(".remove-btn").addEventListener("click", () => {
            tr.remove();
            markAsChanged();
            updateExerciseCount();
        });

        strengthExerciseTableBody.appendChild(tr);
    }

    function createCardioRow(data = null) {
        const tr = document.createElement("tr");

        const cardioOptions = cardioActivities
            .map(activity => `<option value="${activity}" ${data && data.exercise === activity ? 'selected' : ''}>${activity}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select cardio-select rounded-3">
                    <option value="" disabled>Select activity</option>
                    ${cardioOptions}
                </select>
            </td>
            <td><input type="number" class="form-control rounded-3 duration-input" min="1" value="${data ? data.duration : ''}" placeholder="Minutes"></td>
            <td><input type="number" class="form-control rounded-3 distance-input" min="0" step="0.1" value="${data ? (data.distance || '') : ''}" placeholder="km"></td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Mark as changed on input
        tr.querySelectorAll("input, select").forEach(input => {
            input.addEventListener("change", markAsChanged);
        });

        // Remove row
        tr.querySelector(".remove-btn").addEventListener("click", () => {
            tr.remove();
            markAsChanged();
            updateExerciseCount();
        });

        cardioTableBody.appendChild(tr);
    }

    // ===== COLLECT DATA =====
    function collectWorkoutData() {
        const exercises = [];

        // Collect strength exercises
        strengthExerciseTableBody.querySelectorAll("tr").forEach(row => {
            const exercise = row.querySelector(".exercise-select").value;
            if (!exercise) return;

            exercises.push({
                exercise_name: exercise,
                muscle_group: row.querySelector(".muscle-input").value,
                sets: parseInt(row.querySelector(".sets-input").value) || 0,
                reps: parseInt(row.querySelector(".reps-input").value) || 0,
                weight: parseFloat(row.querySelector(".weight-input").value) || 0,
                duration: null,
                distance: null
            });
        });

        // Collect cardio exercises
        cardioTableBody.querySelectorAll("tr").forEach(row => {
            const activity = row.querySelector(".cardio-select").value;
            if (!activity) return;

            exercises.push({
                exercise_name: activity,
                muscle_group: "Cardio",
                sets: null,
                reps: null,
                weight: null,
                duration: parseInt(row.querySelector(".duration-input").value) || 0,
                distance: parseFloat(row.querySelector(".distance-input").value) || null
            });
        });

        return {
            workout_date: editWorkoutDate.value,
            exercises: exercises
        };
    }

    // ===== HELPERS =====
    function markAsChanged() {
        hasUnsavedChanges = true;
        saveChangesBtn.classList.add("pulse");
    }

    function updateExerciseCount() {
        const strengthCount = strengthExerciseTableBody.querySelectorAll("tr").length;
        const cardioCount = cardioTableBody.querySelectorAll("tr").length;
        totalExercisesCount.textContent = strengthCount + cardioCount;
    }

    function updateLastSaved() {
        const now = new Date().toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit" 
        });
        lastSaved.textContent = `Last saved: ${now}`;
    }

    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00');
        return date.toLocaleDateString("en-US", { 
            weekday: "long",
            month: "long", 
            day: "numeric", 
            year: "numeric" 
        });
    }

    function showSuccess(message) {
        alert(message);
    }

    function showError(message) {
        alert(message);
    }

    // ===== EVENT LISTENERS =====
    addStrengthExerciseBtn.addEventListener("click", () => {
        strengthSection.style.display = "block";
        createStrengthRow();
        markAsChanged();
    });

    addCardioActivityBtn.addEventListener("click", () => {
        cardioSection.style.display = "block";
        createCardioRow();
        markAsChanged();
    });

    saveChangesBtn.addEventListener("click", saveWorkoutChanges);
    deleteWorkoutBtn.addEventListener("click", deleteWorkout);

    // Confirm delete from modal
    document.getElementById("confirmDeleteBtn")?.addEventListener("click", confirmDelete);

    // Warn on page leave if unsaved changes
    window.addEventListener("beforeunload", (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "";
        }
    });

    // ===== INITIALIZE =====
    init();
});
