# 🎥 Reel – A Decentralized SocialFi Platform for Video and Livestreaming

Reel is a decentralized platform that allows users to upload short videos, long-form videos, and livestreams to share knowledge, entertainment, or everyday life moments. Content creators can earn income through views, likes, follows, and tips from viewers using tokens.

But Reel isn't just for creators — regular users can also earn tokens by completing simple daily tasks, such as watching videos, interacting, or joining challenges. Earned tokens can be used to raise Pet NFTs — digital pets that can be upgraded, traded, or collected on a marketplace.

## 🌟 Key Features

- **Decentralized Content Creation**: Upload videos and livestream freely, without relying on centralized platforms
- **Token Rewards System**: Earn tokens directly from views, interactions, and donations
- **Daily Task System**: Complete simple daily tasks to earn tokens through engagement
- **Pet NFT Ecosystem**: Raise and evolve Pet NFTs, which can be traded or collected
- **Community Governance**: DAO system allowing users to vote on rewards and featured content

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
