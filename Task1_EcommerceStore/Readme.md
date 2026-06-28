# 🛍️ E-Commerce Store

A full-stack e-commerce web application built as part of my **CodeAlpha Web Development Internship**.

![Status](https://img.shields.io/badge/Status-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)

---

## 🌐 Live Demo

👉 **[Click here to view live site](https://codealpha-tasks-rcrd.onrender.com)**

> First load may take 30-60 seconds (free hosting spins down on inactivity)

---

## ✨ Features

- 🛒 **Product Listings** — Browse 9 products in a clean responsive grid
- 🔍 **Live Search** — Filter products instantly by name
- 📄 **Product Details Page** — View product info with quantity selector
- 🛍️ **Shopping Cart** — Add/remove items, increase/decrease quantity
- 👤 **User Authentication** — Register, login, logout with hashed passwords
- 📦 **Order Processing** — Place orders saved permanently to database
- 🤖 **AI Chatbot Assistant** — Floating chat bubble answers FAQs
- 🔔 **Toast Notifications** — Added to cart popup on every add
- 🔒 **Protected Checkout** — Only logged-in users can place orders
- 📱 **Responsive Design** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | HTML, CSS, JavaScript     |
| Templating     | EJS (Embedded JavaScript) |
| Backend        | Node.js, Express.js       |
| Database       | MongoDB Atlas (Mongoose)  |
| Authentication | express-session, bcryptjs |
| Hosting        | Render.com                |

---

## 🚀 Run Locally

1.  Clone the repo and go into the task folder

        git clone https://github.com/arshitakamboz-ui/CodeAlpha_Tasks.git
        cd CodeAlpha_Tasks/Task1_EcommerceStore

2.  Install dependencies

        npm install

3.  Add your MongoDB connection string as environment variable

        MONGODB_URI=mongodb+srv://a4155361_db_user:nHcxglrqTbay6MeO@cluster0.ut9jfrv.mongodb.net/?appName=Cluster0

4.  Seed the database

        node seed.js

5.  Start the server

        node server.js

6.  Open browser at http://localhost:3000

---

## 👩‍💻 Author

**Arshita** — CodeAlpha Web Development Intern

GitHub: https://github.com/arshitakamboz-ui

---

## 📝 License

This project was built for educational purposes as part of the CodeAlpha internship program.
