# CampusConnect -- College Lost & Found Portal

CampusConnect is a premium, responsive full-stack Lost & Found Management System built for college campuses. It enables students to report lost/found items, upload photos, filter postings, submit ownership claim forms, and receive live notifications. Admins can review claims via transactional stored procedures, manage categories, moderate spam postings, and view detailed analytical summaries.

The system is built on **React (Vite) + Express + MySQL** and demonstrates advanced **Database Management System (DBMS)** features including normalization (3NF), indexes, views, triggers, and transactions.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router DOM, Axios, Plain Vanilla CSS3 (No Tailwind, No Bootstrap)
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer
- **Database**: MySQL (relational schema, transactional procedures, triggers, views, indexes)

---

## 📂 Project Structure

```text
CampusConnect/
 ├── database/
 │    ├── schema.sql         # DB Tables, PK/FK constraints, indexes, views
 │    ├── triggers.sql       # Audit triggers, notifications dispatch
 │    ├── procedures.sql     # Stored Procedures for claims processing
 │    └── sample_data.sql    # Seed data for immediate evaluation
 ├── server/
 │    ├── config/db.js       # MySQL Connection pool pool
 │    ├── controllers/       # Controller business logic
 │    ├── middleware/        # JWT Authentication checks
 │    ├── routes/            # Express routes
 │    ├── uploads/           # Uploaded item images storage
 │    ├── server.js          # Main listener launcher
 │    └── app.js             # Express app configs
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
 ├── verify.js               # SQL Verification suite
 └── DBMS_DOCUMENTATION.md   # Normalization, ERD, and API spec sheet
```

---

## 🚀 Getting Started

### 1. Database Setup
Ensure you have a running MySQL server. Log in to your MySQL terminal and run the SQL scripts in order:

```bash
# 1. Create database schema and views
mysql -u root -p < database/schema.sql

# 2. Add triggers
mysql -u root -p < database/triggers.sql

# 3. Add transactional stored procedures
mysql -u root -p < database/procedures.sql

# 4. Insert seed data
mysql -u root -p < database/sample_data.sql
```

### 2. Configure Backend
1. Open `server/.env` and update the database credentials to match your MySQL connection info:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=campus_connect
   JWT_SECRET=super_secret_jwt_key_campus_connect_2026
   ```
2. Open terminal in the `server/` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Start the Express server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

### 3. Configure Frontend
1. Open a new terminal in the `client/` directory and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The client application will run on `http://localhost:3000`.

---

## 🧪 DBMS Layer Verification
You can run the quick verification script to assert that all tables, views, procedures, and triggers are loaded correctly in your database:

```bash
# In the root folder:
cd server
npm install
cd ..
node verify.js
```

---

## 🔑 Demo Credentials

To check the app features immediately without registering new accounts, use these pre-loaded seed accounts (default password for all is `password123`):

- **Student User**: `alice_smith` or `bob_jones` (Password: `password123`)
- **Admin User**: `admin` (Password: `password123`)
