# 📱 Social Media App

A full-stack Instagram-style social media web application built as part of my **CodeAlpha Web Development Internship** (Task 2).

![Status](https://img.shields.io/badge/Status-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-green) ![Database](https://img.shields.io/badge/Database-MongoDB-darkgreen)

---

## 🌐 Live Demo

👉 **[Click here to view live site](https://socialapp-codealpha.onrender.com/)**

> First load may take 30-60 seconds (free hosting spins down on inactivity)

---

## ✨ Features

- 📝 **Posts** – Create posts with text, images, or videos
- ❤️ **Likes** – Like/unlike posts with real-time notifications to the author
- 💬 **Comments** – Comment on posts, with notifications sent to the post author
- 🔖 **Bookmarks** – Save posts to revisit later from your bookmarks page
- 👥 **Follow System** – Follow/unfollow users, with follow notifications
- 📸 **Stories** – Post 24-hour stories with view tracking, delete your own anytime
- 🔔 **Notifications** – See likes, comments, and follows in one place
- 🔍 **Search** – Find users instantly by name or username
- 🧭 **Explore Page** – Discover the latest posts from everyone on the platform
- #️⃣ **Hashtags** – Click any `#hashtag` in a post to see all related posts
- 👤 **Profiles** – Editable bio, profile photo, and personal post grid
- 🔐 **Authentication** – Register/login with hashed passwords and session-based auth
- ☁️ **Cloud Media Storage** – Images and videos uploaded directly to Cloudinary
- 📱 **Responsive Design** – Works on mobile and desktop

---

## 🛠 Tech Stack

| Layer          | Technology                              |
|----------------|------------------------------------------|
| Frontend       | EJS templates, HTML, CSS                |
| Backend        | Node.js, Express                        |
| Database       | MongoDB (Mongoose)                      |
| Authentication | express-session, bcryptjs               |
| File Uploads   | Multer, Cloudinary                      |

---

## 🚀 Run Locally

1. Clone the repo and go into the project folder

   ```
   git clone https://github.com/arshitakamboz-ui/CodeAlpha_Tasks.git
   cd CodeAlpha_Tasks/Task2_SocialMedia
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root with your own credentials

   ```
   MONGODB_URI=mongodb+srv://<your_user>:<your_password>@<your_cluster>.mongodb.net/socialmedia?appName=Cluster0
   CLOUDINARY_CLOUD_NAME=<your_cloud_name>
   CLOUDINARY_API_KEY=<your_api_key>
   CLOUDINARY_API_SECRET=<your_api_secret>
   ```

4. Start the server

   ```
   node server.js
   ```

5. Open browser at [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
.
├── models/        # Mongoose schemas (User, Post, Comment, Story, Notification)
├── views/         # EJS templates (feed, profile, post, explore, etc.)
├── public/        # Static assets (CSS, default avatar)
├── uploads/        # Local upload fallback folder
└── server.js      # Express app & all routes
```

---

## 👤 Author

**Arshita Kamboj** — CodeAlpha Web Development Intern

GitHub: [https://github.com/arshitakamboz-ui](https://github.com/arshitakamboz-ui)

---

## 📄 License

This project was built for educational purposes as part of the CodeAlpha internship program.
