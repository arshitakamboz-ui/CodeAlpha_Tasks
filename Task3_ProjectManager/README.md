# Task 3 — Project Management Tool (ProjectFlow)

A Trello/Asana-style collaborative tool. Stack: **Node.js, Express, EJS, MongoDB (Mongoose), Socket.io**

---

## ✅ What's included

- **Auth system**: register, login, logout (passwords hashed with bcrypt, sessions with express-session)
- **Projects**: create projects, add members by email
- **Task board**: 3 columns (To Do / In Progress / Done), create tasks, assign to members, move between columns
- **Comments**: comment on any task
- **Bonus — Notifications**: users get notified when added to a project, assigned a task, or commented on
- **Bonus — Real-time updates**: powered by Socket.io — when anyone on the team makes a change, everyone else viewing that project sees it update automatically (no refresh needed)

---

## 📁 Folder structure

```
Task3_ProjectManager/
├── models/          (User, Project, Task, Comment, Notification)
├── routes/          (auth, project, task, comment, notification routes)
├── views/           (EJS templates)
├── public/          (style.css)
├── middleware/       (auth middleware)
├── sockets/          (Socket.io event handlers)
├── server.js         (entry point)
├── package.json
└── .env
```

---

## 🚀 Step-by-step setup

### 1. Install dependencies
Open a terminal in the `Task3_ProjectManager` folder and run:
```bash
npm install
```

### 2. Set up your `.env` file
A `.env` file is already included with these values:
```
MONGO_URI=mongodb://127.0.0.1:27017/task3_projectmanager
SESSION_SECRET=changeThisToAnyRandomLongString
PORT=3000
```
- If you're using **local MongoDB**, this URI works as-is (just make sure MongoDB is running).
- If you're using **MongoDB Atlas** (cloud), replace `MONGO_URI` with your Atlas connection string, e.g.:
  ```
  MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/task3_projectmanager
  ```
- Change `SESSION_SECRET` to literally any random string — it's just used to encrypt session cookies.

### 3. Start MongoDB (if running locally)
```bash
mongod
```
(Skip this if you're using Atlas, or if MongoDB already runs as a background service on your machine.)

### 4. Run the app
```bash
npm start
```
or, for auto-restart on file changes during development:
```bash
npm run dev
```

### 5. Open it in your browser
```
http://localhost:3000
```

---

## 🧭 How to use it (to demo/test)

1. Go to `/register`, create an account.
2. You'll land on `/projects` — click **+ New Project**.
3. Inside a project, use the **"Add member by email"** box to add a teammate (they need an account too — register a second test user in an incognito window to try this).
4. Add tasks using the form at the top of the board — optionally assign them to a member.
5. Click the **🔔 bell** icon (top right) to see notifications — you'll get one anytime you're added to a project, assigned a task, or someone comments on your task.
6. Click **💬** on any task card to open the comment box.
7. Open the same project in two browser windows (e.g., normal + incognito, logged in as two different users) — change a task's status or add a comment in one window, and watch it update live in the other. That's the Socket.io real-time bonus in action.

---

## 🔍 How each requirement maps to the code

| Requirement | Where it lives |
|---|---|
| Auth system | `routes/authRoutes.js`, `middleware/auth.js`, `models/User.js` |
| Create group projects | `routes/projectRoutes.js` → `POST /projects` |
| Assign tasks | `routes/taskRoutes.js` → `POST /projects/:projectId/tasks` (assignee field) |
| Comment & communicate | `routes/commentRoutes.js`, `models/Comment.js` |
| Backend managing users/projects/tasks/comments | `models/` folder (5 Mongoose schemas) |
| Notifications (bonus) | `models/Notification.js`, triggered in `projectRoutes.js` & `taskRoutes.js` & `commentRoutes.js` |
| Real-time updates (bonus) | `sockets/socketHandler.js` + `io.emit(...)` calls in routes + client-side `socket.on(...)` in `views/projects/show.ejs` |

---

## ⚠️ A note on testing

I wrote and syntax-checked every file carefully (no typos, all EJS tags balanced, all requires matching), but I do **not** have internet access in my environment to run `npm install` and actually boot the server end-to-end. So: please run it locally and let me know the **exact error message** if anything breaks — I can fix it immediately. Most likely candidates for a first-run hiccup are MongoDB connection string issues, which the steps above should cover.

## 💡 If you want to explain this in a viva/demo
Be ready to explain in your own words:
- Why we hash passwords (bcrypt) instead of storing them plain
- Why sessions are used to keep a user "logged in"
- How a Task references a Project (`project: ObjectId`) and how a Comment references a Task — this is how MongoDB relationships work via `ref` and `.populate()`
- How Socket.io "rooms" work (`project_<id>` and `user_<id>`) so updates only go to relevant people, not everyone connected to the server
