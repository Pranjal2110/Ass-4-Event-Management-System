# 🎟️ Event Management System (Eventify)
> **Assignment - 4 (CRUD - Client Side Rendering)**  
> **Project ID:** 7  
> **Deadline:** 12 October 2026 (9:00 AM)  

---

## 📌 Project Description
**Eventify** is a full-stack Event Management Web Application built with the MERN stack (React + Vite, Node.js, Express, MongoDB Atlas). The system provides a centralized platform for college/organization event organizers to manage events and attendees to discover upcoming tech symposiums, workshops, and fests, as well as register with real-time seat availability tracking.

---

## 👥 Team Information
- **Team Name:** [Insert Team Name Here]
- **Project Name:** Event Management System (Project ID: 7)
- **Team Lead:** Anjali Mishra - Roll No: [Insert Roll No]

### 🤝 Members & Work Distribution:
1. **Anjali Mishra (Team Lead)** — Roll No: [13]  
   - *PR 1:* `feature/backend-auth` (User model, JWT auth controller, `authenticateUser` & `requireAdmin` middlewares)  
   - *PR 2:* `feature/documentation-deployment` (Complete README documentation, repo structure, deployment setup)
2. **Utkarsh Patwa** — Roll No: [89]  
   - *PR 1:* `feature/event-crud-enhancement` (Event model, controller refactoring, search & venue filter)  
   - *PR 2:* `feature/event-registration-api` (Event registration & unregistration APIs, capacity logic)
3. **Pranjal Srivastava** — Roll No: [78]  
   - *PR 1:* `feature/frontend-routing-auth` (React Router DOM setup, AuthContext, Login & Register pages)  
   - *PR 2:* `feature/user-event-registration-ui` (EventCard registration actions, "My Registrations" page)
4. **Tanu Saini** — Roll No: [84]  
   - *PR 1:* `feature/admin-dashboard` (Admin dashboard console, event metrics, Create & Edit Event modal)  
   - *PR 2:* `feature/ui-polish-search-filter` (Live search bar, venue filters, capacity progress bar, responsive styling)

---

## 🚀 Live Deployment Links
- **GitHub Repository:** [https://github.com/anjalimishra-0007/Ass-4-Event-Management-System](https://github.com/anjalimishra-0007/Ass-4-Event-Management-System)
- **Frontend Live (Vercel):** [https://your-frontend.vercel.app](https://your-frontend.vercel.app) *(Update upon deployment)*
- **Backend Live (Render):** [https://your-backend.onrender.com](https://your-backend.onrender.com) *(Update upon deployment)*

---

## ✨ Features
### 1. Public / Attendee Features (User)
- 🔍 **Browse & Filter Events:** Search events by keyword/title/organizer and filter by venue.
- 🎟️ **Instant Registration:** Register for upcoming events with real-time capacity and seats left counter.
- 📋 **My Registrations:** View all registered events and easily cancel registration if plans change.
- 👤 **Role-Based Experience:** Clear badges, registered tags, and interactive indicators.

### 2. Organizer Features (Admin)
- ➕ **Create Event:** Add new event with title, description, date, venue, organizer, and capacity.
- ✏️ **Update Event:** Modify event timing, location, or details via an interactive modal.
- 🗑️ **Delete Event:** Permanently remove cancelled events.
- 📊 **Metrics Dashboard:** View total events, total seat capacity, and total active registrations.

### 3. Security & Architecture
- 🔐 **JWT Authentication:** Secure user authentication with password hashing via `bcryptjs`.
- 🛡️ **Role-Based Access Control (RBAC):** `authenticateUser` and `requireAdmin` middleware protecting API endpoints.
- 🌐 **CORS & Environment Configurations:** Clean `.env.example` setup with separated production variables.

---

## 🛠️ Tech Stack
- **Frontend:**
  - React.js (Vite)
  - React Router DOM
  - Axios
  - Vanilla CSS (Custom Design System, Google Fonts - Plus Jakarta Sans)
- **Backend:**
  - Node.js & Express.js
  - MongoDB Atlas & Mongoose
  - JSON Web Tokens (jsonwebtoken)
  - Bcrypt.js
  - Dotenv & CORS

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new User or Admin |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/me` | User / Admin | Retrieve current logged-in user profile |

### 🎟️ Events (`/api/events`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | Get all events (supports `?search=` and `?venue=`) |
| `GET` | `/api/events/:id` | Public | Get single event by ID |
| `POST` | `/api/events` | Admin Only | Create a new event |
| `PUT` | `/api/events/:id` | Admin Only | Update existing event |
| `DELETE` | `/api/events/:id` | Admin Only | Delete an event |
| `POST` | `/api/events/:id/register` | Authenticated | Register for an event |
| `DELETE` | `/api/events/:id/register` | Authenticated | Cancel event registration |
| `GET` | `/api/events/my-registrations` | Authenticated | Get user's registered events |

---

## 📂 Project Directory Structure
```text
Ass-4-Event-Management-System/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyRegistrationsPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── eventController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── Event.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── events.js
│   │   └── index.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/anjalimishra-0007/Ass-4-Event-Management-System.git
cd Ass-4-Event-Management-System
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder based on `.env.example`:
```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

Start backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder based on `.env.example`:
```env
VITE_API_URL=http://localhost:5001/api
```

Start frontend Vite development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌿 GitHub Team Workflow (Grading Rules)
1. **Never push directly to `main`**.
2. Each team member creates their branch:
   ```bash
   git checkout -b feature/<branch-name>
   ```
3. Commit and push work to their branch:
   ```bash
   git add .
   git commit -m "feat: descriptive message"
   git push origin feature/<branch-name>
   ```
4. Create a Pull Request (PR) on GitHub.
5. Team Lead reviews the PR and merges it into `main`.
6. Each member must have at least **2 meaningful PRs merged**.

---

## 📸 Screenshots
*(Add screenshots of Homepage, Event Registration, Login/Register, and Admin Dashboard here before final submission)*
