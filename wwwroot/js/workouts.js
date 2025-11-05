document.addEventListener("DOMContentLoaded", () => {
    const addWorkoutBtn = document.getElementById("addWorkoutBtn");
    const aiWorkoutBtn = document.getElementById("aiWorkoutBtn");
    const addWorkoutSection = document.getElementById("addWorkoutSection");
    const aiPlannerSection = document.getElementById("aiPlannerSection");
    const workoutForm = document.getElementById("workoutForm");
    const aiForm = document.getElementById("aiForm");
    const workoutTableBody = document.getElementById("workoutTableBody");
    const aiPlanResult = document.getElementById("aiPlanResult");

    // Initial State
    addWorkoutSection.style.display = "block";
    aiPlannerSection.style.display = "none";
    addWorkoutBtn.classList.add("active");

    // Mock Data
    let mockWorkouts = [
        { date: "Nov 5, 2025", type: "Cardio", duration: "45 min", intensity: "High", notes: "Morning run with intervals" },
        { date: "Nov 4, 2025", type: "Strength", duration: "60 min", intensity: "Moderate", notes: "Upper body session" },
        { date: "Nov 3, 2025", type: "Yoga", duration: "30 min", intensity: "Low", notes: "Evening flexibility routine" }
    ];

    // Toggle sections
    const toggleSection = (section, btn) => {
        addWorkoutSection.style.display = "none";
        aiPlannerSection.style.display = "none";
        addWorkoutSection.classList.remove("active");
        aiPlannerSection.classList.remove("active");
        
        section.style.display = "block";
        section.classList.add("active");

        addWorkoutBtn.classList.remove("active");
        aiWorkoutBtn.classList.remove("active");
        btn.classList.add("active");
    };

    toggleSection(addWorkoutSection, addWorkoutBtn);

    addWorkoutBtn.addEventListener("click", () => toggleSection(addWorkoutSection, addWorkoutBtn));
    aiWorkoutBtn.addEventListener("click", () => toggleSection(aiPlannerSection, aiWorkoutBtn));

    // Render workouts
    const renderWorkouts = (data) => {
        if (!workoutTableBody) return;

        if (data.length === 0) {
            workoutTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No workouts logged yet.</td></tr>`;
        } else {
            workoutTableBody.innerHTML = data.map(w => `
                <tr>
                    <td>${w.date}</td>
                    <td>${w.type}</td>
                    <td>${w.duration}</td>
                    <td>${w.intensity}</td>
                    <td>${w.notes}</td>
                </tr>
            `).join("");
        }
    };

    renderWorkouts(mockWorkouts);

    // Add workout form
    workoutForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputs = workoutForm.querySelectorAll("input, select, textarea");
        const newWorkout = {
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            type: inputs[0].value.trim(),
            duration: inputs[1].value + " min",
            intensity: inputs[2].value,
            notes: inputs[3].value.trim()
        };
        mockWorkouts.unshift(newWorkout);
        renderWorkouts(mockWorkouts);
        workoutForm.reset();
    });

    // AI Planner (uses mock data)
    aiForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        aiPlanResult.style.display = "block";
        aiPlanResult.innerHTML = `<div class="alert alert-info urbanist-medium"><i class="fas fa-spinner fa-spin me-2"></i>Generating your AI plan...</div>`;
        setTimeout(() => {
            aiPlanResult.innerHTML = `
                <h5 class="urbanist-bold text-blue">Your AI-Generated Plan</h5>
                <div class="alert text-black border-0 rounded-3">
                    <strong>Day 1:</strong> Full Body Strength<br>
                    <strong>Day 2:</strong> Recovery<br>
                    <strong>Day 3:</strong> Cardio<br>
                    <strong>Day 4:</strong> Lower Body<br>
                    <strong>Day 5:</strong> Cardio Intervals<br>
                    <em>Repeat weekly for best results.</em>
                </div>
            `;
        }, 1000);
    });
});
