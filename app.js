const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const formMessage = document.getElementById("form-message");
let currentStatus = "all";

document.getElementById("today").textContent =
  new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date());

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#a13f37" : "#3f7656";
}

async function loadTasks() {
  try {
    const response = await fetch(`/api/tasks?status=${currentStatus}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load tasks.");
    updateStatistics(data.statistics);
    displayTasks(data.tasks);
  } catch (error) {
    taskList.innerHTML = `<div class="empty-state">${escapeHTML(error.message)}</div>`;
  }
}

function updateStatistics(stats) {
  document.getElementById("total").textContent = stats.total;
  document.getElementById("pending").textContent = stats.pending;
  document.getElementById("completed").textContent = stats.completed;
  document.getElementById("progress").textContent = `${stats.progress}%`;
}

function displayTasks(tasks) {
  document.getElementById("task-count").textContent =
    `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">✦<br>No tasks in this view.<br>Add a task or choose another filter.</div>';
    return;
  }

  // The list comprehension creates one HTML row for every task.
  taskList.innerHTML = tasks.map(task => `
    <article class="task-row ${task.completed ? "is-complete" : ""}">
      <button class="complete-button" data-action="toggle" data-id="${task.id}"
        aria-label="${task.completed ? "Reopen" : "Complete"} task">${task.completed ? "✓" : ""}</button>
      <div class="task-info">
        <div class="task-title">${escapeHTML(task.title)}</div>
        <div class="task-subject">${escapeHTML(task.subject)} · ${task.completed ? "Completed" : "To do"}</div>
      </div>
      <span class="priority ${task.priority}">${task.priority}</span>
      <button class="delete-button" data-action="delete" data-id="${task.id}" aria-label="Delete task">×</button>
    </article>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char =>
    ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[char]));
}

taskForm.addEventListener("submit", async event => {
  event.preventDefault();
  const task = {
    title: document.getElementById("title").value.trim(),
    subject: document.getElementById("subject").value.trim(),
    priority: document.getElementById("priority").value
  };
  if (!task.title || !task.subject) {
    showMessage("Please enter a title and subject.", true);
    return;
  }

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(task)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not add task.");
    taskForm.reset();
    showMessage("Task added successfully.");
    currentStatus = "all";
    setActiveFilter("all");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, true);
  }
});

taskList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const taskId = button.dataset.id;
  const action = button.dataset.action;

  try {
    let response;
    if (action === "toggle") {
      const isCompleted = button.closest(".task-row").classList.contains("is-complete");
      response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({completed: !isCompleted})
      });
    } else if (action === "delete") {
      response = await fetch(`/api/tasks/${taskId}`, {method: "DELETE"});
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The action could not be completed.");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, true);
  }
});

function setActiveFilter(status) {
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.status === status);
  });
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentStatus = button.dataset.status;
    setActiveFilter(currentStatus);
    loadTasks();
  });
});

loadTasks();
