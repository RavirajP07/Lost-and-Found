# Lost and Found -- College Portal

Lost and Found is a responsive full-stack Lost & Found Management System built for college campuses. It enables students to report lost/found items, upload photos, filter postings, submit ownership claim forms, and receive live notifications. Admins can review claims, manage categories, moderate spam postings, and oversee the platform.

The system is built on the **MERN Stack** (MongoDB, Express, React, Node.js) and demonstrates modern web development practices including RESTful API design, JWT authentication, and responsive UI.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router DOM, Axios, Plain Vanilla CSS3 (No Tailwind, No Bootstrap)
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer
- **Database**: MongoDB (Mongoose ODMs, relationships via ObjectIds)

---

## 📂 Project Structure

```text
CampusConnect/
 ├── server/
 │    ├── config/db.js       # MongoDB Connection setup
 │    ├── models/            # Mongoose schemas (User, Item, Claim, Category, Notification, ActivityLog)
 │    ├── controllers/       # Controller business logic
 │    ├── middleware/        # JWT Authentication checks & role validation
 │    ├── routes/            # Express REST routes
 │    ├── uploads/           # Uploaded item images storage
 │    ├── server.js          # Main listener launcher
 │    ├── app.js             # Express app configs
 │    └── reset_db.js        # Script to wipe database and re-seed defaults
 ├── client/
 │    ├── src/
 │    │    ├── components/   # UI elements (Header, forms, modals)
 │    │    ├── pages/        # View routes (Dashboards, Search, Details)
 │    │    ├── css/          # Premium stylesheets (index.css, App.css)
 │    │    ├── services/     # Axios API wrappers
 │    │    ├── App.jsx       # App main component and route guards
 │    │    └── main.jsx      # React entry mount point
 │    ├── vite.config.js     # Dev server proxy configuration
 │    └── index.html         # Base template
 └── README.md
```

---

## 🚀 Getting Started

### 1. Configure Backend & Database
1. Ensure you have MongoDB installed and running locally, or have a MongoDB Atlas connection string.
2. Open terminal in the `server/` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Open `server/.env` (or create one) and configure your environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/lost_and_found
   JWT_SECRET=super_secret_jwt_key_lost_and_found_2026
   ```
4. **Seed the Database**: Run the reset script to initialize default categories and the Admin account:
   ```bash
   node reset_db.js
   ```
5. Start the Express server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

### 2. Configure Frontend
1. Open a new terminal in the `client/` directory and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The client application will run on `http://localhost:3001` (or the port specified by Vite).

---

## 🔑 Demo Credentials

After running `node reset_db.js`, the following admin account will be available to manage the platform:

- **Admin Account**: `admin@lostandfound.com`
- **Password**: `admin123`

To test the student flow, simply click "Register" on the login page to create a new student account.
