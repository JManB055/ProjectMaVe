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
    let availableExercises = [];

    // ===== INITIALIZE =====
    function init() {
        // Parse workoutId from URL
        const pathParts = window.location.pathname.split('/').filter(Boolean); // removes empty segments
        workoutId = parseInt(pathParts[pathParts.length - 1]);

        // Fallback to 1 for testing
        if (!workoutId || isNaN(workoutId)) {
            console.warn("Invalid workout ID in URL, defaulting to 1 for testing");
            workoutId = 1;
        }
        
        fetchExercisesFromDB();
        fetchWorkoutExercises(workoutId);
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

            const response = await fetch(`/Workouts/Details/${workoutId}?handler=Exercises`, {
                method: 'GET',
                headers: headers
            });

            const result = await response.json();
            // console.log("Raw Response: ", result);

            if (result.success) {
                console.log('Exercises loaded successfully:', result.exercises);
                availableExercises = result.exercises; // Replace current availableExercises array
            } else {
                console.warn('Failed to load exercises:', result.message);
            }

        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    }

    async function fetchWorkoutExercises(id) {
        try {
            let result;
            try {
                const response = await fetch(`/Workouts/Details/${workoutId}?handler=WorkoutExercises&workoutId=${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
                result = await response.json(); // might fail if 404
            } catch {
                result = { success: false }; // fallback to mock
                return;
            }

            workoutData = { id, date: result.workoutDate, exercises: result.exercises };
            console.log("Workout Exercises loaded successfully: ", workoutData);
            renderWorkoutDetails();
        } catch (error) {
            console.error("Error fetching workout:", error);
            showError("Failed to load workout details");
        }
    }

    async function saveWorkoutChanges() {
        try {
            const payload = collectWorkoutData();

            // Include AntiForgery token if present
            const tokenInput = document.querySelector('#antiForgeryForm input[name="__RequestVerificationToken"]');
            const headers = { 'Content-Type': 'application/json' };
            if (tokenInput) headers['RequestVerificationToken'] = tokenInput.value;

            const response = await fetch(`/Workouts/Details/${workoutId}?handler=SaveWorkoutExercises`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                hasUnsavedChanges = false;
                updateLastSaved();
                showSuccess(result.message || "Changes saved successfully!");
            } else {
                showError(result.message || "Failed to save changes");
            }

        } catch (error) {
            console.error("Error saving workout:", error);
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
        const strengthExercises = workoutData.exercises.filter(ex => getExerciseGroup(ex.exerciseID) !== "Speed" && getExerciseGroup(ex.exerciseID) !== "Endurance");
        const cardioExercises = workoutData.exercises.filter(ex => getExerciseGroup(ex.exerciseID) == "Speed" || getExerciseGroup(ex.exerciseID) == "Endurance");
        console.log("Raw workoutData: ", workoutData);
        console.log("Strength exercises: ", strengthExercises);
        console.log("Cardio exercises: ", cardioExercises);

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
            <td><input type="number" class="form-control rounded-3 weight-input" min="0" step="0.5" value="${data ? data.weight : ''}" placeholder="lbs"></td>
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
            <td><input type="number" class="form-control rounded-3 distance-input" min="0" step="0.1" value="${data ? (data.distance || '') : ''}" placeholder="mi"></td>
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

        // Strength
        strengthExerciseTableBody.querySelectorAll("tr").forEach(row => {
            const exercise = row.querySelector(".exercise-select").value;
            if (!exercise) return;

            exercises.push({
                ExerciseName: exercise,
                MuscleGroup: row.querySelector(".muscle-input").value,
                Sets: parseInt(row.querySelector(".sets-input").value) || null,
                Reps: parseInt(row.querySelector(".reps-input").value) || null,
                Weight: parseFloat(row.querySelector(".weight-input").value) || null,
                Duration: null,
                Distance: null
            });
        });

        // Cardio
        cardioTableBody.querySelectorAll("tr").forEach(row => {
            const activity = row.querySelector(".cardio-select").value;
            if (!activity) return;

            exercises.push({
                ExerciseName: activity,
                MuscleGroup: "Cardio",
                Sets: null,
                Reps: null,
                Weight: null,
                Duration: parseInt(row.querySelector(".duration-input").value) || null,
                Distance: parseFloat(row.querySelector(".distance-input").value) || null
            });
        });

        return {
            WorkoutID: workoutId,
            Exercises: exercises
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

    function getExerciseName(id){
        const exercise = exercises.find(ex => ex.id === id);
        return exercise ? exercise.name : null;
    }

    function getExerciseGroup(id){
        const exercise = exercises.find(ex => ex.id === id);
        return exercise ? exercise.muscleGroup : null;
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
