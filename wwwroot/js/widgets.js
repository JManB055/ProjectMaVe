/*
*   Initialize Global variables:
*       'templateContainer' is the contianer for all template widgets (used for previewing and adding widgets)
*       'container' is the dashboard container for all the widgets; all widgets are rendered within this object.
*       'editSaveBtn' is the button that changes the 'draggable' state.
*       'deleteBtns' is an array storing all delete buttone (used so that we can hide the delete buttons)
*       'widgets' is the array of widget metadata used to render the widgets with the right place, size, and data.
*       'draggies' is the array of Draggabilly objects tied to the widgets. This is neccessary for draggaing capabilities.
*       'draggable' is a boolean to track the state of the dashboard (editing mode vs view mode)
*       'workouts' is a list of workouts from the database used to display information in widgets
*/
const templateContainer = document.querySelector('.template_container'); templateContainer.hidden = true;
const container = document.querySelector('.dashboard_container');
const editSaveBtn = document.getElementById('editSaveBtn');
var deleteBtns;
var addBtns;
var widgets = [];
var draggies = [];
var draggable = true;
var workoutList;



// Set default widgets for testing (Commented out as it now pulls widgets from the database. Keeping for potentially setting default widgets later.)
/*
var defaultWidgets = [
    { userID: 1006, x: 64, y: 64, w: 2, h: 2, type: 'Test Widget' },
    { userID: 1006, x: 640, y: 64, w: 1, h: 1, type: 'Test Widget' },
    { userID: 1006, x: 640, y: 350, w: 1, h: 1, type: 'Test Widget' },
    { userID: 1006, x: 928, y: 64, w: 1, h: 2, type: 'Test Widget' }
];
widgets = defaultWidgets;*/

/*
*   Set up the initial page rendering
*       1) Set widget templates used when adding a widget to the dashboard
*       2) Get widget information from the database using 'getWidgets' function
*/

// Get widget information from database
getWidgets()

/*
*   Adds EventListener for the delete button. On Click:
*       1) Save current widget positions
*       2) Delete widget from 'widgets' array
*       3) Re-Render the 'widgets' array
*/
container.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        // Save current widget positions
        for (var i = 0; i < draggies.length; i++) {
            widgets[i].x = draggies[i].position.x;
            widgets[i].y = draggies[i].position.y;
        }

        // Delete widget from 'widgets' array
        const index = parseInt(event.target.dataset.index);
        widgets.splice(index, 1);

        // Re-Render the 'widgets' array
        renderWidgets();
    }
});

/*
*   Function to render widgets in HTML
*       1) Initialize string variable to store HTML code (for formatting)
*       2) Write HTML code to 'htmlString' based on widget metadata
*       3) Set the HTML code of 'container'
*       4) Save all delete buttons
*
*   And initialize Draggabilly objects
*       4) Get all qualifying objects from the HTML as 'elements'
*       5) Add all 'elements' to 'draggies' as Draggabilly objects
*       6) Set the widget positions
*/
async function renderWidgets() {
    // Initialize string variable to store HTML code
    let htmlString = '';

    // Write HTML code to 'htmlString' based on widget metadata (in 'widgets' array)
    let data = await getWorkouts()
    workoutList = data.workouts;
    for (var i = 0; i < widgets.length; i++) {
        switch (widgets[i].type) {
            case "Test Widget":
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Goal</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content mt-4 pt-4"> <div class="placeholder-content"> <i class="fas fa-bullseye fa-2x text-blue mb-2"></i>' +
                    '<p class="urbanist-medium small">Widget Template</p> </div></div></div>';
                break;

            case "Daily Workout":
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Workouts</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content pt-1"> <div class="daily-workout">' +
                    '<h1>Strength Workouts</h1><p>';

                for (let j = 0; j < workoutList.length; j++) {
                    for (let k = 0; k < workoutList[j].strengthExercises.length; k++) {
                        let exercise = workoutList[j].strengthExercises[k];
                        htmlString += exercise.activity + ': ' + exercise.sets + ' sets, ' + exercise.reps + ' reps, ' + exercise.weight + 'lbs<br>';
                    }
                }

                htmlString += '</p><h1>Cardio Workouts</h1>';

                for (let j = 0; j < workoutList.length; j++) {
                    for (let k = 0; k < workoutList[j].cardioExercises.length; k++) {
                        let exercise = workoutList[j].cardioExercises[k];
                        htmlString += exercise.activity + ": " + exercise.distance + 'km in ' + exercise.duraion + ' minutes<br>';
                    }
                }

                htmlString += '</div></div></div>';

                break;

            default:
                htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"> <div class="widget-header">' +
                    '<h3 class="widget-title urbanist-bold">Today\'s Goal</h3>' +
                    '<button class="delete-btn delete-btn-color btn" data-index="' + i + '"><i class="fa-solid fa-x"></i></button>' +
                    '</div> <div class="widget-content mt-4 pt-4"> <div class="placeholder-content"> <i class="fas fa-bullseye fa-2x text-blue mb-2"></i>' +
                    '<p class="urbanist-medium small">Widget Not Found</p> </div></div></div>';
        }

        // TODO: Implement different widget types
        /*htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '">' +
            '<button class="delete-btn" data-index="' + i + '">X</button>' +
            '<p>Drag Me Around!</p></div>';*/
    }
    

    if (htmlString == '') {
        htmlString = "<div class=\"no-widget-message\"><h1>It looks like you don't have any widgets yet...</h1><p>" +
            (draggable ? "Hit the Add Widget button at the top of the page, " : "Hit the Edit button at the top of the page, ") +
            "then add your first widget to get started!" +
            "</p><p>Don't forget to hit Save when you're done!</p></div>";
    }

    // Set the HTML code of 'container' based on previous formatting
    container.innerHTML = htmlString;

    // Get all qualigying delete buttons and save to deleteBtns
    deleteBtns = document.querySelectorAll(".delete-btn", {});

    // Get all qualifying objects from the HTML as 'elements'
    let elements = document.querySelectorAll('.widget', {});
    draggies = []

    // Add all 'elements' to 'draggies' as graggabilly objects
    for (var i = 0; i < elements.length; i++) {
        let draggableElem = elements[i];
        let draggie = new Draggabilly(draggableElem, {
            grid: [8, 8],
            containment: ".dashboard_container"
        });
        draggies.push(draggie);
    }

    // Set the postions based on saved positions
    for (var i = 0; i < widgets.length; i++) {
        let draggable = widgets[i];
        x = widgets[i].x;
        y = widgets[i].y;
        draggies[i].setPosition(x, y);
    }
}

/*
*   Fucntion to toggle the draggable state of the widgets
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
function toggleDraggble() {
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
        widgets[i].x = draggies[i].position.x;
        widgets[i].y = draggies[i].position.y;
    }

    // Push new widget to widgets array
    widgets.push({ userID: 1006, x: 32, y: 32, w: width, h: height, type: widgetType });

    // Render widgets
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
async function getWidgets(/*userId*/) {
    try {
        // Get widgets from te database in JSON format
        const response = await fetch(`/Dashboard?handler=Widgets&userId=1006`, {
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
            toggleDraggble(); // Set draggable to false
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
        const userId = widgets[0].userID;

        const payload = {
            userID: userId,
            widgets: widgets
        };

        const response = await fetch('/Dashboard?handler=SaveWidgets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
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

//Function that returns workouts
async function getWorkouts() {
    return {
        workouts: [
            {
                date: "2025-11-13",
                strengthExercises: [
                    { activity: "Squat", sets: 2, reps: 10, weight: 45 },
                    { activity: "Bench Press", sets: 2, reps: 10, weight: 50 }
                ],
                cardioExercises: [
                    { activity: "Running", duraion: 20, distance: 1.5 }
                ]
            }
    ]}
}