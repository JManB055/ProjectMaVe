document.addEventListener("DOMContentLoaded", () => {
    // ===== DOM ELEMENTS =====
    const workoutTableBody = document.getElementById("workoutTableBody");
    const emptyState = document.getElementById("emptyState");
    const filterType = document.getElementById("filterType");
    const filterDate = document.getElementById("filterDate");
    const sortBy = document.getElementById("sortBy");
    const applyFiltersBtn = document.getElementById("applyFilters");
    const totalWorkouts = document.getElementById("totalWorkouts");
    const totalStrength = document.getElementById("totalStrength");
    const totalCardio = document.getElementById("totalCardio");

    // ===== STATE =====
    let workouts = [];
    let filteredWorkouts = [];

    // ===== API FUNCTIONS =====
    async function fetchWorkouts() {
        try {
            // Get workouts from te database in JSON format
            const response = await fetch(`/Dashboard?handler=WorkoutInfo`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const result = await response.json();
    
            if (result.success) {
                console.log('Workouts loaded successfully:', result.workouts);
                workouts = result.workouts; // Replace current workouts array
            } else {
                console.warn('Failed to load workouts:', result.message);
            }
            filteredWorkouts = [...workouts];
            updateStats();
            renderWorkouts();
        } catch (error) {
            console.error("Error fetching workouts:", error);
            showError("Failed to load workouts. Please try again.");
        }
    }

    async function deleteWorkout(workoutId) {
        if (!confirm("Are you sure you want to delete this workout?")) return;

        try {
            // TODO: Replace with actual API call
            
            workouts = workouts.filter(w => w.id !== workoutId);
            filteredWorkouts = filteredWorkouts.filter(w => w.id !== workoutId);
            updateStats();
            renderWorkouts();
            
            showSuccess("Workout deleted successfully!");
        } catch (error) {
            console.error("Error deleting workout:", error);
            showError("Failed to delete workout. Please try again.");
        }
    }

    // ===== FILTER & SORT =====
    function applyFilters() {
        filteredWorkouts = [...workouts];

        // Filter by type
        const typeFilter = filterType.value;
        if (typeFilter !== "all") {
            filteredWorkouts = filteredWorkouts.filter(w => {
                const hasStrength = w.exercises.some(ex => ex.muscle !== "Cardio");
                const hasCardio = w.exercises.some(ex => ex.muscle === "Cardio");
                
                if (typeFilter === "strength") return hasStrength;
                if (typeFilter === "cardio") return hasCardio;
                return true;
            });
        }

        // Filter by date
        const dateFilter = filterDate.value;
        if (dateFilter !== "all") {
            const now = new Date();
            const cutoffDate = new Date();
            
            if (dateFilter === "week") cutoffDate.setDate(now.getDate() - 7);
            else if (dateFilter === "month") cutoffDate.setMonth(now.getMonth() - 1);
            else if (dateFilter === "year") cutoffDate.setFullYear(now.getFullYear() - 1);

            filteredWorkouts = filteredWorkouts.filter(w => new Date(w.date) >= cutoffDate);
        }

        // Sort
        const sortOption = sortBy.value;
        if (sortOption === "date-desc") {
            filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortOption === "date-asc") {
            filteredWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortOption === "exercises-desc") {
            filteredWorkouts.sort((a, b) => b.exercises.length - a.exercises.length);
        }

        renderWorkouts();
    }

    // ===== STATS =====
    function updateStats() {
        const total = workouts.length;
        const strength = workouts.filter(w => w.exercises.some(ex => ex.muscle !== "Cardio")).length;
        const cardio = workouts.filter(w => w.exercises.some(ex => ex.muscle === "Cardio")).length;

        totalWorkouts.textContent = total;
        totalStrength.textContent = strength;
        totalCardio.textContent = cardio;

        // Animate numbers
        [totalWorkouts, totalStrength, totalCardio].forEach(el => {
            el.classList.add("animate__animated", "animate__pulse");
            setTimeout(() => {
                el.classList.remove("animate__animated", "animate__pulse");
            }, 1000);
        });
    }

    // ===== RENDER =====
    function renderWorkouts() {
        if (!workoutTableBody) return;

        if (filteredWorkouts.length === 0) {
            workoutTableBody.innerHTML = "";
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        if (emptyState) emptyState.style.display = "none";

        workoutTableBody.innerHTML = filteredWorkouts.map(w => {
            const formattedDate = formatDate(w.date);
            const workoutType = determineWorkoutType(w.exercises);
            
            return `
                <tr>
                    <td class="urbanist-medium text-black">${formattedDate}</td>
                    <td>${workoutType}</td>
                    <td class="urbanist-medium text-black">${w.exercises.length} exercise${w.exercises.length !== 1 ? 's' : ''}</td>
                    <td>
                        <ul class="mb-0 ps-3 urbanist-medium text-black small">
                            ${w.exercises.map(ex => {
                                if (ex.muscle === "Cardio") {
                                    return `<li>${ex.exercise} - ${ex.duration || 0} min${ex.distance ? `, ${ex.distance} mi` : ""}</li>`;
                                } else {
                                    return `<li>${ex.exercise} - ${ex.sets}×${ex.reps}${ex.weight ? ` @ ${ex.weight}lbs` : ""}</li>`;
                                }
                            }).join("")}
                        </ul>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="/Workouts/Details/${w.id}" class="btn btn-outline-primary">
                                <i class="fas fa-eye"></i>
                            </a>
                            <button class="btn btn-outline-danger" onclick="deleteWorkout(${w.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ===== HELPERS =====
    function determineWorkoutType(exercises) {
        const hasStrength = exercises.some(ex => ex.muscle !== "Cardio");
        const hasCardio = exercises.some(ex => ex.muscle === "Cardio");
        
        if (hasStrength && hasCardio) {
            return '<span class="badge bg-info">Mixed</span>';
        } else if (hasStrength) {
            return '<span class="badge bg-primary">Strength</span>';
        } else {
            return '<span class="badge bg-success">Cardio</span>';
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00');
        return date.toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
        });
    }

    function showSuccess(message) {
        // TODO: Implement toast notification
        alert(message);
    }

    function showError(message) {
        // TODO: Implement toast notification
        alert(message);
    }

    // ===== EVENT LISTENERS =====
    applyFiltersBtn.addEventListener("click", applyFilters);

    // Make deleteWorkout available globally for inline onclick
    window.deleteWorkout = deleteWorkout;

    // ===== INITIALIZE =====
    fetchWorkouts();
});
