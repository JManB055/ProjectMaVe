/**
 * DashboardManager
 * ----------------
 * Handles edit mode, drag-and-drop widget rearrangement,
 * and persistence of widget layout order in a Razor Pages environment.
 */

class DashboardManager {
    constructor() {
        this.editMode = false;
        this.draggedElement = null;
        this.isDragging = false;
        this.touchStartPos = { x: 0, y: 0 };
        this.widgetOrder = [];

        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.loadWidgetOrder();
    }

    cacheElements() {
        this.editBtn = document.getElementById("editLayoutBtn");
        this.doneBtn = document.getElementById("doneEditingBtn");
        this.addWidgetBtn = document.getElementById("addWidgetBtn");
        this.editBanner = document.getElementById("editModeBanner");
        this.widgetGrid = document.getElementById("widgetGrid");
    }

    get widgetCards() {
        return document.querySelectorAll(".widget-card");
    }

    attachEventListeners() {
        this.editBtn?.addEventListener("click", () => this.enableEditMode());
        this.doneBtn?.addEventListener("click", () => this.disableEditMode());
        this.addWidgetBtn?.addEventListener("click", () => alert("Add Widget coming soon!"));

        // Attach drag/touch listeners once per handle
        this.widgetCards.forEach(widget => {
            const handle = widget.querySelector(".widget-drag-handle");
            handle?.addEventListener("mousedown", (e) => {
                if (!this.editMode) return;
                this.handleDragStart(e, widget);
            });
            handle?.addEventListener("touchstart", (e) => {
                if (!this.editMode) return;
                this.handleTouchStart(e, widget);
            }, { passive: false });
        });

        // Global drag/touch listeners
        document.addEventListener("mousemove", (e) => { if (this.isDragging) this.handleDragMove(e); });
        document.addEventListener("mouseup", () => this.handleDragEnd());
        document.addEventListener("touchmove", (e) => { if (this.isDragging) this.handleTouchMove(e); }, { passive: false });
        document.addEventListener("touchend", () => this.handleTouchEnd());
    }

    enableEditMode() {
        this.editMode = true;
        document.body.classList.add("edit-mode");
        if (this.editBanner) this.editBanner.style.display = "block";

        // --- Minimal Addition ---
        this.widgetCards.forEach(widget => widget.setAttribute("draggable", "true"));
    }

    disableEditMode() {
        this.editMode = false;
        document.body.classList.remove("edit-mode");
        if (this.editBanner) this.editBanner.style.display = "none";
        this.saveWidgetOrder();

        // --- Minimal Addition ---
        this.widgetCards.forEach(widget => widget.removeAttribute("draggable"));
    }

    // --------------------------
    // MOUSE DRAG EVENTS
    // --------------------------

    handleDragStart(e, widget) {
        e.preventDefault();
        this.isDragging = true;
        this.draggedElement = widget;
        widget.classList.add("dragging");
    }

    handleDragMove(e) {
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
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        this.isDragging = true;
        this.draggedElement = widget;
        widget.classList.add("dragging");
    }

    handleTouchMove(e) {
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

    saveWidgetOrder() {
        this.widgetOrder = [...this.widgetGrid.querySelectorAll(".widget-card")].map(w => w.dataset.widgetId);
        localStorage.setItem("widgetOrder", JSON.stringify(this.widgetOrder));
        console.log("Widget order saved:", this.widgetOrder);
    }

    loadWidgetOrder() {
        const order = JSON.parse(localStorage.getItem("widgetOrder") || "[]");
        if (!order.length) return;
        order.forEach(id => {
            const el = this.widgetGrid.querySelector(`.widget-card[data-widget-id="${id}"]`);
            if (el) this.widgetGrid.appendChild(el);
        });
        console.log("Widget order loaded");
    }
}

// Initialize dashboard on page load
new DashboardManager();
