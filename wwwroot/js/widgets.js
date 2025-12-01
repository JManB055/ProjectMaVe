/*
*   Initialize Global variables:
*       'templateContainer' is the container for all template widgets (used for previewing and adding widgets)
*       'container' is the dashboard container for all the widgets; all widgets are rendered within this object.
*       'editSaveBtn' is the button that changes the 'draggable' state.
*       'deleteBtns' is an array storing all delete buttons (used so that we can hide the delete buttons)
*       'widgets' is the array of widget metadata used to render the widgets with the right place, size, and data.
*       'draggies' is the array of Draggabilly objects tied to the widgets. This is necessary for dragging capabilities.
*       'draggable' is a boolean to track the state of the dashboard (editing mode vs view mode)
*       'workouts' is a list of workouts from the database used to display information in widgets
*/
const templateContainer = document.querySelector('.template_container'); templateContainer.hidden = true;
const container = document.querySelector('.dashboard_container');
const editSaveBtn = document.getElementById('editSaveBtn');
let deleteBtns;
let specialItems;
let addBtns;
let widgets = [];
let draggies = [];
let draggable = true;
let workoutList;
let graphs = [];

document.addEventListener("DOMContentLoaded", async function () {
    await getWidgets();
});

window.onresize = async function () {
    await renderWidgets();
    toggleDraggable(true);
};

/*
*   Adds EventListener for the delete button. On Click:
*       1) Save current widget positions
*       2) Delete widget from 'widgets' array
*       3) Re-Render the 'widgets' array
*/
container.addEventListener('click', (event) => {
    // Check if the clicked element is a delete button or inside one (in case of icon click)
    const btn = event.target.closest('.delete-btn');

    if (btn) {
        const index = parseInt(btn.dataset.index);

        // 1. Save current widget positions
        for (let i = 0; i < draggies.length; i++) {
            if (widgets[i] && draggies[i]) {
                widgets[i].x = draggies[i].position.x;
                widgets[i].y = draggies[i].position.y;
            }
        }

        // 2. (Optimistic UI)
        const widgetCard = btn.closest('.widget');
        if (widgetCard) {
            widgetCard.remove();
        }

        // 3. Delete widget from 'widgets' array
        widgets.splice(index, 1);

        // 4. Save Changes to Database
        saveWidgets();

        // 5. Re-Render the 'widgets' array
        renderWidgets();
    }
});

/*
*   Function to render widgets in HTML
*       1) Initialize string variable to store HTML code (for formatting)
*       2) Write HTML code to 'htmlString' based on widget metadata (Contains large switch statement)
*       3) Set the HTML code of 'container'
*       4) Save all delete buttons
*
*   And initialize Draggabilly objects
*       5) Get all qualifying objects from the HTML as 'elements'
*       6) Add all 'elements' to 'draggies' as Draggabilly objects
*       7) Set the widget positions
*       8) Display graphs in widgets when applicable
*/
async function renderWidgets() {
    // Initialize string variable to store HTML code
    let htmlString = '';

    let viewportWidth = window.innerWidth;
    //let viewportWidth = 1000;

    graphs = [];

    // Write HTML code to 'htmlString' based on widget metadata (in 'widgets' array)
    let data = await getWorkoutInfo()
    workoutList = data.workouts;

    let todayDate = new Date();

    for (let i = 0; i < widgets.length; i++) {
        let widgetType = widgets[i].type;
        let filterValue = "";
        let metricValue = "";
        if (widgetType.startsWith("Weight History")) {
            let temp = widgetType.split(",");
            widgetType = temp[0];
            metricValue = temp[1];
            filterValue = temp[2];
        }

        switch (widgetType) {
            case "Test Widget":
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Goal</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content mt-4 pt-4"> <div class="placeholder-content"> <i class="fas fa-bullseye fa-2x text-blue mb-2"></i>' +
                    '<p class="urbanist-medium small">Widget Template</p> </div></div></div>';
                break;

            case "Daily Strength":

                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Strength </h3>' +
                    '<button class="delete-btn delete-btn-color btn ml-1" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content pt-1"> <div class="daily-workout">' +
                    '<table><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr>';

                for (let j = 0; j < workoutList.length; j++) {
                    let dateFormatted = workoutList[j].date.replaceAll("-", "/");
                    let workoutDate = new Date(dateFormatted);
                    if (todayDate.toDateString() != workoutDate.toDateString()) continue;
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];
                        if (exercise.muscleGroup == "Endurance") {
                            continue;
                        }
                        htmlString += '<tr><td>' + exercise.activity + '</td><td>' + exercise.sets + '</td><td>' + exercise.reps + '</td><td>' + exercise.weight + ' lbs</td></tr>';
                    }
                }

                htmlString += '</table></div></div></div>';
                break;

            case "Daily Cardio":
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Cardio</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content pt-1"> <div class="daily-workout">' +
                    '<table><tr><th>Exercise</th><th>Distance</th><th>Duration</th></tr>';

                for (let j = 0; j < workoutList.length; j++) {
                    let dateFormatted = workoutList[j].date.replaceAll("-", "/");
                    let workoutDate = new Date(dateFormatted);
                    if (todayDate.toDateString() != workoutDate.toDateString()) continue;
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];
                        if (exercise.muscleGroup != "Endurance") {
                            continue;
                        }
                        htmlString += '<tr><td>' + exercise.activity + "</td><td>" + exercise.distance + ' km</td><td>' + exercise.time + ' mins.</td></tr>';
                    }
                }

                htmlString += '</table></div></div></div>';
                break;

            case "Daily Workout 1x2":
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Workouts</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content"> <div class="daily-workout daily-workout-1x2">' +
                    '<div class="pt-1"><h1>Strength</h1><table><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr>';

                for (let j = 0; j < workoutList.length; j++) {
                    let dateFormatted = workoutList[j].date.replaceAll("-", "/");
                    let workoutDate = new Date(dateFormatted);
                    if (todayDate.toDateString() != workoutDate.toDateString()) continue;
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];
                        if (exercise.muscleGroup == "Endurance") {
                            continue;
                        }
                        htmlString += '<tr><td>' + exercise.activity + '</td><td>' + exercise.sets + '</td><td>' + exercise.reps + '</td><td>' + exercise.weight + ' lbs</td></tr>';
                    }
                }

                htmlString += '</table></div><div class="pt-1"><h1>Cardio</h1><table><tr><th>Exercise</th><th>Distance</th><th>Duration</th></tr>';

                for (let j = 0; j < workoutList.length; j++) {
                    let dateFormatted = workoutList[j].date.replaceAll("-", "/");
                    let workoutDate = new Date(dateFormatted);
                    if (todayDate.toDateString() != workoutDate.toDateString()) continue;
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];
                        if (exercise.muscleGroup != "Endurance") {
                            continue;
                        }
                        htmlString += '<tr><td>' + exercise.activity + "</td><td>" + exercise.distance + ' km</td><td>' + exercise.time + ' mins.</td></tr>';
                    }
                }

                htmlString += '</table></div></div></div></div>';

                break;

            case "Daily Workout 2x1":
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Workouts</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content"> <div class="daily-workout daily-workout-2x1">' +
                    '<div class="pt-1"><h1>Strength</h1><table><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr>';

                for (let j = 0; j < workoutList.length; j++) {
                    let dateFormatted = workoutList[j].date.replaceAll("-", "/");
                    let workoutDate = new Date(dateFormatted);
                    if (todayDate.toDateString() != workoutDate.toDateString()) continue;
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];
                        if (exercise.muscleGroup == "Endurance") {
                            continue;
                        }
                        htmlString += '<tr><td>' + exercise.activity + '</td><td>' + exercise.sets + '</td><td>' + exercise.reps + '</td><td>' + exercise.weight + ' lbs</td></tr>';
                    }
                }

                htmlString += '</table></div><div class="pt-1"><h1>Cardio</h1><table><tr><th>Exercise</th><th>Distance</th><th>Duration</th></tr>';

                for (let j = 0; j < workoutList.length; j++) {
                    let dateFormatted = workoutList[j].date.replaceAll("-", "/");
                    let workoutDate = new Date(dateFormatted);
                    if (todayDate.toDateString() != workoutDate.toDateString()) continue;
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];
                        if (exercise.muscleGroup != "Endurance") {
                            continue;
                        }
                        htmlString += '<tr><td>' + exercise.activity + "</td><td>" + exercise.distance + ' km</td><td>' + exercise.time + ' mins.</td></tr>';
                    }
                }

                htmlString += '</table></div></div></div></div>';

                break;

            case "Weight History":
                let metricTitleCase = metricValue.charAt(0).toUpperCase() + metricValue.slice(1);

                console.log("Ln 238 Metric Value: ", metricValue);

                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">' + metricTitleCase + ' History</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content"> <div id="graph-' + i + '" style="width:100%;height:100%;">' +
                    '</div ></div ></div > ';

                let gData = [];

                let units;
                switch (metricValue) {
                    case "weight":
                        units = " (lbs)";
                        break;
                    case "time":
                        units = " (minutes)";
                        break;
                    case "distance":
                        units = " (miles)";
                        break;
                    case "reps":
                        units = "";
                        break;
                    case "sets":
                        units = "";
                        break;
                }

                for (let j = 0; j < workoutList.length; j++) {
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];

                        if (exercise[metricValue] == 0 || exercise[metricValue] == null) {
                            continue;
                        }

                        if ((filterValue != "All") && (exercise.muscleGroup != filterValue)) {
                            continue;
                        }

                        gIndex = gData.findIndex(checkName);
                        function checkName(value, index, array) {
                            return value.name == exercise.activity;
                        }

                        // If the exercise is not already in the gData
                        if (gIndex == -1) {
                            gData.push({ name: exercise.activity, x: [], y: [], type: 'scatter' });
                            gIndex = gData.length - 1;
                        }

                        gData[gIndex].x.push(workoutList[j].date);
                        gData[gIndex].y.push(exercise[metricValue]);
                    }
                }

                let gLayout = {
                    title: {
                        text: filterValue + ' ' + metricTitleCase + ' Workouts'
                    },
                    xaxis: {
                        title: {
                            text: 'Date'
                        }
                    },
                    yaxis: {
                        title: {
                            text: metricTitleCase + units
                        }
                    },
                    showlegend: (viewportWidth > 770)
                }

                graphs.push({
                    graphIndex: i,
                    graphData: gData,
                    graphLayout: gLayout
                });

                break;

            case "Type Pie Chart":
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Exercise Types</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content"> <div id="graph-' + i + '" style="width:100%;height:100%;">' +
                    '</div ></div ></div > ';


                let pgData = [{
                    values: [],
                    labels: [],
                    type: "pie"
                }];

                for (let j = 0; j < workoutList.length; j++) {
                    for (let k = 0; k < workoutList[j].exercises.length; k++) {
                        let exercise = workoutList[j].exercises[k];

                        gIndex = pgData[0].values.indexOf(exercise.activity);

                        if (gIndex == -1) {
                            pgData[0].labels.push(exercise.activity);
                            pgData[0].values.push(1);
                            gIndex = pgData[0].values.length - 1;
                        }

                        else {
                            pgData[0].values[gIndex] = pgData[0].values[gIndex] + 1;
                        }
                    }
                }

                let pgLayout = {
                    title: {
                        text: "Workout Types"
                    },
                    showlegend: (viewportWidth > 770)
                }

                graphs.push({
                    graphIndex: i,
                    graphData: pgData,
                    graphLayout: pgLayout
                });
                break;

            default:
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Goal</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content mt-4 pt-4"> <div class="placeholder-content"> <i class="fas fa-bullseye fa-2x text-blue mb-2"></i>' +
                    '<p class="urbanist-medium small">Widget Not Found</p> </div></div></div>';
        }
    }


    if (htmlString == '') {
        htmlString = "<div class=\"no-widget-message\"><h1>It looks like you don't have any widgets yet...</h1><p>" +
            (draggable ? "Hit the Add Widget button at the top of the page, " : "Hit the Edit button at the top of the page, ") +
            "then add your first widget to get started!" +
            "</p><p>Don't forget to hit Save when you're done!</p></div>";
    }

    // Set the HTML code of 'container' based on previous formatting
    container.innerHTML = htmlString;

    // Get all qualifying delete buttons and save to deleteBtns
    deleteBtns = document.querySelectorAll(".delete-btn", {});

    specialItems = document.querySelectorAll(".special-item", {});

    // Get all qualifying objects from the HTML as 'elements'
    let elements = document.querySelectorAll('.widget', {});
    draggies = []

    console.log("Screen Width: ", viewportWidth);
    if (viewportWidth >= 1400) {
        // Add all 'elements' to 'draggies' as graggabilly objects
        for (let i = 0; i < elements.length; i++) {
            let draggableElem = elements[i];
            let draggie = new Draggabilly(draggableElem, {
                grid: [8, 8],
                containment: ".dashboard_container"
            });
            draggies.push(draggie);
        }

        // Set the postions based on saved positions
        for (let i = 0; i < widgets.length; i++) {
            let draggable = widgets[i];
            x = widgets[i].x;
            y = widgets[i].y;
            draggies[i].setPosition(x, y);
        }
    }

    // Display graphs in widgets when applicable
    for (let i = 0; i < graphs.length; i++) {
        Plotly.newPlot(('graph-' + graphs[i].graphIndex), graphs[i].graphData, graphs[i].graphLayout);
    }
}

/*
*   Function to toggle the draggable state of the widgets
*       1) If they are currently draggable, then:
*           1) Disable
*           2) Save all widget positions locally
*           3) Change the 'editSaveBtn' to Edit
*           4) Save the new widget states to database.
*
*       2) If they are not currently draggable, then:
*           1) Enable draggabilly
*           2) Change the 'editSaveBtn' to Save.
*
*       3) Hide/Show widget templates (for previewing and adding new widgets) based on draggable status
*       4) Hide/Show delete buttons based on draggable status
*       5) Toggle to boolean 'draggable' variable to track state.
*/
function toggleDraggable(forceNotDraggable = false) {
    let viewportWidth = window.innerWidth;

    if (viewportWidth < 1400) {
        for (let i = 0; i < deleteBtns.length; i++) {
            deleteBtns[i].hidden = true;
        }

        for (let i = 0; i < specialItems.length; i++) {
            specialItems[i].hidden = true;
        }
        return;
    }

    if (forceNotDraggable) {
        draggable = true;
    }

    if (draggable) {
        // If currently draggable
        for (let i = 0; i < draggies.length; i++) {
            // Disable draggabilly for each object
            draggies[i].disable();

            // Save widget position for each object
            widgets[i].x = draggies[i].position.x;
            widgets[i].y = draggies[i].position.y;
        }

        // Update 'editSaveBtn' to Edit
        editSaveBtn.innerHTML = '<i class="fas fa-edit me-2"></i>Edit';

        // Save the current widget states to the database
        saveWidgets();
    }
    else {
        // If not currently draggable
        for (let i = 0; i < draggies.length; i++) {
            // Enable draggabilly for each object
            draggies[i].enable();
        }

        // Update the 'editSaveButton' to Save
        editSaveBtn.textContent = "Save";
        editSaveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save';
    }

    // Hide/Show Widget Templates based on draggable status
    templateContainer.hidden = draggable;

    // Hide/Show Delete Buttons based on draggable status
    for (let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].hidden = draggable;
    }

    for (let i = 0; i < specialItems.length; i++) {
        specialItems[i].hidden = draggable;
    }

    // Toggle draggable state
    draggable = !draggable;
}

/*
*   Function to add widget to the widget array based on width, height, and type.
*   Called when '+' button is pressed on widget templates.
*       1) Save existing widget positions locally
*       2) Push new widget to local array of widgets
*       3) Rerender widgets with new widget added
*/
function addWidget(width, height, widgetType) {
    // Save existing widgets locally
    for (let i = 0; i < draggies.length; i++) {
        if (widgets[i] && draggies[i]) {
            widgets[i].x = draggies[i].position.x;
            widgets[i].y = draggies[i].position.y;
        }
    }

    if (widgetType == "Weight History") {
        let metricFilterMenu = document.getElementById("metricHistoryFilter");
        let filterMenu = document.getElementById("weightHistoryFilter");

        let metricFilter = metricFilterMenu.value;
        widgetType += "," + metricFilter
        let muscleGroupFilter = filterMenu.value;
        widgetType = widgetType + "," + muscleGroupFilter;
    }
    else if (widgetType == "Weight History-2") {
        widgetType = "Weight History";
        let filterMenu = document.getElementById("weightHistoryFilter-2");
        let metricFilterMenu = document.getElementById("metricHistoryFilter-2");

        let metricFilter = metricFilterMenu.value;
        widgetType += "," + metricFilter
        let muscleGroupFilter = filterMenu.value;
        widgetType = widgetType + "," + muscleGroupFilter;
    }

    // Push new widget to widgets array
    widgets.push({ x: 32, y: 32, w: width, h: height, type: widgetType });

    // --- IMMEDIATE VISUAL FEEDBACK (Optimistic UI) ---
    // Create a temporary placeholder widget and append it to the container immediately.
    // This removes the delay while waiting for renderWidgets() to fetch data.
    let tempDiv = document.createElement('div');
    tempDiv.className = `widget widget_card size-${width}x${height}`;
    // Position matches default push location
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '32px';
    tempDiv.style.top = '32px';

    // Simple HTML shell matching your style
    tempDiv.innerHTML = `
        <div class="widget-header">
            <h3 class="widget-title urbanist-bold">Loading...</h3>
            <button class="delete-btn delete-btn-color btn"><i class="fa-solid fa-x"></i></button>
        </div>
        <div class="widget-content mt-4 pt-4">
            <div class="placeholder-content">
                <i class="fas fa-circle-notch fa-spin fa-2x text-blue mb-2"></i>
            </div>
        </div>`;

    container.appendChild(tempDiv);
    // --------------------------------------------------

    // Save immediately so DB is in sync
    saveWidgets();

    // Render widgets (this will overwrite the tempDiv when it finishes loading data)
    renderWidgets();
}

/*
*   Function to get widgets from the database.
*   Called upon loading the page.
*   1) Gets widgets from the database in JSON format
*   2) If successful:
*       1) Replace local widgets array with data from database
*       2) Rerender widgets
*       3) Set draggable to false
*   3) If not successful, throws error to console.
*/
async function getWidgets() {
    try {
        // Get widgets from te database in JSON format
        const response = await fetch(`/Dashboard?handler=Widgets`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            console.log('Widgets loaded successfully:', result.widgets);
            widgets = result.widgets; // Replace current widgets array
            await renderWidgets(widgets); // Render Widgets
            toggleDraggable(true); // Set draggable to false
        } else {
            console.warn('Failed to load widgets:', result.message);
        }
    } catch (error) {
        console.error('Error loading widgets:', error);
    }
}

/*
*   Function to save widgets to the database.
*   Called when 'Save' button is pressed.
*/
async function saveWidgets() {
    try {
        const response = await fetch('/Dashboard?handler=SaveWidgets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(widgets)
        });

        const result = await response.json();

        if (result.success) {
            console.log('Widgets saved successfully!');
        } else {
            console.warn('Failed to save widgets:', result.message);
        }

    } catch (error) {
        console.error('Error saving widgets:', error);
    }
}

/*
*   Function to get workout data from the database, returns an array
*   1) Call page handler to get workout data from the database
*   2) If success, log success, then format the output for widgets
*   3) Else, Send warning to console
*   4) In case of error, throw error to console
*/
async function getWorkoutInfo() {
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
            console.log('Exercises:', result.workouts[0].exercises)

            let exerciseList = await getExerciseList();
            let workoutsFormatted = [];

            for (let i = 0; i < result.workouts.length; i++) {
                let tempWorkout = {
                    date: result.workouts[i].workoutDate,
                    exercises: []
                };

                for (let j = 0; j < result.workouts[i].exercises.length; j++) {
                    let tempExercise = result.workouts[i].exercises[j];

                    tempWorkout.exercises.push(
                        {
                            activity: exerciseList[tempExercise.exerciseID - 1].name,
                            muscleGroup: exerciseList[tempExercise.exerciseID - 1].muscleGroup,
                            sets: tempExercise.sets,
                            reps: tempExercise.reps,
                            weight: tempExercise.weight,
                            time: tempExercise.time,
                            distance: tempExercise.distance
                        });
                }

                workoutsFormatted.push(tempWorkout);
            }

            return { workouts: workoutsFormatted };

        } else {
            console.warn('Failed to load workouts:', result.message);
            return [];
        }

    } catch (error) {
        console.error('Error loading workouts:', error);
        return [];
    }
}


/*
*   Function to get list of possible exercise names and muscle groups
*   1) Calls the page handler and awaits for JSON response
*   2) If success, then return the list of exercises
*   3) Else, send warning to console
*   4) In case of error, throw error to console
*/
async function getExerciseList() {
    try {
        // Calls the page handler and awaits for JSON response
        const response = await fetch(`/Dashboard?handler=ExerciseInfo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        // If success, then return the list of exercises
        if (result.success) {
            console.log('Exercise List loaded successfully:', result.exercises);
            return result.exercises;
        }
        // Else, send warning to console
        else {
            console.warn('Failed to load exercises:', result.message);
            return [];
        }
    } catch (error) {
        // In case of error, throw error to console
        console.error('Error loading exercises: ', error);
        return [];
    }
}