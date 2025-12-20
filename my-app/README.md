# Dakkhana (Post Office) – MERN Stack Project

This repo now contains a complete MERN implementation for a post-office style workflow:

- **Frontend**: React (Create React App) with React Router, Site landing page (services, tariffs, office locator), dual-auth flows (Admin & Customer), dashboards, booking wizard, and parcel tracking.
- **Backend**: Express + MongoDB (Mongoose) with JWT-based admin & customer auth, parcel CRUD APIs, dashboard stats, info feeds, and a seeding script for admin credentials.

---

## Prerequisites

- Node.js 18+
- MongoDB Atlas database (or local Mongo connection string)

---

## 1. Backend Setup (`my-app/server`)

```bash
cd my-app/server
npm install
cp env.sample .env   # update values for MONGODB_URI, JWT_SECRET, admin creds
npm run seed-admin   # creates the first admin user using ENV values
npm run dev          # runs Express API on http://localhost:5000
```

API routes are served under `/api/*` (e.g., `/api/auth/login`, `/api/parcels`).

---

## 2. Frontend Setup (`my-app`)

```bash
cd my-app
npm install
npm start            # CRA dev server on http://localhost:3000
```

Create a `.env` (optional) with `REACT_APP_API_URL=http://localhost:5000/api` to point the UI to your backend.

---

## Development Flow

1. Start the backend (`npm run dev` inside `server`).
2. Start the frontend (`npm start` inside `my-app`).
3. Log in with the seeded admin credentials to access parcel registration/list.
4. Public parcel tracking is available without logging in.

---

## Available Scripts (frontend)

- `npm start` – start CRA dev server
- `npm test` – React tests
- `npm run build` – production build

Backend scripts are defined inside `server/package.json`.

---

## Project Structure

```
my-app/
  src/components/...     # modular React UI
  src/context/...        # Auth context
  src/services/...       # API helper
  server/
    src/controllers/
    src/models/
    src/routes/
    scripts/seedAdmin.js
```

Feel free to extend with more features such as branch metrics, delivery timelines, SMS/email notifications, etc.
