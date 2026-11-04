from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)
DATA_FILE = "tasks.json"


def load_tasks():
    """Read tasks from the JSON file. Return an empty list if it does not exist."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return []


def save_tasks(tasks):
    """Save the task list to the local JSON file."""
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(tasks, file, indent=4)


def calculate_statistics(tasks):
    """Calculate totals using list comprehensions."""
    total = len(tasks)
    completed_tasks = [task for task in tasks if task["completed"]]
    pending_tasks = [task for task in tasks if not task["completed"]]
    completed = len(completed_tasks)
    pending = len(pending_tasks)
    progress = round((completed / total) * 100) if total > 0 else 0

    # A for loop builds a count for each priority.
    priority_counts = {"High": 0, "Medium": 0, "Low": 0}
    for task in tasks:
        if task["priority"] in priority_counts:
            priority_counts[task["priority"]] += 1

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "progress": progress,
        "priority_counts": priority_counts
    }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    tasks = load_tasks()
    status = request.args.get("status", "all").lower()

    if status == "pending":
        filtered_tasks = [task for task in tasks if not task["completed"]]
    elif status == "completed":
        filtered_tasks = [task for task in tasks if task["completed"]]
    else:
        filtered_tasks = tasks

    return jsonify({
        "tasks": filtered_tasks,
        "statistics": calculate_statistics(tasks)
    })


@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    subject = data.get("subject", "").strip()
    priority = data.get("priority", "Medium")

    if not title or not subject:
        return jsonify({"error": "Please enter both a task title and subject."}), 400

    if priority not in ["High", "Medium", "Low"]:
        return jsonify({"error": "Please choose a valid priority."}), 400

    tasks = load_tasks()
    new_task = {
        "id": max([task.get("id", 0) for task in tasks], default=0) + 1,
        "title": title,
        "subject": subject,
        "priority": priority,
        "completed": False
    }
    tasks.append(new_task)
    save_tasks(tasks)

    return jsonify({
        "message": "Task added successfully.",
        "task": new_task,
        "statistics": calculate_statistics(tasks)
    }), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    data = request.get_json(silent=True) or {}
    tasks = load_tasks()
    task_found = False

    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = bool(data.get("completed", not task["completed"]))
            task_found = True
            break

    if not task_found:
        return jsonify({"error": "Task not found."}), 404

    save_tasks(tasks)
    return jsonify({
        "message": "Task status updated.",
        "statistics": calculate_statistics(tasks)
    })


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks = load_tasks()
    updated_tasks = [task for task in tasks if task["id"] != task_id]

    if len(updated_tasks) == len(tasks):
        return jsonify({"error": "Task not found."}), 404

    save_tasks(updated_tasks)
    return jsonify({
        "message": "Task deleted.",
        "statistics": calculate_statistics(updated_tasks)
    })


if __name__ == "__main__":
    app.run(debug=True)
