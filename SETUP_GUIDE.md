# Step-by-Step Setup Guide

Follow these steps to run the Paste Link Application on your system.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ npm installed (comes with Node.js)
- ✅ Upstash Redis account (free tier available at https://upstash.com)

---

## Step 1: Verify Installation

Check if dependencies were installed correctly:

```bash
# Check if node_modules exist
dir node_modules
dir server\node_modules
dir client\node_modules
```

If any are missing, run:
```bash
npm install
```

---

## Step 2: Set Up Upstash Redis

### 2.1 Create Upstash Redis Database

1. Go to https://console.upstash.com/
2. Sign up or log in
3. Click "Create Database"
4. Choose a name (e.g., "paste-link-db")
5. Select a region close to you
6. Click "Create"

### 2.2 Get Your Redis Credentials

1. Click on your database
2. Go to the "REST API" tab
3. Copy:
   - **UPSTASH_REDIS_REST_URL** (starts with `https://`)
   - **UPSTASH_REDIS_REST_TOKEN** (long alphanumeric string)

---

## Step 3: Create Environment File

1. Navigate to the `server` folder:
   ```bash
   cd server
   ```

2. Create a `.env` file:
   ```bash
   # On Windows PowerShell
   New-Item -Path .env -ItemType File
   
   # Or use your text editor to create server/.env
   ```

3. Open `server/.env` and add your credentials:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token-here
   PORT=3000
   NODE_ENV=development
   ```

4. Replace the values with your actual Upstash credentials from Step 2.2

5. Save the file

6. Go back to root directory:
   ```bash
   cd ..
   ```

---

## Step 4: Verify Environment File

Check that your `.env` file exists and has the correct format:

```bash
# Check if file exists
dir server\.env

# View contents (be careful not to share this publicly)
type server\.env
```

**Important:** Make sure `.env` is in the `server` folder, not the root folder!

---

## Step 5: Start the Development Server

From the root directory, run:

```bash
npm run dev
```

This will:
- Start the Express backend server on http://localhost:3000
- Start the Vite frontend dev server on http://localhost:5173
- Watch for file changes and auto-reload

You should see output like:
```
[server] Server running on port 3000
[client] VITE v5.x.x  ready in xxx ms
[client] ➜  Local:   http://localhost:5173/
```

---

## Step 6: Test the Application

### 6.1 Open the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the "Paste Link" homepage

### 6.2 Test Health Check

1. Open a new browser tab
2. Go to: **http://localhost:3000/api/healthz**
3. You should see:
   ```json
   {
     "status": "ok",
     "redis": "connected"
   }
   ```

If you see `"redis": "disconnected"`, check your `.env` file credentials.

### 6.3 Create a Test Paste

1. On the homepage (http://localhost:5173)
2. Enter some text in the "Content" field
3. Optionally set:
   - TTL (seconds) - e.g., 3600 for 1 hour
   - Max Views - e.g., 5
4. Click "Create Paste"
5. You should see a shareable link appear

### 6.4 Test Viewing a Paste

1. Copy the generated link
2. Open it in a new tab
3. You should see the paste content
4. If you set max views, refresh multiple times to test the limit

---

## Step 7: Verify Everything Works

### Test Checklist:

- [ ] Server starts without errors
- [ ] Client starts without errors
- [ ] Health check returns `"redis": "connected"`
- [ ] Can create a paste
- [ ] Shareable link is generated
- [ ] Can view paste via the link
- [ ] Paste content displays correctly
- [ ] Error messages show when paste is unavailable

---

## Troubleshooting

### Problem: "Cannot find module" errors

**Solution:**
```bash
# Clean install
rmdir /s /q node_modules server\node_modules client\node_modules
npm install
```

### Problem: Port 3000 or 5173 already in use

**Solution:**
1. Find what's using the port:
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :5173
   ```
2. Kill the process or change ports:
   - Edit `server/.env`: Change `PORT=3000` to `PORT=3001`
   - Edit `client/vite.config.ts`: Change port in server config

### Problem: "Redis: disconnected" in health check

**Solution:**
1. Verify `.env` file exists in `server` folder
2. Check credentials are correct (no extra spaces)
3. Test your Redis connection at https://console.upstash.com/
4. Make sure you copied the REST API credentials, not WebSocket

### Problem: "EADDRINUSE" error

**Solution:**
- Another process is using the port
- Close other applications or change the port number

### Problem: TypeScript compilation errors

**Solution:**
```bash
# Rebuild TypeScript
npm run build --workspace=server
npm run build --workspace=client
```

### Problem: Frontend doesn't load

**Solution:**
1. Check if Vite dev server is running (port 5173)
2. Check browser console for errors
3. Try clearing browser cache
4. Restart the dev server

---

## Running in Production Mode

If you want to test the production build:

```bash
# 1. Build everything
npm run build

# 2. Start production server
npm start
```

Then visit: **http://localhost:3000**

---

## Quick Command Reference

```bash
# Development (most common)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run server only
npm run dev --workspace=server

# Run client only
npm run dev --workspace=client
```

---

## Next Steps

Once everything is running:

1. ✅ Test creating pastes with different TTL values
2. ✅ Test view limits
3. ✅ Test paste expiration
4. ✅ Try accessing expired/unavailable pastes
5. ✅ Test the API endpoints directly using Postman or curl

---

## Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that ports 3000 and 5173 are available
5. Verify your Upstash Redis database is active

---

## Success Indicators

You'll know everything is working when:

✅ Both servers start without errors  
✅ Health check shows Redis connected  
✅ You can create a paste  
✅ You can view the paste via the generated link  
✅ Paste becomes unavailable after TTL or view limit  

**You're all set! 🎉**

