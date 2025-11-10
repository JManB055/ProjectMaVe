/*
* Note to Alex: There are two functions at the bottom for retrieving and saving data to the database. If you edit those, they should be called in the correct places.
*/

/*
*   Initialize Global variables:
*       'container' is the dashboard container for all the widgets; all widgets are rendered within this object.
*       'editSaveBtn' is the button that changes the 'draggable' state.
*       'deleteBtns' is an array storing all delete buttone (used so that we can hide the delete buttons)
*       'widgets' is the array of widget metadata used to render the widgets with the right place, size, and data.
*       'draggies' is the array of Draggabilly objects tied to the widgets. This is neccessary for draggaing capabilities.
*       'draggable' is a boolean to track the state of the dashboard (editing mode vs view mode)
*/
const templateContainer = document.querySelector('.template_container');
const container = document.querySelector('.dashboard_container');
const editSaveBtn = document.getElementById('editSaveBtn');
var deleteBtns;
var widgets = [];
var draggies = [];
var draggable = true;

// An array of widget types used to display templates
const widgetTypes = ['Test Widget'];


/*
*   Set up the initial page rendering
*       1) Get widget information from the database using 'getWidgets' function
*       2) Render the widgets in HTML using the 'renderWidgets' function.
*/

// Set default widgets for testing
// TODO: Once we can pull from database, we no longer need default widgets; delete following 7 lines of code.
var defaultWidgets = [
    { userID: 1006, x: 50, y: 50, w: 2, h: 2, type: 'Test Widget' },
    { userID: 1006, x: 650, y: 50, w: 1, h: 1, type: 'Test Widget' },
    { userID: 1006, x: 650, y: 350, w: 1, h: 1, type: 'Test Widget' },
    { userID: 1006, x: 950, y: 50, w: 1, h: 2, type: 'Test Widget' }
];
widgets = defaultWidgets;

// Get widget information from database
getWidgets()

// Render the widgets in HTML
renderWidgets()

// Set the dashboard to be static
toggleDraggble();


/*
*   Adds EventListener for the delete button. On Click:
*       1) Save current widget positions
*       2) Delete widget from 'widgets' array
*       3) Save 'widgets' array to Database
*       4) Re-Render the 'widgets' array
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

        // Save 'widgets' array to Database
        saveWidgets();

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
function renderWidgets() {
    // Initialize string variable to store HTML code
    var htmlString = '';

    // Write HTML code to 'htmlString' based on widget metadata (in 'widgets' array)
    for (var i = 0; i < defaultWidgets.length; i++) {
        // TODO: Implement different widget types
        htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '">' +
            '<button class="delete-btn" data-index="' + i + '">X</button>' +
            '<p>Drag Me Around!</p></div>';
    }

    // Set the HTML code of 'container' based on previous formatting
    container.innerHTML = htmlString;

    // Get all qualigying delete buttons and save to deleteBtns
    deleteBtns = document.querySelectorAll(".delete-btn", {});

    // Get all qualifying objects from the HTML as 'elements'
    var elements = document.querySelectorAll('.widget', {});
    draggies = []

    // Add all 'elements' to 'draggies' as graggabilly objects
    for (var i = 0; i < elements.length; i++) {
        var draggableElem = elements[i];
        var draggie = new Draggabilly(draggableElem, {
            grid: [50, 50],
            containment: ".dashboard_container"
        });
        draggies.push(draggie)
    }

    // Set the postions based on saved positions
    for (var i = 0; i < widgets.length; i++) {
        var draggable = widgets[i];
        x = widgets[i].x;
        y = widgets[i].y;
        draggies[i].setPosition(x, y);
    }
}

/*
*   Fucntion to toggle the draggable state of the widgets
*       1) If they are currently draggable, then: 
*           1) Disable draggabilly
*           2) Change the 'editSaveBtn' to Edit
*           3) Save the new positions to database.
*
*       2) If they are not currently draggable, then:
*           1) Enable draggabilly
*           2) Change the 'editSaveBtn' to Save.
*
*       3) Hide/Show delete buttons based on draggable status
*       4) Toggle to boolean 'draggable' variable to track state.
*/
function toggleDraggble() {
    if (draggable) {
        // If currently draggable
        for (var i = 0; i < draggies.length; i++) {
            // Disable draggabilly for each object
            draggies[i].disable();

            // Update database with new positions
            widgets[i].x = draggies[i].position.x;
            widgets[i].y = draggies[i].position.y;
        }

        // Update 'editSaveBtn'
        editSaveBtn.textContent = "Edit";
        saveWidgets();
    }
    else {
        // If not currently draggable
        for (var i = 0; i < draggies.length; i++) {
            // Enable draggabilly for each object
            draggies[i].enable();
        }
        // Update the 'editSaveButton'
        editSaveBtn.textContent = "Save";
    }

    templateContainer.hidden = draggable;

    for (var i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].hidden = draggable;
    }
    draggable = !draggable;
}

// TODO: Write function to get the widgets. It doesn't need return, just set existing 'widgets' array to data from database.
async function getWidgets(/*userId*/) {
    try {
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
            renderWidgets(widgets); // Optional: your custom render function
        } else {
            console.warn('Failed to load widgets:', result.message);
        }
    } catch (error) {
        console.error('Error loading widgets:', error);
    }
}

// TODO: Write function to save widgets to the database (Alex, write save code here to simply save the entire widgets array to database)
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
