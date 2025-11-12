document.addEventListener("DOMContentLoaded", () => {
    // ===== SECTIONS =====
    const addWorkoutSection = document.getElementById("addWorkoutSection");
    const aiPlannerSection = document.getElementById("aiPlannerSection");

    // ===== BUTTONS =====
    const addWorkoutBtn = document.getElementById("addWorkoutBtn");
    const aiWorkoutBtn = document.getElementById("aiWorkoutBtn");
    const addStrengthExerciseBtn = document.getElementById("addStrengthExerciseBtn");
    const addCardioActivityBtn = document.getElementById("addCardioActivityBtn");

    // ===== FORMS =====
    const workoutForm = document.getElementById("strengthWorkoutForm"); 
    const aiForm = document.getElementById("aiForm");

    // ===== TABLE BODIES =====
    const strengthExerciseTableBody = document.getElementById("strengthExerciseTableBody");
    const cardioTableBody = document.getElementById("cardioTableBody");

    // ===== OTHER ELEMENTS =====
    const workoutTableBody = document.getElementById("workoutTableBody");
    const aiPlanResult = document.getElementById("aiPlanResult");
    const workoutDateInput = document.getElementById("workoutDate");

    // ===== STATE =====
    let mockWorkouts = [
        {
            date: "Nov 6, 2025",
            exercises: [
                { exercise: "Bench Press", muscle: "Chest", sets: 4, reps: 8, weight: 185 },
                { exercise: "Shoulder Press", muscle: "Shoulders", sets: 3, reps: 10, weight: 95 },
                { exercise: "Running", muscle: "Endurance", duration: 30, distance: 5 }
            ]
        },
        {
            date: "Nov 5, 2025",
            exercises: [
                { exercise: "Cycling", muscle: "Endurance", duration: 45, distance: 15 }
            ]
        },
        {
            date: "Nov 3, 2025",
            exercises: [
                { exercise: "Pull-up", muscle: "Back", sets: 3, reps: 8, weight: 0 },
                { exercise: "Bicep Curl", muscle: "Arms", sets: 3, reps: 12, weight: 30 },
            ]
        },
    ];

    const availableExercises = [
        // Chest
        { name: "Push-up", muscle: "Chest" },
		{ name: "Bench Press", muscle: "Chest" },
		{ name: "Incline Bench Press", muscle: "Chest"},
		// Shoulders
        { name: "Shoulder Press", muscle: "Shoulders" },
		{ name: "Lateral Raises", muscle: "Shoulders" },
		// Arms
		{ name: "Tricep Extension", muscle: "Arms" },
		{ name: "Bicep Curl", muscle: "Arms" },
		{ name: "Hammer Curl", muscle: "Arms" },
		{ name: "Farmer's Carry", muscle: "Arms" }, //maybe remove
		// Back
		{ name: "Pull-up", muscle: "Back" },
		{ name: "Row", muscle: "Back" },
		{ name: "Deadlift", muscle: "Back" },
		// Legs
        { name: "Squat", muscle: "Legs" },
		{ name: "Romanian Deadlift", muscle: "Legs" },
		{ name: "Split Squat", muscle: "Legs" },
		{ name: "Hamstring Curl", muscle: "Legs" },
		{ name: "Quad Extension", muscle: "Legs" },
		{ name: "Hip Adduction", muscle: "Legs" },
		{ name: "Hip Abduction", muscle: "Legs" },
		{ name: "Calf Raises", muscle: "Legs" },
        // Core
		{ name: "Sit-up", muscle: "Core" },
		{ name: "Plank", muscle: "Core" }, //maybe remove
		{ name: "Side Plank", muscle: "Core" }, //maybe remove
		{ name: "Leg Raises", muscle: "Core" },
        // Endurance
        { name: "Running", muscle: "Endurance" },
        { name: "Cycling", muscle: "Endurance" },
		{ name: "Stair Climber", muscle: "Endurance" },
		{ name: "Row Machine", muscle: "Endurance" },
		{ name: "800m Sprint", muscle: "Endurance"},
		// Speed
        { name: "100m Sprint", muscle: "Speed" },
        { name: "200m Sprint", muscle: "Speed" },
        { name: "400m Sprint", muscle: "Speed" }
    ];

    // ===== UI SETUP =====
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

    // ===== HELPER FUNCTIONS =====
    function createStrengthRow() {
        const tr = document.createElement("tr");

        const exerciseOptions = availableExercises
            .filter(ex => !["Endurance", "Speed"].includes(ex.muscle))
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
            <td><input type="number" class="form-control rounded-3 sets-input" min="1" placeholder="Sets" required></td>
            <td><input type="number" class="form-control rounded-3 reps-input" min="1" placeholder="Reps" required></td>
            <td><input type="number" class="form-control rounded-3 weight-input" min="0" step="0.5" placeholder="lbs"></td>
            <td><button type="button" class="btn btn-sm btn-outline-danger remove-exercise-btn"><i class="fas fa-trash"></i></button></td>
        `;

        const select = tr.querySelector(".exercise-select");
        const muscleInput = tr.querySelector(".muscle-input");
        select.addEventListener("change", (e) => {
            const selected = e.target.selectedOptions[0];
            muscleInput.value = selected.dataset.muscle || "";
        });

        tr.querySelector(".remove-exercise-btn").addEventListener("click", () => tr.remove());
        strengthExerciseTableBody.appendChild(tr);
    }

    function createCardioRow() {
        const tr = document.createElement("tr");

        const cardioOptions = availableExercises
            .filter(ex => ex.muscle === "Endurance" || ex.muscle === "Speed")
            .map(ex => `<option value="${ex.name}">${ex.name}</option>`)
            .join("");

        tr.innerHTML = `
            <td>
                <select class="form-select cardio-select rounded-3" required>
                    <option value="" disabled selected>Select activity</option>
                    ${cardioOptions}
                </select>
            </td>
            <td><input type="text" class="form-control rounded-3 duration-input" placeholder="hh:mm:ss" required></td>
            <td><input type="number" class="form-control rounded-3 distance-input" min="0" step="0.1" placeholder="mi"></td>
            <td><button type="button" class="btn btn-sm btn-outline-danger remove-cardio-btn"><i class="fas fa-trash"></i></button></td>
        `;

        tr.querySelector(".remove-cardio-btn").addEventListener("click", () => tr.remove());
        cardioTableBody.appendChild(tr);
    }

    // ===== EVENT LISTENERS =====
    addStrengthExerciseBtn.addEventListener("click", createStrengthRow);
    addCardioActivityBtn.addEventListener("click", createCardioRow);

    // ===== RENDER WORKOUT HISTORY =====
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
                            if (["Endurance", "Speed"].includes(ex.muscle)) {
                                return `<li>${ex.exercise} - ${ex.duration || 0} min, ${ex.distance || 0} mi</li>`;
                            } else {
                                return `<li>${ex.exercise} - ${ex.sets}×${ex.reps}${ex.weight ? ` @ ${ex.weight}lbs` : ""}</li>`;
                            }
                        }).join("")}
                    </ul>
                </td>
            </tr>
        `).join("");
    }

    renderWorkouts(mockWorkouts);

	function parseTimeToMinutes(timeStr){
		const parts = timeStr.split(":").map(Number);
		if(parts.length !== 3 || parts.some(isNaN)) return 0;
		const [hours, minutes, seconds] = parts;
		return hours * 60 + minutes + Math.floor(seconds / 60);
	}

    // ===== FORM SUBMISSION =====
    workoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const workoutDate = workoutDateInput.value;
        const exercises = [];

        strengthExerciseTableBody.querySelectorAll("tr").forEach(row => {
            const exercise = row.querySelector(".exercise-select").value;
            if (!exercise) return;
            const muscle = row.querySelector(".muscle-input").value;
            const sets = parseInt(row.querySelector(".sets-input").value) || 0;
            const reps = parseInt(row.querySelector(".reps-input").value) || 0;
            const weight = parseFloat(row.querySelector(".weight-input").value) || 0;
            if (sets > 0 && reps > 0) {
                exercises.push({ exercise, muscle, sets, reps, weight });
            }
        });

        cardioTableBody.querySelectorAll("tr").forEach(row => {
            const activity = row.querySelector(".cardio-select").value;
            if (!activity) return;
			const muscle = row.querySelector(".muscle-input").value;
            const timeStr = parseInt(row.querySelector(".duration-input").value.trim());
			const duration = parseTimeToMinutes(timeStr); //convert hh:mm:ss into total minutes
            const distance = parseFloat(row.querySelector(".distance-input").value) || 0;
            if (duration > 0 || distance > 0) {
                exercises.push({ exercise: activity, muscle, duration, distance });
            }
        });

        if (exercises.length === 0) {
            alert("Please add at least one exercise with valid data.");
            return;
        }

        const newWorkout = { date: workoutDate ? `${new Date(workoutDate + 'T00:00').toLocaleString('en-US',
            { month: 'short', day: 'numeric', year: 'numeric' })}` : new Date().toLocaleDateString("en-US",
            { month: "short", day: "numeric", year: "numeric" }), exercises };

        mockWorkouts.unshift(newWorkout);
        renderWorkouts(mockWorkouts);

        // Reset tables
        strengthExerciseTableBody.innerHTML = "";
        cardioTableBody.innerHTML = "";
        workoutForm.reset();
        workoutDateInput.value = new Date().toISOString().split('T')[0];

        createStrengthRow();
    });

    // ===== AI PLANNER (mock) =====
    aiForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        aiPlanResult.style.display = "block";
        aiPlanResult.innerHTML = `<div class="alert alert-info urbanist-medium"><i class="fas fa-spinner fa-spin me-2"></i>Generating your AI plan...</div>`;

		const userPrompt = document.getElementById("aiPromptInput")?.value || "Create a 5-day workout split";
		
		const response = await fetch("/Workouts?handler=GeneratePlan", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt: userPrompt })
		});
		
		const result = await response.json();
		aiPlanResult.innerHTML = result.success
			? `<div class="alert bg-light-orange">${result.plan}</div>`
			: `<div class="alert alert-danger">${result.message}</div>`;
		/*
        setTimeout(() => {
            aiPlanResult.innerHTML = `
                <h3 class="urbanist-bold text-blue mb-3">Your AI-Generated Plan</h3>
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
		*/
    });
});

let workoutExercises = [];

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





