//Get all Widgets
var widgets = document.querySelectorAll('.widget', {
    //Options
});

// Array of widgets (dragabilly elements)
var draggies = []
// Initialize the Draggabilly elements 
for (var i = 0; i < widgets.length; i++) {
    var draggableElem = widgets[i];
    var draggie = new Draggabilly(draggableElem, {
        grid: [50, 50]
    });
    draggies.push( draggie )
}