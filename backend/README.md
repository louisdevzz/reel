# Backend - Reel

## Overview
The `backend` folder contains the source code for the backend of the Reel project. It is responsible for handling APIs, database management, authentication, stream management, and media-related services.

## Folder Structure
- `db/` - Database migrations, schema, and connection management
- `src/controllers/` - Controllers for API logic
- `src/routes/` - API route definitions
- `src/services/` - Business logic services
- `src/types/` - TypeScript type definitions
- `media/` - Temporary media storage (e.g., stream records)
- `start-media-server.ts` - Script to start the media server
- `index.ts` - Main entry point for the backend

## Setup & Run
1. Install dependencies:
   ```bash
   bun install
   ```
2. Set up the database (see `DATABASE_SETUP.md`)
3. Run the backend:
   ```bash
   bun run index.ts
   ```
4. (Optional) Start the media server:
   ```bash
   bun run start-media-server.ts
   ```

## Additional Documentation
- `DATABASE_SETUP.md`: Database setup guide
- `STREAMING_SETUP.md`: Streaming setup guide
- `VIDEO_UPLOAD_SETUP.md`: Video upload guide
- `CORS_SETUP.md`, `RTMP_SETUP.md`, `DEBUG_STREAM_KEY.md`, `QUICK_FIX.md`: Additional configuration references
