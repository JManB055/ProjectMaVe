document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM ELEMENTS =====
    const aiPlannerForm = document.getElementById("aiPlannerForm");
    const aiPlanResult = document.getElementById("aiPlanResult");
    const regeneratePlanBtn = document.getElementById("regeneratePlanBtn");
    const savePlanBtn = document.getElementById("savePlanBtn");

    // ===== STATE =====
    let currentPlan = null;
    let userPreferences = null;

    // ===== AI API FUNCTION =====
    async function generateAIPlan(formData) {
        const goal = document.getElementById("fitnessGoal")?.value.trim() || formData.fitnessGoal;
        const frequency = document.getElementById("workoutFrequency")?.value.trim() || formData.workoutFrequency;
        const experience = document.getElementById("experienceLevel")?.value.trim() || formData.experienceLevel;
        const duration = document.getElementById("sessionDuration")?.value.trim() || formData.sessionDuration;
        const activities = document.getElementById("preferredActivities")?.value.trim() || formData.preferredActivities;
        const medical = document.getElementById("medicalNotes")?.value.trim() || formData.medicalNotes;

        const equipment = [];
        ["equipDumbbells","equipBarbell","equipMachines","equipBodyweight","equipCardio","equipBands"].forEach(id => {
            const el = document.getElementById(id);
            if(el?.checked) equipment.push(el.value);
        });

        const userPrompt = `
You are a workout coach who helps create workout plans based on user preferences.
Return plans in the following format, where each day and activity is on a new line:
Day #
- Activity - Sets x Reps (or duration) - Weight/Intensity
- etc.

Workout options:

Bodyweight: Push-Up, Sit-up, Leg Raises, Pull-up
Weights (upper): Bench Press, Incline Bench Press, Shoulder Press, Lateral Raises, Triceps Extensions, Row, Curl, Hammer Curl
Weights (lower): Deadlift, Squat, Romanian Deadlift, Split Squat, Hamstring Curl, Quad Extension, Hip Adduction, Hip Abduction, Calf Raises
Cardio: Stair Climber, Row Machine, 100m Sprint, 200m Sprint, 400m Sprint, 800m Sprint, Running, Cycling

User preferences:
- Goal: ${goal}
- Experience Level: ${experience}
- Frequency: ${frequency} days/week
- Session Duration: ${duration} minutes
- Equipment Available: ${equipment.join(", ")}
- Preferred Activities: ${activities}
- Medical Notes: ${medical}

Match the user's preferred activities as closely as possible.
        `;

        try {
            const response = await fetch("/Workouts/AI?handler=GeneratePlan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userPrompt })
            });

            const result = await response.json();
            if (!result.success) throw new Error(result.message || "AI failed to generate plan");

            return result.plan;
        } catch (error) {
            console.error("Error generating AI plan:", error);
            throw error;
        }
    }

    // ===== HANDLE FORM SUBMIT =====
    async function handleFormSubmit(e) {
        if (e) e.preventDefault();

        const formData = {
            fitnessGoal: document.getElementById("fitnessGoal")?.value.trim(),
            experienceLevel: document.getElementById("experienceLevel")?.value.trim(),
            workoutFrequency: document.getElementById("workoutFrequency")?.value.trim(),
            sessionDuration: document.getElementById("sessionDuration")?.value.trim(),
            preferredActivities: document.getElementById("preferredActivities")?.value.trim(),
            medicalNotes: document.getElementById("medicalNotes")?.value.trim(),
        };

        userPreferences = formData;

        // Show loading
        aiPlanResult.style.display = "block";
        aiPlanResult.innerHTML = `<div class="alert alert-info urbanist-medium"><i class="fas fa-spinner fa-spin me-2"></i>Generating your AI plan...</div>`;

        try {
            const planText = await generateAIPlan(formData);
            currentPlan = planText;

            // Render plan text
            const aiOutput = document.createElement("pre");
            aiOutput.className = "alert bg-light-orange";
            aiOutput.style.whiteSpace = "pre-wrap";
            aiOutput.textContent = planText;

            aiPlanResult.innerHTML = ""; // Clear loading
            aiPlanResult.appendChild(aiOutput);
        } catch (error) {
            aiPlanResult.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    // ===== EVENT LISTENERS =====
    aiPlannerForm?.addEventListener("submit", handleFormSubmit);

    regeneratePlanBtn?.addEventListener("click", () => {
        if (userPreferences) handleFormSubmit(null);
    });

    savePlanBtn?.addEventListener("click", () => {
        if (currentPlan) {
            // Ensure savePlanToDatabase is defined elsewhere
            savePlanToDatabase({
                plan: currentPlan,
                preferences: userPreferences,
                created_at: new Date().toISOString()
            });
        }
    });
});
