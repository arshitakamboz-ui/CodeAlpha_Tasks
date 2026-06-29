# 📋 ProjectFlow — Project Manager

A full-stack, real-time project management web app built as part of my **CodeAlpha Web Development Internship**.

![Status](https://img.shields.io/badge/Status-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen) ![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black)

---

## 🌐 Live Demo

👉 **[Click here to view live site](https://project-manager-ir0n.onrender.com/)**

> First load may take 30-60 seconds (free hosting spins down on inactivity)

---

## ✨ Features

- 👥 **Group Projects** — Create projects and invite teammates by email
- 📌 **Task Board** — 3-column kanban board: To Do / In Progress / Done
- 🙋 **Task Assignment** — Assign tasks to any project member
- 💬 **Comments** — Communicate directly on task cards
- 👤 **User Authentication** — Register, login, logout with hashed passwords
- 🔔 **Notifications** — Get notified when added to a project, assigned a task, or commented on
- ⚡ **Real-Time Updates** — Socket.IO syncs the board live for all members — no refresh needed
- 🔒 **Protected Routes** — Only authenticated members can access their projects

---

## 🛠️ Tech Stack

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Frontend       | HTML, CSS, JavaScript           |
| Templating     | EJS (Embedded JavaScript)       |
| Backend        | Node.js, Express.js             |
| Database       | MongoDB Atlas (Mongoose)        |
| Real-Time      | Socket.IO                       |
| Authentication | express-session, bcryptjs       |

---

## 🚀 Run Locally

1. **Clone the repo and go into the task folder**

       git clone https://github.com/arshitakamboz-ui/CodeAlpha_Tasks.git
       cd CodeAlpha_Tasks/Task3_ProjectManager

2. **Install dependencies**

       npm install

3. **Set up your `.env` file**

   Copy the example and fill in your values:

       cp .env.example .env

   ```
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/task3_projectmanager
   SESSION_SECRET=replace_with_any_random_string
   PORT=3000
   ```

4. **Start the server**

       node server.js

   Or with auto-restart during development:

       npm run dev

5. **Open your browser at** `http://localhost:3000`

---

## 🧭 How to Use

1. Go to `/register` and create an account
2. Click **+ New Project** to create your first project
3. Use **"Add member by email"** to invite teammates
4. Add tasks from the board view and optionally assign them to a member
5. Click 💬 on any task card to leave a comment
6. Click 🔔 in the top bar to check your notifications
7. Open the same project in two windows — changes appear live without refreshing (Socket.IO in action!)

---

## 📁 Folder Structure

```
Task3_ProjectManager/
├── models/              # User, Project, Task, Comment, Notification schemas
├── routes/              # Auth, project, task, comment, notification routes
├── views/               # EJS templates
│   └── partials/        # Header, footer, task card
├── public/              # style.css
├── middleware/          # Session & auth middleware
├── sockets/             # Socket.IO room event handlers
├── server.js            # App entry point
├── .env.example
└── package.json
```

---

## 👩‍💻 Author

**Arshita Kamboj** — CodeAlpha Web Development Intern

GitHub: [arshitakamboz-ui](https://github.com/arshitakamboz-ui)

---

## 📝 License

This project was built for educational purposes as part of the CodeAlpha internship program.
