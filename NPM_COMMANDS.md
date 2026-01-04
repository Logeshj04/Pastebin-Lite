# NPM Commands Guide

This document lists all npm commands required for the Paste Link Application.

## Initial Setup

### 1. Install All Dependencies
```bash
npm install
```
This installs dependencies for the root workspace, server, and client.

---

## Development Commands

### 2. Run Development Server (Both Frontend & Backend)
```bash
npm run dev
```
- Runs both server and client in development mode
- Server: http://localhost:3000
- Client: http://localhost:5173
- Uses `concurrently` to run both processes simultaneously

### 3. Run Server Only (Development)
```bash
npm run dev --workspace=server
```
- Runs Express server with hot reload using `tsx watch`
- Server: http://localhost:3000

### 4. Run Client Only (Development)
```bash
npm run dev --workspace=client
```
- Runs Vite dev server
- Client: http://localhost:5173
- Includes hot module replacement

---

## Build Commands

### 5. Build Everything (Production)
```bash
npm run build
```
- Builds client first (TypeScript compilation + Vite build)
- Then builds server (TypeScript compilation)
- Output:
  - Client: `client/dist/`
  - Server: `server/dist/`

### 6. Build Server Only
```bash
npm run build --workspace=server
```
- Compiles TypeScript to JavaScript
- Output: `server/dist/`

### 7. Build Client Only
```bash
npm run build --workspace=client
```
- Compiles TypeScript
- Builds production bundle with Vite
- Output: `client/dist/`

---

## Production Commands

### 8. Start Production Server
```bash
npm start
```
- Starts the compiled Express server
- Serves built frontend from `client/dist/`
- Requires `npm run build` to be run first

### 9. Preview Client Build (Production)
```bash
npm run preview --workspace=client
```
- Previews the production build locally
- Useful for testing the built frontend

---

## Workspace-Specific Commands

### Server Workspace Commands
```bash
# Development
npm run dev --workspace=server

# Build
npm run build --workspace=server

# Start production
npm run start --workspace=server
```

### Client Workspace Commands
```bash
# Development
npm run dev --workspace=client

# Build
npm run build --workspace=client

# Preview production build
npm run preview --workspace=client
```

---

## Complete Setup & Run Workflow

### First Time Setup
```bash
# 1. Install all dependencies
npm install

# 2. Create .env file in server directory
# Add your Upstash Redis credentials:
# UPSTASH_REDIS_REST_URL=your_url
# UPSTASH_REDIS_REST_TOKEN=your_token
# PORT=3000
# NODE_ENV=development
```

### Development Workflow
```bash
# Start both server and client
npm run dev
```

### Production Deployment Workflow
```bash
# 1. Build everything
npm run build

# 2. Start production server
npm start
```

---

## Additional Useful Commands

### Check Installed Packages
```bash
# Root workspace
npm list

# Server workspace
npm list --workspace=server

# Client workspace
npm list --workspace=client
```

### Update Dependencies
```bash
# Update all dependencies
npm update

# Update specific workspace
npm update --workspace=server
npm update --workspace=client
```

### Clean Install (Remove node_modules and reinstall)
```bash
# Remove all node_modules
rm -rf node_modules server/node_modules client/node_modules

# Reinstall
npm install
```

---

## Environment Setup

Before running the application, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** (comes with Node.js)
3. **Upstash Redis** account and credentials

### Environment Variables (server/.env)
```
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
PORT=3000
NODE_ENV=development
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Run both server and client in dev mode |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run dev --workspace=server` | Run server only (dev) |
| `npm run dev --workspace=client` | Run client only (dev) |
| `npm run build --workspace=server` | Build server only |
| `npm run build --workspace=client` | Build client only |

---

## Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use:
- Change `PORT` in `server/.env` for server
- Change port in `client/vite.config.ts` for client

### Module Not Found Errors
```bash
# Clean install
rm -rf node_modules server/node_modules client/node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build --workspace=server
npm run build --workspace=client
```

