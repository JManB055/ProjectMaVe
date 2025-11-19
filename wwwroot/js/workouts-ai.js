document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM ELEMENTS =====
    const aiPlannerForm = document.getElementById("aiPlannerForm");
    const aiPlanResult = document.getElementById("aiPlanResult");
    const loadingState = document.getElementById("loadingState");
    const aiPlanText = document.getElementById("aiPlanText");
    const actionButtons = document.getElementById("actionButtons");
    const regeneratePlanBtn = document.getElementById("regeneratePlanBtn");
    const exportImageBtn = document.getElementById("exportImageBtn");

    // ===== STATE =====
    let currentPlan = null;
    let userPreferences = null;
    let userName = null; // Can be set from user profile if available
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

    // ===== IMAGE EXPORT FUNCTION =====
    async function exportPlanAsImage() {
        const exportCard = document.getElementById("exportablePlanCard");
        if (!exportCard) {
            showError("Unable to export plan. Please try again.");
            return;
        }

        try {
            // Show loading state
            const exportBtn = document.getElementById("exportImageBtn");
            const originalText = exportBtn ? exportBtn.innerHTML : '';
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating Image...';
            }

            // Use html2canvas library (needs to be included in the page)
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }

            const canvas = await html2canvas(exportCard, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality
                logging: false,
                useCORS: true
            });

            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().split('T')[0];
                link.download = `FitSync-Workout-Plan-${timestamp}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);

                // Restore button
                if (exportBtn) {
                    exportBtn.disabled = false;
                    exportBtn.innerHTML = originalText;
                }

                showSuccess("Plan exported successfully!");
            });

        } catch (error) {
            console.error("Error exporting plan:", error);
            showError("Failed to export plan as image. Please try again.");
            
            // Restore button
            const exportBtn = document.getElementById("exportImageBtn");
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = '<i class="fas fa-image me-2"></i>Export as Image';
            }
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

    // ===== CREATE EXPORTABLE CARD =====
    function createExportableCard(planHTML) {
        const currentDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
            <div id="exportablePlanCard">
                <div class="plan-header">
                    <div class="logo">
                        <i class="fas fa-dumbbell me-2"></i>FitSync
                    </div>
                    <div class="subtitle">Your Personalized Workout Plan</div>
                </div>
                
                ${userName ? `
                <div class="user-info">
                    <div class="user-name">
                        <i class="fas fa-user-circle me-2"></i>${userName}
                    </div>
                </div>
                ` : ''}
                
                <div class="plan-content">
                    ${planHTML}
                </div>
                
                <div class="plan-footer">
                    <div>Generated on ${currentDate}</div>
                    <div class="mt-1">
                        <i class="fas text-danger"></i> Made with FitSync AI
                    </div>
                </div>
            </div>
        `;
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
            
            currentPlan = planText;

            const renderedHTML = renderMarkdownToHTML(planText);
            const exportableHTML = createExportableCard(renderedHTML);

            const outputElement = document.getElementById("aiPlanText");
            console.log("Output element found:", !!outputElement);

            if (outputElement) {
                outputElement.innerHTML = exportableHTML;
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

    exportImageBtn?.addEventListener("click", exportPlanAsImage);

    // Try to get user name from page if available
    // This can be adapted based on your authentication system
    const userNameElement = document.querySelector('[data-user-name]');
    if (userNameElement) {
        userName = userNameElement.getAttribute('data-user-name');
    }
});