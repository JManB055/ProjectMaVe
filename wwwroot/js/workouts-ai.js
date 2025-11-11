document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM ELEMENTS =====
    const aiPlannerForm = document.getElementById("aiPlannerForm");
    const aiPlanResult = document.getElementById("aiPlanResult");
    const loadingState = document.getElementById("loadingState");
    const planContent = document.getElementById("planContent");
    const weeklySchedule = document.getElementById("weeklySchedule");
    const aiRecommendations = document.getElementById("aiRecommendations");
    const regeneratePlanBtn = document.getElementById("regeneratePlanBtn");
    const savePlanBtn = document.getElementById("savePlanBtn");

    // ===== STATE =====
    let currentPlan = null;
    let userPreferences = null;

    // ===== INITIALIZE =====
    function init() {
        // Load any saved preferences
        loadUserPreferences();
    }

    // ===== API FUNCTIONS =====
    async function generateAIPlan(formData) {
        try {
            // TODO: Replace with actual API call to Google AI Studio
            // Mock AI-generated plan for now
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay

            const mockPlan = {
                weeklySchedule: generateMockSchedule(formData),
                recommendations: generateMockRecommendations(formData),
                metadata: {
                    goal: formData.fitnessGoal,
                    frequency: formData.workoutFrequency,
                    duration: formData.sessionDuration,
                    experience: formData.experienceLevel
                }
            };

            return mockPlan;
        } catch (error) {
            console.error("Error generating AI plan:", error);
            throw error;
        }
    }

    async function savePlanToDatabase(plan) {
        try {
            // TODO: Replace with actual API call

            console.log("Saving plan to database:", plan);
            showSuccess("Plan saved! You can now follow it from your workouts page.");
            
            setTimeout(() => {
                window.location.href = "/Workouts";
            }, 1500);
        } catch (error) {
            console.error("Error saving plan:", error);
            showError("Failed to save plan. Please try again.");
        }
    }

    // ===== FORM HANDLING =====
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            fitnessGoal: document.getElementById("fitnessGoal").value,
            experienceLevel: document.getElementById("experienceLevel").value,
            workoutFrequency: document.getElementById("workoutFrequency").value,
            sessionDuration: document.getElementById("sessionDuration").value,
            equipment: getSelectedEquipment(),
            preferredActivities: document.getElementById("preferredActivities").value,
            medicalNotes: document.getElementById("medicalNotes").value
        };

        userPreferences = formData;

        // Show loading state
        aiPlanResult.style.display = "block";
        loadingState.style.display = "block";
        planContent.style.display = "none";

        // Scroll to results
        aiPlanResult.scrollIntoView({ behavior: "smooth", block: "start" });

        try {
            // Generate plan
            currentPlan = await generateAIPlan(formData);

            // Render results
            renderPlan(currentPlan);

            // Show results
            loadingState.style.display = "none";
            planContent.style.display = "block";
        } catch (error) {
            loadingState.style.display = "none";
            showError("Failed to generate workout plan. Please try again.");
        }
    }

    // ===== RENDER PLAN =====
    function renderPlan(plan) {
        // Render weekly schedule
        weeklySchedule.innerHTML = plan.weeklySchedule.map((day, index) => `
            <div class="col-md-6 col-lg-4">
                <div class="card border-0 rounded-4 shadow-sm h-100">
                    <div class="card-header bg-blue text-light-orange urbanist-bold">
                        ${day.dayName}
                    </div>
                    <div class="card-body bg-light-orange">
                        <h6 class="urbanist-bold text-blue mb-2">${day.focus}</h6>
                        <ul class="urbanist-medium text-black small mb-0 ps-3">
                            ${day.exercises.map(ex => `<li>${ex}</li>`).join("")}
                        </ul>
                        ${day.notes ? `<p class="text-muted small mt-2 mb-0"><em>${day.notes}</em></p>` : ''}
                    </div>
                </div>
            </div>
        `).join("");

        // Render recommendations
        aiRecommendations.innerHTML = `
            <div class="urbanist-medium text-black">
                <h6 class="urbanist-bold text-blue mb-3">Personalized Tips</h6>
                <ul class="mb-3">
                    ${plan.recommendations.map(rec => `<li class="mb-2">${rec}</li>`).join("")}
                </ul>
                <div class="alert alert-warning border-0 rounded-3 mt-3">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <strong>Important:</strong> This plan is AI-generated based on your inputs. 
                    Consult with a fitness professional before starting any new workout program, 
                    especially if you have medical conditions.
                </div>
            </div>
        `;
    }

    // ===== MOCK DATA GENERATORS =====
    function generateMockSchedule(formData) {
        const frequency = parseInt(formData.workoutFrequency);
        const goal = formData.fitnessGoal;
        const experience = formData.experienceLevel;
        
        const scheduleTemplates = {
            "build-muscle": [
                { dayName: "Day 1", focus: "Push (Chest, Shoulders, Triceps)", exercises: ["Bench Press 4×8", "Overhead Press 3×10", "Tricep Dips 3×12", "Lateral Raises 3×15"], notes: "Focus on progressive overload" },
                { dayName: "Day 2", focus: "Pull (Back, Biceps)", exercises: ["Pull-ups 4×8", "Barbell Rows 4×10", "Bicep Curls 3×12", "Face Pulls 3×15"], notes: "Maintain proper form" },
                { dayName: "Day 3", focus: "Legs & Core", exercises: ["Squats 4×8", "Romanian Deadlifts 3×10", "Leg Press 3×12", "Planks 3×60s"], notes: "Don't skip leg day!" },
                { dayName: "Day 4", focus: "Upper Body Hypertrophy", exercises: ["Incline Press 4×12", "Cable Rows 4×12", "Dumbbell Flyes 3×15", "Hammer Curls 3×12"], notes: "Higher reps for muscle growth" },
                { dayName: "Day 5", focus: "Lower Body & Glutes", exercises: ["Deadlifts 4×6", "Lunges 3×12", "Leg Curls 3×15", "Calf Raises 4×20"], notes: "Focus on glute activation" },
            ],
            "lose-weight": [
                { dayName: "Day 1", focus: "HIIT Cardio", exercises: ["Treadmill Intervals 30min", "Burpees 3×15", "Mountain Climbers 3×30s", "Jump Rope 5min"], notes: "High intensity, short rest" },
                { dayName: "Day 2", focus: "Full Body Strength", exercises: ["Goblet Squats 3×15", "Push-ups 3×12", "Dumbbell Rows 3×12", "Planks 3×45s"], notes: "Circuit style training" },
                { dayName: "Day 3", focus: "Cardio & Core", exercises: ["Running 45min", "Bicycle Crunches 3×20", "Russian Twists 3×30", "Leg Raises 3×15"], notes: "Steady state cardio" },
                { dayName: "Day 4", focus: "Upper Body Circuit", exercises: ["Push-ups 3×15", "Pull-ups 3×8", "Dips 3×10", "Plank Variations 3×40s"], notes: "Minimal rest between sets" },
                { dayName: "Day 5", focus: "Active Recovery", exercises: ["Cycling 60min", "Yoga Flow 20min", "Stretching 15min"], notes: "Low intensity, promote recovery" },
            ],
            "increase-strength": [
                { dayName: "Day 1", focus: "Heavy Squat Day", exercises: ["Back Squat 5×5", "Front Squat 3×8", "Leg Press 3×10", "Core Work 3 sets"], notes: "Focus on bar speed" },
                { dayName: "Day 2", focus: "Heavy Bench Day", exercises: ["Bench Press 5×5", "Incline Press 3×8", "Dips 3×10", "Tricep Extensions 3×12"], notes: "Perfect your technique" },
                { dayName: "Day 3", focus: "Deadlift & Back", exercises: ["Deadlift 5×5", "Romanian Deadlift 3×8", "Barbell Rows 4×8", "Pull-ups 3×8"], notes: "Maintain neutral spine" },
                { dayName: "Day 4", focus: "Overhead Press & Shoulders", exercises: ["Military Press 5×5", "Push Press 3×6", "Lateral Raises 3×12", "Face Pulls 3×15"], notes: "Build shoulder stability" },
                { dayName: "Day 5", focus: "Accessory & Conditioning", exercises: ["Farmer's Walks 4 sets", "Sled Push 5 sets", "Core Circuits 3 rounds"], notes: "Support lifts and conditioning" },
            ],
            "general-fitness": [
                { dayName: "Day 1", focus: "Full Body Workout", exercises: ["Squats 3×12", "Push-ups 3×15", "Rows 3×12", "Lunges 3×10", "Planks 3×45s"], notes: "Balanced approach" },
                { dayName: "Day 2", focus: "Cardio & Mobility", exercises: ["Running 30min", "Dynamic Stretching 15min", "Yoga Flow 20min"], notes: "Build endurance" },
                { dayName: "Day 3", focus: "Strength Training", exercises: ["Bench Press 3×10", "Deadlifts 3×10", "Pull-ups 3×8", "Shoulder Press 3×10"], notes: "Focus on compound movements" },
                { dayName: "Day 4", focus: "Active Recovery", exercises: ["Swimming 45min", "Light Stretching 20min", "Walk 30min"], notes: "Low intensity day" },
                { dayName: "Day 5", focus: "Circuit Training", exercises: ["Burpees 3×12", "Kettlebell Swings 3×15", "Box Jumps 3×10", "Battle Ropes 3×30s"], notes: "Keep heart rate elevated" },
            ]
        };

        let schedule = scheduleTemplates[goal] || scheduleTemplates["general-fitness"];
        return schedule.slice(0, frequency);
    }

    function generateMockRecommendations(formData) {
        const recommendations = [];
        
        // Based on goal
        if (formData.fitnessGoal === "build-muscle") {
            recommendations.push("Consume 0.8-1g of protein per pound of bodyweight daily");
            recommendations.push("Progressive overload: increase weight by 2.5-5lbs when you can complete all sets");
            recommendations.push("Get 7-9 hours of sleep for optimal recovery and muscle growth");
        } else if (formData.fitnessGoal === "lose-weight") {
            recommendations.push("Maintain a caloric deficit of 300-500 calories below maintenance");
            recommendations.push("Prioritize protein intake (0.7-1g per lb) to preserve muscle mass");
            recommendations.push("Combine strength training with cardio for best fat loss results");
        }

        // Based on experience
        if (formData.experienceLevel === "beginner") {
            recommendations.push("Start with lighter weights to master proper form");
            recommendations.push("Allow 48 hours rest between training the same muscle groups");
        } else if (formData.experienceLevel === "advanced") {
            recommendations.push("Consider periodization to avoid plateaus");
            recommendations.push("Implement deload weeks every 4-6 weeks");
        }

        // Based on medical notes
        if (formData.medicalNotes) {
            recommendations.push("Consult with a healthcare provider before starting this program");
            recommendations.push("Modify or skip exercises that cause pain or discomfort");
        }

        // General recommendations
        recommendations.push("Warm up for 5-10 minutes before each workout");
        recommendations.push("Stay hydrated: drink water before, during, and after workouts");
        recommendations.push("Track your progress weekly to stay motivated");

        return recommendations;
    }

    // ===== HELPERS =====
    function getSelectedEquipment() {
        const equipment = [];
        const checkboxes = [
            "equipDumbbells", "equipBarbell", "equipMachines", 
            "equipBodyweight", "equipCardio", "equipBands"
        ];

        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                equipment.push(checkbox.value);
            }
        });

        return equipment;
    }

    function loadUserPreferences() {
        // TODO: Load saved preferences from localStorage or database
        // This could pre-fill the form with previous selections
    }

    function showSuccess(message) {
        alert(message);
    }

    function showError(message) {
        alert(message);
    }

    // ===== EVENT LISTENERS =====
    aiPlannerForm.addEventListener("submit", handleFormSubmit);

    regeneratePlanBtn?.addEventListener("click", () => {
        if (userPreferences) {
            // Regenerate with same preferences
            handleFormSubmit({ preventDefault: () => {} });
        }
    });

    savePlanBtn?.addEventListener("click", () => {
        if (currentPlan) {
            savePlanToDatabase({
                plan: currentPlan,
                preferences: userPreferences,
                created_at: new Date().toISOString()
            });
        }
    });

    // ===== INITIALIZE =====
    init();
});
