document.addEventListener("DOMContentLoaded", () => {
    const addWorkoutBtn = document.getElementById("addWorkoutBtn");
    const aiWorkoutBtn = document.getElementById("aiWorkoutBtn");
    const addWorkoutSection = document.getElementById("addWorkoutSection");
    const aiPlannerSection = document.getElementById("aiPlannerSection");
    const workoutForm = document.getElementById("workoutForm");
    const aiForm = document.getElementById("aiForm");
    const workoutTableBody = document.getElementById("workoutTableBody");
    const aiPlanResult = document.getElementById("aiPlanResult");
    const addExerciseBtn = document.getElementById("addExerciseBtn");
    const exerciseTableBody = document.getElementById("exerciseTableBody");
    const workoutDateInput = document.getElementById("workoutDate");

    // =====================
    // STATE MANAGEMENT
    // =====================

    let mockWorkouts = [
        {
            date: "Nov 5, 2025",
            exercises: [
                { exercise: "Bench Press", muscle: "Chest", sets: 4, reps: 8, weight: 185 },
                { exercise: "Shoulder Press", muscle: "Shoulders", sets: 3, reps: 10, weight: 95 },
            ],
        },
        {
            date: "Nov 3, 2025",
            exercises: [
                { exercise: "Running", muscle: "Cardio", duration: 30, distance: 5.2 },
            ],
        },
        {
            date: "Nov 1, 2025",
            exercises: [
                { exercise: "Squat", muscle: "Legs", sets: 4, reps: 10, weight: 225 },
                { exercise: "Deadlift", muscle: "Back", sets: 3, reps: 6, weight: 315 },
            ],
        },
    ];

    const availableExercises = [
        { name: "Bench Press", muscle: "Chest" },
        { name: "Shoulder Press", muscle: "Shoulders" },
        { name: "Squat", muscle: "Legs" },
        { name: "Deadlift", muscle: "Back" },
        { name: "Pull-ups", muscle: "Back" },
        { name: "Bicep Curl", muscle: "Arms" },
        { name: "Tricep Extension", muscle: "Arms" },
        { name: "Leg Press", muscle: "Legs" },
        { name: "Lat Pulldown", muscle: "Back" },
        { name: "Running", muscle: "Cardio" },
        { name: "Cycling", muscle: "Cardio" },
    ];

    // =====================
    // UI SETUP
    // =====================

    // Set default date to today
    if (workoutDateInput) {
        const today = new Date().toISOString().split('T')[0];
        workoutDateInput.value = today;
    }

    const toggleSection = (section, btn) => {
        addWorkoutSection.style.display = "none";
        aiPlannerSection.style.display = "none";
        section.style.display = "block";

        addWorkoutBtn.classList.remove("active");
        aiWorkoutBtn.classList.remove("active");
        btn.classList.add("active");
    };

    toggleSection(addWorkoutSection, addWorkoutBtn);

    addWorkoutBtn.addEventListener("click", () => toggleSection(addWorkoutSection, addWorkoutBtn));
    aiWorkoutBtn.addEventListener("click", () => toggleSection(aiPlannerSection, aiWorkoutBtn));

    // =====================
    // EXERCISE TABLE LOGIC
    // =====================

    function createExerciseRow() {
        const tr = document.createElement("tr");

        // Build the exercise dropdown
        const exerciseOptions = availableExercises
            .map(ex => `<option value="${ex.name}" data-muscle="${ex.muscle}">${ex.name}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select exercise-select rounded-3" required>
                    <option value="" disabled selected>Select exercise</option>
                    ${exerciseOptions}
                </select>
            </td>
            <td><input type="text" class="form-control rounded-3 muscle-input" placeholder="Auto-filled" readonly></td>
            <td class="strength-field"><input type="number" class="form-control rounded-3 sets-input" min="1" placeholder="Sets" required></td>
            <td class="strength-field"><input type="number" class="form-control rounded-3 reps-input" min="1" placeholder="Reps" required></td>
            <td class="strength-field"><input type="number" class="form-control rounded-3 weight-input" min="0" step="0.5" placeholder="kg"></td>
            <td class="cardio-field" style="display:none;"><input type="number" class="form-control rounded-3 duration-input" min="1" placeholder="Minutes"></td>
            <td class="cardio-field" style="display:none;"><input type="number" class="form-control rounded-3 distance-input" min="0" step="0.1" placeholder="km"></td>
            <td><button type="button" class="btn btn-sm btn-outline-danger remove-exercise-btn"><i class="fas fa-trash"></i></button></td>
        `;

        const exerciseSelect = tr.querySelector(".exercise-select");
        const muscleInput = tr.querySelector(".muscle-input");
        const strengthFields = tr.querySelectorAll(".strength-field");
        const cardioFields = tr.querySelectorAll(".cardio-field");

        // Add event listener for muscle auto-fill and cardio detection
        exerciseSelect.addEventListener("change", (e) => {
            const selected = e.target.selectedOptions[0];
            const muscleGroup = selected.dataset.muscle || "";
            muscleInput.value = muscleGroup;

            // Toggle between strength and cardio fields
            const isCardio = muscleGroup === "Cardio";
            
            strengthFields.forEach(field => {
                field.style.display = isCardio ? "none" : "";
                const input = field.querySelector("input");
                if (input) {
                    input.required = !isCardio;
                    if (isCardio) input.value = "";
                }
            });

            cardioFields.forEach(field => {
                field.style.display = isCardio ? "" : "none";
                const input = field.querySelector("input");
                if (input) {
                    input.required = isCardio;
                    if (!isCardio) input.value = "";
                }
            });
        });

        // Add event listener for remove button
        tr.querySelector(".remove-exercise-btn").addEventListener("click", () => {
            tr.remove();
        });

        exerciseTableBody.appendChild(tr);
    }

    addExerciseBtn?.addEventListener("click", () => {
        createExerciseRow();
    });

    // Add one default exercise row on page load
    createExerciseRow();

    // =====================
    // RENDER WORKOUT HISTORY
    // =====================

    function renderWorkouts(data) {
        if (!workoutTableBody) return;

        if (data.length === 0) {
            workoutTableBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">No workouts logged yet.</td></tr>`;
            return;
        }

        workoutTableBody.innerHTML = data.map(w => `
            <tr>
                <td>${w.date}</td>
                <td>${w.exercises.length} exercise${w.exercises.length !== 1 ? 's' : ''}</td>
                <td>
                    <ul class="mb-0 ps-3">
                        ${w.exercises.map(ex => {
                            if (ex.muscle === "Cardio") {
                                return `<li>${ex.exercise} - ${ex.duration || 0} min, ${ex.distance || 0} km</li>`;
                            } else {
                                return `<li>${ex.exercise} - ${ex.sets}×${ex.reps}${ex.weight ? ` @ ${ex.weight}kg` : ""}</li>`;
                            }
                        }).join("")}
                    </ul>
                </td>
            </tr>
        `).join("");
    }

    renderWorkouts(mockWorkouts);

    // =====================
    // HANDLE WORKOUT SUBMISSION
    // =====================

    workoutForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const workoutDate = workoutDateInput.value;
        const exerciseRows = exerciseTableBody.querySelectorAll("tr");
        const exercises = [];

        exerciseRows.forEach(row => {
            const exercise = row.querySelector(".exercise-select").value;
            const muscle = row.querySelector(".muscle-input").value;

            if (!exercise) return;

            if (muscle === "Cardio") {
                const duration = parseInt(row.querySelector(".duration-input").value) || 0;
                const distance = parseFloat(row.querySelector(".distance-input").value) || 0;
                
                if (duration > 0 || distance > 0) {
                    exercises.push({ exercise, muscle, duration, distance });
                }
            } else {
                const sets = parseInt(row.querySelector(".sets-input").value) || 0;
                const reps = parseInt(row.querySelector(".reps-input").value) || 0;
                const weight = parseFloat(row.querySelector(".weight-input").value) || 0;

                if (sets > 0 && reps > 0) {
                    exercises.push({ exercise, muscle, sets, reps, weight });
                }
            }
        });

        if (exercises.length === 0) {
            alert("Please add at least one exercise with valid data.");
            return;
        }

        const newWorkout = {
            date: workoutDate
                ? new Date(workoutDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            exercises: exercises,
        };

        mockWorkouts.unshift(newWorkout);
        renderWorkouts(mockWorkouts);

        workoutForm.reset();
        exerciseTableBody.innerHTML = "";
        
        // Reset date to today and add one default exercise row
        workoutDateInput.value = new Date().toISOString().split('T')[0];
        createExerciseRow();
    });

    // =====================
    // AI PLANNER (mock)
    // =====================

    aiForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        aiPlanResult.style.display = "block";
        aiPlanResult.innerHTML = `<div class="alert alert-info urbanist-medium"><i class="fas fa-spinner fa-spin me-2"></i>Generating your AI plan...</div>`;

        setTimeout(() => {
            aiPlanResult.innerHTML = `
                <h5 class="urbanist-bold text-blue mb-3">Your AI-Generated Plan</h5>
                <div class="alert bg-light-orange border border-blue rounded-3">
                    <strong class="text-blue">Day 1:</strong> Push (Chest, Triceps, Shoulders)<br>
                    <strong class="text-blue">Day 2:</strong> Pull (Back, Biceps)<br>
                    <strong class="text-blue">Day 3:</strong> Legs & Core<br>
                    <strong class="text-blue">Day 4:</strong> Cardio / Active Recovery<br>
                    <strong class="text-blue">Day 5:</strong> Upper Body Hypertrophy<br>
                    <em class="text-muted">Repeat weekly for optimal progress.</em>
                </div>
            `;
        }, 1500);
    });
});