# Reel

Reel is a full-stack live streaming platform, featuring a Bun/Express backend and a modern React frontend. The project is organized into two main folders:

- `backend/` — Bun/Express API, streaming server, database, and media handling
- `frontend/` — React web client for viewers and streamers

---

## Folder Structure

```
reel/
  backend/   # API, streaming, database, media
    src/
      controllers/   # API controllers
      routes/        # Express routes
      services/      # Business logic/services
      lib/           # Utilities
      types/         # Type definitions
    db/              # Database schema & migrations
    media/           # Media storage
    ...
  frontend/  # React web client
    src/
      components/    # React components
      routes/        # App routes
      lib/           # Utilities/context
      types/         # Type definitions
    public/          # Static assets
    ...
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) v1.2+
- [Node.js](https://nodejs.org/) (for some dev tools)

### 1. Install dependencies

From the project root, run:

```bash
bun install
```

### 2. Environment Setup
- See `backend/README.md` and `backend/DATABASE_SETUP.md` for backend environment variables and database setup.
- See `frontend/README.md` for frontend environment notes.

### 3. Running the Project

#### Start Backend & Frontend Together

From the project root, run:

```bash
bun start
```

This will start both the backend API/streaming server and the frontend React app concurrently.

#### Start Individually

- **Backend:**
  ```bash
  cd backend
  bun run start
  ```
- **Frontend:**
  ```bash
  cd frontend
  bun run dev
  ```

---

## Scripts
- `bun run dev` (in backend): Starts backend API
- `bun run rtmp` (in backend): Starts RTMP media server
- `bun run dev` (in frontend): Starts React app

---

## More Info
- Backend: See `backend/README.md`
- Frontend: See `frontend/README.md`
