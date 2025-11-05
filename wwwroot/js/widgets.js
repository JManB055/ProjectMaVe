/*
*   Get widgets from the database and display them in HTML
*   First, get the dashboard container (Div that holds widgets) as 'container'
*   Next, get widget information from the database
*   Next, format the HTML based on widgets
*   Last, set the HTML code of 'container'
*/
// Get the dasboard container as 'container'
const container = document.querySelector('.dashboard_container');

// Get widget information from the database (For now, we have default widgets.)
var defaultWidgets = [
    { userID: '0', x: 50, y: 50, w: 2, h: 2, type: 'Test Widget' },
    { userID: '0', x: 650, y: 50, w: 1, h: 1, type: 'Test Widget' },
    { userID: '0', x: 650, y: 350, w: 1, h: 1, type: 'Test Widget' },
    { userID: '0', x: 950, y: 50, w: 1, h: 2, type: 'Test Widget' }
];

// TODO: Update this to pull from database
var widgets = defaultWidgets;


// Format the HTML based on widgets
var htmlString = '';

for (var i = 0; i < defaultWidgets.length; i++) {
    // TODO: Implement different widget types
    htmlString += '<div class="widget widget_card size-' + widgets[i].w + 'x' + widgets[i].h + '"><p>Drag Me Around!</p></div>'
}

// Set the HTML code of 'container' based on previous formatting
container.innerHTML = htmlString;

/*
*   Initialize Boolean 'draggable' to track if widgets are draggable
*   And gets the button object 'editSaveBtn' which needs to change based on 'draggable'
*/
var draggable = true;
const editSaveBtn = document.getElementById('editSaveBtn');


/*
*   Initialize draggabilly elements
*   First, get all qualifying objects from the HTML as 'elemnents'
*   Next, add all 'elements' to 'draggies' as draggabilly objects
*   Finally, set the postions based on the saved positions
*/
// Get all qualifying objects from the HTML as 'elements'
var elements = document.querySelectorAll('.widget', {});
var draggies = []

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

// Set the dashboard to be static
toggleDraggble();

/*
*   Toggles the draggable state of the widgets
*   If they are currently draggable, then we disable draggabilly, change the 'editSaveBtn' to Edit, and save the new positions to database.
*   If they are not currently draggable, then we enable draggabilly and change the 'editSaveBtn' to Save.
*   Finally, toggle to boolean 'draggable' variable to track state.
*   Called by 'editSaveBtn' and after setting up the page.
*/
function toggleDraggble() {
    if (draggable) {
        // If currently draggable
        for (var i = 0; i < draggies.length; i++) {
            // Disable draggabilly for each object
            draggies[i].disable();

            // Update 'editSaveBtn'
            editSaveBtn.textContent = "Edit";

            // Update database with new positions
            widgets[i].x = draggies[i].position.x;
            widgets[i].y = draggies[i].position.y;
            // TODO: Save the widgets array to the database.
        }
    }
    else {
        // If not currently draggable
        for (var i = 0; i < draggies.length; i++) {
            // Enable draggabilly for each object
            draggies[i].enable();

            // Update the 'editSaveButton'
            editSaveBtn.textContent = "Save";
        }
    }
    // Toggle editSaveBtn
    draggable = !draggable;
}
