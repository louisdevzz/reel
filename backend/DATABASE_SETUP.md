# Database Setup Guide

## Prerequisites

1. PostgreSQL installed and running
2. Node.js/Bun installed
3. Environment variables configured

## Environment Variables

Create a `.env` file in the backend directory with:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/reel_db"

# Server Configuration
PORT=3001
NMS_RTMP_PORT=1935
NMS_HTTP_PORT=8000
```

## Database Setup Steps

1. **Create Database**
   ```sql
   CREATE DATABASE reel_db;
   ```

2. **Generate Migration**
   ```bash
   bun run db:generate
   ```

3. **Run Migration**
   ```bash
   bun run db:migrate
   ```

4. **Start Development Server**
   ```bash
   bun run dev
   ```

## Database Schema

The application uses the following main tables:

### Users Table
- `id` - UUID primary key
- `username` - Unique username
- `email` - User email
- `description` - User bio
- `avatar` - Profile picture URL
- `aptosAddress` - Aptos wallet address
- `joinDate` - Account creation date
- `followers` - Number of followers
- `following` - Number of following
- `videos` - Total regular videos
- `shorts` - Total short videos
- `views` - Total video views
- `totalDonation` - Total donations received
- `totalDonationCount` - Number of donations
- `tags` - JSON array of user tags
- `social` - JSON object of social media links

## Drizzle Studio

To view and manage the database through a web interface:

```bash
bun run db:studio
```

This will open Drizzle Studio at `http://localhost:4983` 