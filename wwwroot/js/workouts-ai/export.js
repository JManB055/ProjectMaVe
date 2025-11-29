/**
 * Export module for Workouts AI
 * Handles image export using html2canvas
 */

export async function exportPlanAsImage(showError, showSuccess) {
    const exportCard = document.getElementById("exportablePlanCard");
    if (!exportCard) {
      showError("Unable to export plan. Please try again.");
      return;
    }

    try {
      // Show loading state
      const exportBtn = document.getElementById("exportImageBtn");
      const originalText = exportBtn ? exportBtn.innerHTML : "";
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i>Generating Image...';
      }

      // Use html2canvas library (needs to be included in the page)
      if (typeof html2canvas === "undefined") {
        throw new Error("html2canvas library not loaded");
      }

      const canvas = await html2canvas(exportCard, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().split("T")[0];
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
        exportBtn.innerHTML =
          '<i class="fas fa-image me-2"></i>Export as Image';
      }
    }
  }
