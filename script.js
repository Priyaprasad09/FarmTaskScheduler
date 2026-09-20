
const taskForm = document.getElementById("taskForm");

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");

const pendingTasks = document.getElementById("pendingTasks");

const completedTasks = document.getElementById("completedTasks");

const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = JSON.parse(localStorage.getItem("farmTasks")) || [];

// Save tasks in browser storage

function saveTasks() {
    localStorage.setItem("farmTasks", JSON.stringify(tasks));
}

// Update dashboard statistics

function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === "Completed"
    ).length;

    const pending = total - completed;

    totalTasks.textContent = total;

    pendingTasks.textContent = pending;

    completedTasks.textContent = completed;
}

// Format task date

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Display all tasks

function displayTasks() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-message">
                No tasks added yet.
                Schedule your first farm task!
            </div>
        `;

        updateDashboard();

        return;
    }

    const sortedTasks = [...tasks].sort((a, b) => {

        const dateA = `${a.date}T${a.time}`;

        const dateB = `${b.date}T${b.time}`;

        return dateA.localeCompare(dateB);
    });

    sortedTasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        if (task.status === "Completed") {
            taskCard.classList.add("completed");
        }

        const safeDescription = task.description
            ? escapeHTML(task.description)
            : "No additional description.";

        taskCard.innerHTML = `
            <div class="task-top">

                <div>
                    <h3>${escapeHTML(task.name)}</h3>

                    <p class="task-info">
                        🌾 Crop: ${escapeHTML(task.crop)}
                    </p>

                    <p class="task-info">
                        🗂️ Type: ${escapeHTML(task.type)}
                    </p>

                    <p class="task-info">
                        📅 Date: ${formatDate(task.date)}
                    </p>

                    <p class="task-info">
                        ⏰ Time: ${escapeHTML(task.time)}
                    </p>
                </div>

                <span class="priority ${task.priority}">
                    ${escapeHTML(task.priority)} Priority
                </span>

            </div>

            <p class="task-description">
                ${safeDescription}
            </p>

            <p class="task-status ${
                task.status === "Completed"
                    ? "status-completed"
                    : "status-pending"
            }">
                Status: ${task.status}
            </p>

            <div class="task-actions">

                <button
                    class="complete-button"
                    data-action="complete"
                    data-id="${task.id}"
                    ${task.status === "Completed" ? "disabled" : ""}
                >
                    ${
                        task.status === "Completed"
                            ? "Completed"
                            : "Mark Completed"
                    }
                </button>

                <button
                    class="delete-button"
                    data-action="delete"
                    data-id="${task.id}"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskCard);

    });

    updateDashboard();
}

// Escape user-entered text before placing it in HTML

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });
}

// Add a new task

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newTask = {

        id: Date.now().toString(),

        name: document.getElementById("taskName").value.trim(),

        crop: document.getElementById("cropName").value.trim(),

        type: document.getElementById("taskType").value,

        date: document.getElementById("taskDate").value,

        time: document.getElementById("taskTime").value,

        priority: document.getElementById("priority").value,

        description: document.getElementById("taskDescription").value.trim(),

        status: "Pending"

    };

    if (!newTask.name || !newTask.crop || !newTask.date) {

        alert("Please fill in all required fields.");

        return;
    }

    tasks.push(newTask);

    saveTasks();

    displayTasks();

    taskForm.reset();

    alert("Farm task added successfully!");

    document.getElementById("tasks").scrollIntoView({
        behavior: "smooth"
    });

});

// Mark a task completed or delete it

taskList.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;

    const id = button.dataset.id;

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    if (action === "complete") {

        task.status = "Completed";

    }

    if (action === "delete") {

        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) return;

        tasks = tasks.filter(item => item.id !== id);

    }

    saveTasks();

    displayTasks();

});

// Clear all tasks

clearAllBtn.addEventListener("click", function() {

    if (tasks.length === 0) {

        alert("There are no tasks to clear.");

        return;
    }

    const confirmClear = confirm(
        "Are you sure you want to clear all tasks?"
    );

    if (!confirmClear) return;

    tasks = [];

    saveTasks();

    displayTasks();

});

// Set minimum date to today

const taskDateInput = document.getElementById("taskDate");

const today = new Date();

const year = today.getFullYear();

const month = String(today.getMonth() + 1).padStart(2, "0");

const day = String(today.getDate()).padStart(2, "0");

taskDateInput.min = `${year}-${month}-${day}`;

// Load saved tasks

displayTasks();