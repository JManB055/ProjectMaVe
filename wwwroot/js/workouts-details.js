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
    let workoutData = [];
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
            return;
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
            const response = await fetch(`/Workouts/Details/${workoutId}?handler=Delete`, {
                method: 'POST',
            });

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
        var strengthExercises = [];
        strengthExercises = workoutData.exercises.filter(ex => getExerciseGroup(ex.exerciseID) !== "Speed" && getExerciseGroup(ex.exerciseID) !== "Endurance");
        var cardioExercises = [];
        cardioExercises = workoutData.exercises.filter(ex => getExerciseGroup(ex.exerciseID) == "Speed" || getExerciseGroup(ex.exerciseID) == "Endurance");
//        console.log("Raw workoutData: ", workoutData);
//        console.log("Strength exercises: ", strengthExercises);
//        console.log("Cardio exercises: ", cardioExercises);

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

        tr.id = data.workoutExerciseID;  // Set the workoutExerciseID to the row ID so that the information can be saved to the right workoutExercise later

        const strengthExercises = availableExercises.filter(ex => ex.muscleGroup !== "Speed" && ex.muscleGroup !== "Endurance");
        const exerciseOptions = strengthExercises
            .map(ex => `<option value="${ex.name}" data-muscle="${ex.muscleGroup}" ${data && getExerciseName(data.exerciseID) === ex.name ? 'selected' : ''}>${ex.name}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select exercise-select rounded-3">
                    <option value="" disabled>Select exercise</option>
                    ${exerciseOptions}
                </select>
            </td>
            <td><input type="text" class="form-control rounded-3 muscle-input" value="${data ? getExerciseGroup(data.exerciseID) : ''}" readonly></td>
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
        // console.log("Autoset select is: ", select);
        const muscleInput = tr.querySelector(".muscle-input");
        // console.log("Autoset muscleInput is: ", muscleInput);
        select.addEventListener("change", (e) => {
            const selected = e.target.selectedOptions[0];
            // console.log("Autoset interior selected: ", selected);
            muscleInput.value = selected.dataset.muscle || "";
            // console.log("Autoset interior selected dataset && muscleInput.value: ", selected.dataset, muscleInput);
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

        tr.id = data.workoutExerciseID;  // Set the workoutExerciseID to the row ID so that the information can be saved to the right workoutExercise later

        const cardioActivities = availableExercises.filter(ex => ex.muscleGroup == "Speed" || ex.muscleGroup == "Endurance");
        const cardioOptions = cardioActivities
            .map(activity => `<option value="${activity.name}" ${data && getExerciseName(data.exerciseID) === activity.name ? 'selected' : ''}>${activity.name}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select cardio-select rounded-3">
                    <option value="" disabled>Select activity</option>
                    ${cardioOptions}
                </select>
            </td>
            <td><input type="number" class="form-control rounded-3 duration-input" min="1" value="${data ? data.time : ''}" placeholder="Minutes"></td>
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

        // Collect workout date
        var workoutDateCollected = "2025-11-20"; // TODO get this dynamically

        // Strength
        strengthExerciseTableBody.querySelectorAll("tr").forEach(row => {
            const exercise = row.querySelector(".exercise-select").value;
            const eid = getExerciseIDByName(exercise);
            console.log("Current row: ", row);
            if (!exercise) return;

            exercises.push({
                WorkoutExerciseID: row.id,
                ExerciseID: eid,
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
            const eid = getExerciseIDByName(activity);
            console.log("Current row: ", row);
            if (!activity) return;

            exercises.push({
                WorkoutExerciseID: row.id,
                ExerciseID: eid,
                ExerciseName: activity,
                MuscleGroup: "Cardio",
                Sets: null,
                Reps: null,
                Weight: null,
                Duration: parseInt(row.querySelector(".duration-input").value) || null,
                Distance: parseFloat(row.querySelector(".distance-input").value) || null
            });
        });

        var payload = {
            WorkoutID: workoutId,
            WorkoutDate: workoutDateCollected,
            Exercises: exercises
        };

        console.log("Returning payload for save: ", payload);

        return payload;
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
        const exercise = availableExercises.find(ex => ex.exerciseID === id);
        // console.log('Getting exercise name: ', exercise, exercise.name);
        return exercise ? exercise.name : null;
    }

    function getExerciseGroup(id){
        const exercise = availableExercises.find(ex => ex.exerciseID === id);
        // console.log('Getting exercise group: ', exercise, exercise.muscleGroup);
        return exercise ? exercise.muscleGroup : null;
    }

    function getExerciseIDByName(name){
        const exercise = availableExercises.find(ex => ex.name === name);
        return exercise ? exercise.exerciseID : null;
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
        
        // Make an empty exercise to pass, or the createStrengthRow doesn't create anything. Defaults to empty pushup session
        var newExercise = {
            workoutExerciseID: 0,
            exerciseID: 1,
            sets: null,
            reps: null,
            weight: null,
            time: null,
            distance: null,
            isCompleted: false
        }

        createStrengthRow(newExercise);
        markAsChanged();
    });

    addCardioActivityBtn.addEventListener("click", () => {
        cardioSection.style.display = "block";

        // Make an empty exercise to pass, or the createCardioRow doesn't create anything. Defaults to empty running session
        var newExercise = {
            workoutExerciseID: 0,
            exerciseID: 31,
            sets: null,
            reps: null,
            weight: null,
            time: null,
            distance: null,
            isCompleted: false
        }

        createCardioRow(newExercise);
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
