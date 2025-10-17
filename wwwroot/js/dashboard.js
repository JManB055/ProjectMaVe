/**
 * DashboardManager
 * ----------------
 * Handles edit mode, drag-and-drop widget rearrangement,
 * and persistence of widget layout order in a Razor Pages environment.
 * 
 * Designed for static Razor pages with client-side interactivity.
 */

class DashboardManager {
    constructor() {
        // State variables
        this.editMode = false;
        this.draggedElement = null;
        this.isDragging = false;
        this.touchStartPos = { x: 0, y: 0 };
        this.widgetOrder = [];

        this.init();
    }

    /**
     * Initialize dashboard: cache DOM elements, set up event listeners, load state.
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.loadWidgetOrder();
    }

    /**
     * Cache key DOM elements for performance.
     */
    cacheElements() {
        this.editBtn = document.getElementById("editLayoutBtn");
        this.doneBtn = document.getElementById("doneEditingBtn");
        this.addWidgetBtn = document.getElementById("addWidgetBtn");
        this.editBanner = document.getElementById("editModeBanner");
        this.widgetGrid = document.getElementById("widgetGrid");
    }

    /**
     * Returns a NodeList of all widget cards.
     */
    get widgetCards() {
        return document.querySelectorAll(".widget-card");
    }

    /**
     * Attach top-level event listeners for edit mode and drag/touch operations.
     */
    attachEventListeners() {
        this.editBtn?.addEventListener("click", () => this.enableEditMode());
        this.doneBtn?.addEventListener("click", () => this.disableEditMode());
        this.addWidgetBtn?.addEventListener("click", () => alert("Add Widget coming soon!"));

        // Global drag/touch listeners
        document.addEventListener("mousemove", (e) => this.handleDragMove(e));
        document.addEventListener("mouseup", () => this.handleDragEnd());
        document.addEventListener("touchmove", (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener("touchend", () => this.handleTouchEnd());
    }

    /**
     * Enables layout editing mode.
     */
    enableEditMode() {
        this.editMode = true;
        document.body.classList.add("edit-mode");
        if (this.editBanner) this.editBanner.style.display = "block";

        this.widgetCards.forEach(widget => {
            widget.style.cursor = "grab";
            const handle = widget.querySelector(".widget-drag-handle");

            // Attach per-widget listeners
            handle?.addEventListener("mousedown", (e) => this.handleDragStart(e, widget));
            handle?.addEventListener("touchstart", (e) => this.handleTouchStart(e, widget), { passive: false });
        });
    }

    /**
     * Disables layout editing mode and saves the widget order.
     */
    disableEditMode() {
        this.editMode = false;
        document.body.classList.remove("edit-mode");
        if (this.editBanner) this.editBanner.style.display = "none";

        this.widgetCards.forEach(widget => widget.style.cursor = "default");
        this.saveWidgetOrder();
    }

    // --------------------------
    // MOUSE DRAG EVENTS
    // --------------------------

    handleDragStart(e, widget) {
        if (!this.editMode) return;
        e.preventDefault();

        this.isDragging = true;
        this.draggedElement = widget;
        widget.classList.add("dragging");
    }

    handleDragMove(e) {
        if (!this.isDragging || !this.draggedElement) return;
        e.preventDefault();

        const after = this.getDragAfterElement(this.widgetGrid, e.clientY);
        if (!after) this.widgetGrid.appendChild(this.draggedElement);
        else this.widgetGrid.insertBefore(this.draggedElement, after);
    }

    handleDragEnd() {
        if (!this.isDragging || !this.draggedElement) return;
        this.draggedElement.classList.remove("dragging");
        this.draggedElement = null;
        this.isDragging = false;
    }

    // --------------------------
    // TOUCH DRAG EVENTS
    // --------------------------

    handleTouchStart(e, widget) {
        if (!this.editMode) return;
        e.preventDefault();

        const touch = e.touches[0];
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        this.isDragging = true;
        this.draggedElement = widget;
        widget.classList.add("dragging");
    }

    handleTouchMove(e) {
        if (!this.isDragging || !this.draggedElement) return;
        e.preventDefault();

        const touch = e.touches[0];
        const after = this.getDragAfterElement(this.widgetGrid, touch.clientY);
        if (!after) this.widgetGrid.appendChild(this.draggedElement);
        else this.widgetGrid.insertBefore(this.draggedElement, after);
    }

    handleTouchEnd() {
        if (!this.isDragging || !this.draggedElement) return;
        this.draggedElement.classList.remove("dragging");
        this.draggedElement = null;
        this.isDragging = false;
    }

    // --------------------------
    // HELPER METHODS
    // --------------------------

    /**
     * Determines the element that the dragged widget should be inserted before.
     * @param {HTMLElement} container - Parent container of widgets
     * @param {number} y - Current Y coordinate of cursor/touch
     * @returns {HTMLElement|null} - The widget after which the dragged one should be placed
     */
    getDragAfterElement(container, y) {
        const cards = [...container.querySelectorAll(".widget-card:not(.dragging)")];
        let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

        for (const card of cards) {
            const box = card.getBoundingClientRect();
            const offset = y - (box.top + box.height / 2);
            if (offset < 0 && offset > closest.offset) {
                closest = { offset, element: card };
            }
        }
        return closest.element;
    }

    /**
     * Saves the current widget order (by dataset IDs) in memory or to persistence later.
     */
    saveWidgetOrder() {
        this.widgetOrder = [...this.widgetGrid.querySelectorAll(".widget-card")].map(w => w.dataset.widgetId);
        console.log("Widget order saved:", this.widgetOrder);
    }

    /**
     * Loads the saved widget order (placeholder for future persistence integration).
     */
    loadWidgetOrder() {
        console.log("Widget order loaded");
        // TODO: Retrieve saved layout from backend/localStorage and reorder DOM.
    }
}

// Initialize dashboard on page load
new DashboardManager();
