# Classroom Task Tracker (Flask)

A beginner-friendly task tracker built with Python Flask, HTML, CSS, and JavaScript.

## Features

- Add tasks with a title, subject, and priority.
- View all tasks or filter by To do / Completed.
- Mark a task complete or reopen it.
- Delete tasks.
- View total, pending, completed, and progress statistics.
- Save task data in a local `tasks.json` file.

## 1. Requirements

- Python 3.9 or newer
- pip

## 2. Open the project

Unzip the project folder and open it in VS Code.

## 3. Create a virtual environment (recommended)

Windows:

```bash
py -m venv venv
venv\Scripts\activate
```

macOS / Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

## 4. Install Flask

```bash
pip install -r requirements.txt
```

## 5. Run the app

```bash
python app.py
```

Open this address in your browser:

http://127.0.0.1:5000

The app creates `tasks.json` automatically when you add your first task.

## Project structure

```text
classroom_task_tracker_flask/
├── app.py
├── tasks.json          # created automatically
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── app.js
```

## Beginner Python concepts used

- **Functions:** `load_tasks()`, `save_tasks()`, and `calculate_statistics()`.
- **Lists:** tasks are stored as a list.
- **Dictionaries:** each task and the statistics are dictionaries.
- **If / elif / else:** used to filter tasks and validate requests.
- **For loops:** used to count tasks by priority and find a task to update.
- **List comprehensions:** used to filter pending/completed tasks and remove deleted tasks.

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/tasks` | Get tasks and statistics |
| GET | `/api/tasks?status=pending` | Get pending tasks |
| GET | `/api/tasks?status=completed` | Get completed tasks |
| POST | `/api/tasks` | Add a task |
| PATCH | `/api/tasks/<id>` | Complete or reopen a task |
| DELETE | `/api/tasks/<id>` | Delete a task |

This is a learning project for local use. For public deployment, add authentication, stronger validation, and production server settings.
