# Pastebin-Lite Application

A full-stack paste link application that allows users to create pastes with arbitrary text, generate shareable URLs, and view pastes. Pastes become unavailable when TTL expires or view limit is exceeded.

## Project Description

This application provides a simple and secure way to create temporary text pastes with configurable expiration times and view limits. Users can:

- Create pastes with custom content
- Set time-based expiration (TTL) in seconds
- Set maximum view limits
- Share pastes via generated URLs
- See live countdown timers and view counts

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Persistence**: Upstash Redis (REST API)
- **Deployment**: Render

## Persistence Layer

This application uses **Upstash Redis** as the persistence layer. Upstash Redis is a serverless Redis database that provides:

- REST API access (no persistent connections required)
- Automatic scaling
- Global distribution
- Free tier available

The application stores paste data in Redis with the following structure:
- **Key format**: `paste:{id}`
- **Data**: JSON string containing paste content, TTL settings, view counts, and timestamps
- **TTL**: Automatically handled by Redis for time-based expiration

No database migrations are required - the application works out of the box with Upstash Redis.

## Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **Upstash Redis account** (free tier available at [upstash.com](https://upstash.com))

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PasteLinkAssignment
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for both the server and client workspaces.

### 3. Set Up Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Sign up or log in
3. Create a new Redis database
4. Go to the **REST API** tab
5. Copy your `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 4. Configure Environment Variables

Create a `.env` file in the `server` directory:

**On Windows (PowerShell):**
```powershell
cd server
New-Item -Path .env -ItemType File
```

**On Linux/Mac:**
```bash
cd server
touch .env
```

Add the following to `server/.env`:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here
PORT=3000
NODE_ENV=development
```

**Note**: Replace the placeholder values with your actual Upstash Redis credentials from step 3.

**Example .env file structure:**
```
server/
  .env          ← Create this file here
  src/
  package.json
```

### 5. Run the Application

From the project root directory:

```bash
npm run dev
```

This will start:
- **Backend server** on port 3000
- **Frontend dev server** on port 5173

Open your browser and navigate to `http://localhost:5173`

## Running the Project Locally

### Development Mode

```bash
# Install dependencies (first time only)
npm install

# Start both server and client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health Check: `http://localhost:3000/api/healthz`

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

The production server will serve the built frontend and run on port 3000 (or the port specified in your `.env` file).

## Project Structure

```
PasteLinkAssignment/
├── server/                 # Backend Express server
│   ├── src/
│   │   ├── config/        # Environment configuration
│   │   ├── routes/        # API and page routes
│   │   ├── services/      # Redis service layer
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   ├── package.json
│   └── vite.config.ts
├── package.json            # Root workspace configuration
└── README.md
```

## API Endpoints

### Health Check
- **GET** `/api/healthz`
- Returns: `{ status: "ok", redis: "connected" | "disconnected", message: string }`
- Tests Redis connection

### Create Paste
- **POST** `/api/pastes`
- Body: `{ content: string, ttl_seconds?: number, max_views?: number }`
- Returns: `{ id: string, url: string, created_at: string }`

### Get Paste
- **GET** `/api/pastes/:id`
- Each successful fetch counts as a view
- Returns: `{ content: string, remaining_views: number | null, expires_at: string | null, created_at: string, is_expired: boolean }`
- Unavailable → 404 + JSON

### View Paste (HTML)
- **GET** `/p/:id`
- Returns HTML page with paste content
- Unavailable → 404

## Features

- ✅ Create pastes with arbitrary text
- ✅ Time-based expiry (TTL) with live countdown
- ✅ View-count limits with live tracking
- ✅ Automatic unavailability when constraints trigger
- ✅ Shareable URLs
- ✅ Creation date/time display
- ✅ Expired paste detection (shown in red)
- ✅ Multiple paste creation support

## Environment Variables

Required environment variables in `server/.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST API token | `xxx` |
| `PORT` | Server port (optional, default: 3000) | `3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Troubleshooting

### Redis Connection Issues

If you see `"redis": "disconnected"` in the health check:

1. Verify `.env` file exists in the `server` directory
2. Check that credentials are correct (no extra spaces or quotes)
3. Ensure you're using REST API credentials (not WebSocket)
4. Test your Redis connection at [console.upstash.com](https://console.upstash.com/)

### Port Already in Use

If port 3000 or 5173 is already in use:

1. Change `PORT` in `server/.env` for the backend
2. Update `client/vite.config.ts` for the frontend port

### Build Errors

```bash
# Clean install
rm -rf node_modules server/node_modules client/node_modules
npm install
```

## Deployment

The application is ready for deployment on Render or similar platforms:

1. Set environment variables in your deployment platform
2. Build command: `npm run build`
3. Start command: `npm start`

The application will automatically:
- Build the frontend and backend
- Serve static files from the built frontend
- Start the Express server

## License

This project is part of an assignment submission.

## Support

For issues or questions, please check:
- `TROUBLESHOOTING.md` for common issues
- `SETUP_GUIDE.md` for detailed setup instructions
- `NPM_COMMANDS.md` for available npm commands
