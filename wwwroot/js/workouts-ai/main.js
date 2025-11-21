/**
 * Main module for Workouts AI
 * Orchestrates the application logic
 */

import { generateAIPlan } from './api.js';
import { renderMarkdownToHTML, createExportableCard } from './renderer.js';
import { exportPlanAsImage } from './export.js';

document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM ELEMENTS =====
  const aiPlannerForm = document.getElementById("aiPlannerForm");
  const regeneratePlanBtn = document.getElementById("regeneratePlanBtn");
  const exportImageBtn = document.getElementById("exportImageBtn");

  // ===== STATE =====
  let currentPlan = null;
  let userPreferences = null;
  let userName = null; // Can be set from user profile if available

  // ===== HELPERS =====
  function showSuccess(message) {
    alert(message);
  }

  function showError(message) {
    alert(message);
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
    const buttonsContainer = document.getElementById("actionButtons");
    const exportBtn = document.getElementById("exportImageBtn");
    const regenBtn = document.getElementById("regeneratePlanBtn");

    // 1. UI SETUP: Hide previous results, Show Loading
    if (resultSection) resultSection.style.display = "block";
    if (loading) loading.style.display = "block";
    if (planOutput) planOutput.style.display = "none";

    // 2. BUTTON STATE: Hide BOTH buttons while loading
    if (buttonsContainer) buttonsContainer.style.display = "flex"; // Ensure container is there
    // Disable buttons until prompt is finished
    if (exportBtn) {
        exportBtn.style.display = "none"; 
        exportBtn.disabled = true;
    }
    if (regenBtn) {
        regenBtn.style.display = "none";
        regenBtn.disabled = true;
    }

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
      const exportableHTML = createExportableCard(renderedHTML, userName);

      const outputElement = document.getElementById("aiPlanText");

      if (outputElement) {
        outputElement.innerHTML = exportableHTML;
      } else {
        console.error("aiPlanText element not found!");
      }

      // 3. SUCCESS STATE: Hide loading, Show Result
      if (loading) loading.style.display = "none";
      const outputToShow = document.getElementById("aiPlanText");
      if (outputToShow) outputToShow.style.display = "block";

      // 4. RESTORE BUTTONS: Reveal both buttons now that data is ready
      if (exportBtn) {
          exportBtn.style.display = "inline-block";
          exportBtn.disabled = false;
      }
      if (regenBtn) {
          regenBtn.style.display = "inline-block";
          regenBtn.disabled = false;
      }

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
      
      // 5. ERROR STATE: Even on error, we should show Regenerate (so they can retry)
      // But we usually keep Export hidden (nothing to export)
      if (regenBtn) {
          regenBtn.style.display = "inline-block";
          regenBtn.disabled = false;
      }
    }
  }

  // ===== EVENT LISTENERS =====
  aiPlannerForm?.addEventListener("submit", handleFormSubmit);

  regeneratePlanBtn?.addEventListener("click", () => {
    if (userPreferences) {
      handleFormSubmit(null);
    }
  });

  exportImageBtn?.addEventListener("click", () => exportPlanAsImage(showError, showSuccess));

  // Try to get user name from page if available
  const userNameElement = document.querySelector("[data-user-name]");
  if (userNameElement) {
    userName = userNameElement.getAttribute("data-user-name");
  }
});