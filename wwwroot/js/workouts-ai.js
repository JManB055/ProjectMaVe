document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM ELEMENTS =====
    const aiPlannerForm = document.getElementById("aiPlannerForm");
    const aiPlanResult = document.getElementById("aiPlanResult");
    const loadingState = document.getElementById("loadingState");
    const aiPlanText = document.getElementById("aiPlanText");
    const actionButtons = document.getElementById("actionButtons");
    const regeneratePlanBtn = document.getElementById("regeneratePlanBtn");
    const savePlanBtn = document.getElementById("savePlanBtn");

    // ===== STATE =====
    let currentPlan = null;
    let userPreferences = null;

    // ===== API FUNCTIONS =====
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
        You are a workout coach who creates structured workout plans based on user preferences.

        Return plans in the following format, with each day and activity on its own line:

        Day #
        - Activity - Sets x Reps (or duration) - Weight/Intensity
        - Activity - Sets x Reps (or duration) - Weight/Intensity
        - etc.

        Available Workout Options:

        Bodyweight:
        - Push-Up
        - Sit-up
        - Leg Raises
        - Pull-up

        Weights (Upper Body):
        - Bench Press
        - Incline Bench Press
        - Shoulder Press
        - Lateral Raises
        - Triceps Extensions
        - Row
        - Curl
        - Hammer Curl

        Weights (Lower Body):
        - Deadlift
        - Squat
        - Romanian Deadlift
        - Split Squat
        - Hamstring Curl
        - Quad Extension
        - Hip Adduction
        - Hip Abduction
        - Calf Raises

        Cardio:
        - Stair Climber
        - Row Machine
        - 100m Sprint
        - 200m Sprint
        - 400m Sprint
        - 800m Sprint
        - Running
        - Cycling

        User Preferences:
        - Goal: ${goal}
        - Experience Level: ${experience}
        - Frequency: ${frequency} days/week
        - Session Duration: ${duration} minutes
        - Equipment Available: ${equipment.join(", ")}
        - Preferred Activities: ${activities}
        - Medical Notes: ${medical}

        Match the user's preferred activities whenever possible while keeping workouts safe, realistic, and aligned with their goal.
        `;

        try {
            const response = await fetch("/Workouts/AI?handler=GeneratePlan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userPrompt })
            });

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);
            
            const result = await response.json();
            console.log("API result:", result);
            
            if (!result.success) {
                throw new Error(result.message || "AI failed to generate plan");
            }

            console.log("Returning plan:", result.plan);
            return result.plan;
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

    // ===== MARKDOWN RENDERER =====
    function renderMarkdownToHTML(text) {
        if (!text) return "";

        // Escape HTML first
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Split into lines for better processing
        const lines = html.split('\n');
        const processed = [];
        let inList = false;
        let listItems = [];
        let listType = null;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Check for list items
            const bulletMatch = line.match(/^\s*[-*•]\s+(.+)$/);
            const numberedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
            
            if (bulletMatch) {
                if (!inList || listType !== 'ul') {
                    if (inList) {
                        processed.push(wrapList(listItems, listType));
                        listItems = [];
                    }
                    inList = true;
                    listType = 'ul';
                }
                listItems.push(bulletMatch[1]);
            } else if (numberedMatch) {
                if (!inList || listType !== 'ol') {
                    if (inList) {
                        processed.push(wrapList(listItems, listType));
                        listItems = [];
                    }
                    inList = true;
                    listType = 'ol';
                }
                listItems.push(numberedMatch[1]);
            } else {
                // Not a list item
                if (inList) {
                    processed.push(wrapList(listItems, listType));
                    listItems = [];
                    inList = false;
                    listType = null;
                }
                processed.push(line);
            }
        }
        
        if (inList) {
            processed.push(wrapList(listItems, listType));
        }

        html = processed.join('\n');

        // Process headings (must be on their own line)
        html = html.replace(/^####\s+(.+)$/gm, '<h5 class="urbanist-bold text-blue mt-4 mb-2">$1</h5>');
        html = html.replace(/^###\s+(.+)$/gm, '<h4 class="urbanist-bold text-blue mt-4 mb-3">$1</h4>');
        html = html.replace(/^##\s+(.+)$/gm, '<h3 class="urbanist-bold text-blue mt-4 mb-3">$1</h3>');
        html = html.replace(/^#\s+(.+)$/gm, '<h2 class="urbanist-bold text-blue mt-5 mb-3">$1</h2>');

        // Bold and italic
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-blue">$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Horizontal rules
        html = html.replace(/^---+$/gm, '<hr class="my-4 border-blue">');

        // Convert double newlines to paragraphs
        html = html.replace(/\n\n+/g, '</p><p class="urbanist-medium text-black mb-3">');
        html = '<p class="urbanist-medium text-black mb-3">' + html + '</p>';

        // Clean up empty paragraphs
        html = html.replace(/<p[^>]*>\s*<\/p>/g, '');

        return html;
    }

    function wrapList(items, type) {
        if (items.length === 0) return '';
        const tag = type === 'ul' ? 'ul' : 'ol';
        const listClass = type === 'ul' 
            ? 'list-unstyled ms-3 mb-3' 
            : 'ms-4 mb-3';
        
        const liItems = items.map(item => {
            // Process inline formatting in list items
            let formatted = item
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-blue">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
            
            return type === 'ul' 
                ? `<li class="urbanist-medium text-black mb-2"><i class="fas fa-check-circle text-blue me-2"></i>${formatted}</li>`
                : `<li class="urbanist-medium text-black mb-2">${formatted}</li>`;
        }).join('\n');
        
        return `<${tag} class="${listClass}">\n${liItems}\n</${tag}>`;
    }

    // ===== FORM HANDLING =====
    async function handleFormSubmit(e) {
        if (e) e.preventDefault();

        // Collect form data
        const formData = {
            fitnessGoal: document.getElementById("fitnessGoal")?.value.trim(),
            experienceLevel: document.getElementById("experienceLevel")?.value.trim(),
            workoutFrequency: document.getElementById("workoutFrequency")?.value.trim(),
            sessionDuration: document.getElementById("sessionDuration")?.value.trim(),
            preferredActivities: document.getElementById("preferredActivities")?.value.trim(),
            medicalNotes: document.getElementById("medicalNotes")?.value.trim(),
        };

        userPreferences = formData;

        // Re-query elements in case DOM changed
        const resultSection = document.getElementById("aiPlanResult");
        const loading = document.getElementById("loadingState");
        const planOutput = document.getElementById("aiPlanText");
        const buttons = document.getElementById("actionButtons");

        // Show result section and loading state
        if (resultSection) resultSection.style.display = "block";
        if (loading) loading.style.display = "block";
        if (planOutput) planOutput.style.display = "none";
        if (buttons) buttons.style.display = "none";

        // Scroll to results
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        try {
            console.log("Calling generateAIPlan...");
            const planText = await generateAIPlan(formData);
            console.log("AI Plan received");

            const renderedHTML = renderMarkdownToHTML(planText);

            const outputElement = document.getElementById("aiPlanText");
            console.log("Output element found:", !!outputElement);

            if (outputElement) {
                outputElement.innerHTML = renderedHTML;
            } else {
                console.error("aiPlanText element not found!");
            }

            if (loading) loading.style.display = "none";

            const outputToShow = document.getElementById("aiPlanText");
            if (outputToShow) outputToShow.style.display = "block";

            const buttonsToShow = document.getElementById("actionButtons");
            if (buttonsToShow) buttonsToShow.style.display = "flex";

        } catch (error) {
            console.error("Error in handleFormSubmit:", error);

            if (loading) loading.style.display = "none";
            if (planOutput) {
                planOutput.style.display = "block";
                planOutput.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Error:</strong> ${error.message}
                    </div>
                `;
            }
            if (buttons) buttons.style.display = "none";
        }
    }


    // ===== HELPERS =====
    function showSuccess(message) {
        alert(message);
    }

    function showError(message) {
        alert(message);
    }

    // ===== EVENT LISTENERS =====
    aiPlannerForm?.addEventListener("submit", handleFormSubmit);

    regeneratePlanBtn?.addEventListener("click", () => {
        if (userPreferences) {
            handleFormSubmit(null);
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
});