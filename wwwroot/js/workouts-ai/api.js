/**
 * API module for Workouts AI
 * Handles communication with the backend
 */

export async function generateAIPlan(formData) {
    const goal =
      document.getElementById("fitnessGoal")?.value.trim() ||
      formData.fitnessGoal;
    const frequency =
      document.getElementById("workoutFrequency")?.value.trim() ||
      formData.workoutFrequency;
    const experience =
      document.getElementById("experienceLevel")?.value.trim() ||
      formData.experienceLevel;
    const duration =
      document.getElementById("sessionDuration")?.value.trim() ||
      formData.sessionDuration;
    const activities =
      document.getElementById("preferredActivities")?.value.trim() ||
      formData.preferredActivities;
    const medical =
      document.getElementById("medicalNotes")?.value.trim() ||
      formData.medicalNotes;

    const equipment = [];
    [
      "equipDumbbells",
      "equipBarbell",
      "equipMachines",
      "equipBodyweight",
      "equipCardio",
      "equipBands",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el?.checked) equipment.push(el.value);
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
        body: JSON.stringify({ prompt: userPrompt }),
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
