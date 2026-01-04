# Troubleshooting Guide

## Issue: Redis Shows "disconnected" in Health Check

If you're seeing `{"status":"ok","redis":"disconnected"}`, follow these steps:

### Step 1: Verify .env File Exists

Check that the `.env` file exists in the `server` directory:

```bash
# From project root
dir server\.env
```

If it doesn't exist, create it:
```bash
cd server
# Create .env file (use your text editor)
cd ..
```

### Step 2: Check .env File Location

**IMPORTANT:** The `.env` file must be in the `server` folder, NOT the root folder!

```
PasteLinkAssignment/
├── server/
│   ├── .env          ← HERE (correct location)
│   └── src/
└── .env              ← NOT HERE (wrong location)
```

### Step 3: Verify .env File Contents

Open `server/.env` and ensure it has this format (no quotes around values):

```
UPSTASH_REDIS_REST_URL=https://your-actual-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-actual-token-here
PORT=3000
NODE_ENV=development
```

**Common mistakes:**
- ❌ `UPSTASH_REDIS_REST_URL="https://..."` (quotes not needed)
- ❌ `UPSTASH_REDIS_REST_URL = https://...` (spaces around =)
- ❌ Missing `UPSTASH_` prefix
- ❌ Using WebSocket URL instead of REST API URL

### Step 4: Get Correct Upstash Credentials

1. Go to https://console.upstash.com/
2. Select your database
3. Click on **"REST API"** tab (NOT Redis or WebSocket)
4. Copy:
   - **UPSTASH_REDIS_REST_URL** - Should start with `https://`
   - **UPSTASH_REDIS_REST_TOKEN** - Long alphanumeric string

### Step 5: Restart the Server

After updating `.env`, restart the server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 6: Check Console Output

When the server starts, you should see:
- ✅ No error messages about missing environment variables
- ✅ "Server running on port 3000"

If you see:
- ❌ "Missing required environment variable: UPSTASH_REDIS_REST_URL"
- ❌ "Failed to initialize Redis client"

Then your `.env` file is not being read correctly.

### Step 7: Test Health Check Again

Visit: http://localhost:3000/api/healthz

You should see:
```json
{
  "status": "ok",
  "redis": "connected",
  "message": "Redis connection successful"
}
```

If still disconnected, check the error message in the response.

---

## Common Issues and Solutions

### Issue: "Missing required environment variable"

**Cause:** `.env` file missing or variables not set correctly

**Solution:**
1. Verify `.env` file exists in `server/` directory
2. Check variable names are exactly: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Ensure no extra spaces or quotes
4. Restart server after changes

### Issue: "Failed to initialize Redis client"

**Cause:** Invalid credentials or network issue

**Solution:**
1. Verify credentials are correct in Upstash console
2. Check you're using REST API credentials (not WebSocket)
3. Test connection at https://console.upstash.com/
4. Ensure database is active (not paused)

### Issue: Server crashes on startup

**Cause:** Environment variables not loaded before Redis initialization

**Solution:**
- The code has been fixed to load env vars first
- Make sure you're using the latest code
- Restart the server

### Issue: Health check works but pastes don't save

**Cause:** Redis connection might be intermittent

**Solution:**
1. Check Redis database status in Upstash console
2. Verify you haven't exceeded free tier limits
3. Check network connectivity

---

## Verification Checklist

Use this checklist to verify your setup:

- [ ] `.env` file exists in `server/` directory
- [ ] `.env` file contains `UPSTASH_REDIS_REST_URL`
- [ ] `.env` file contains `UPSTASH_REDIS_REST_TOKEN`
- [ ] No quotes around values in `.env`
- [ ] No spaces around `=` in `.env`
- [ ] Credentials are from REST API tab (not WebSocket)
- [ ] Server restarted after creating/updating `.env`
- [ ] No error messages in console on startup
- [ ] Health check shows `"redis": "connected"`

---

## Testing Your Setup

### Test 1: Environment Variables
```bash
# From server directory
cd server
node -e "require('dotenv').config(); console.log('URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing'); console.log('TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Missing');"
```

### Test 2: Health Check
```bash
curl http://localhost:3000/api/healthz
```

Or visit in browser: http://localhost:3000/api/healthz

### Test 3: Create a Paste
1. Go to http://localhost:5173
2. Enter some text
3. Click "Create Paste"
4. If it works, Redis is connected!

---

## Still Having Issues?

1. **Check server console** for detailed error messages
2. **Verify Upstash database** is active and not paused
3. **Test credentials** directly in Upstash console
4. **Check network** - ensure you can reach Upstash API
5. **Review logs** - the health check now provides detailed error messages

---

## Quick Fix Command

If you're still having issues, try this complete reset:

```bash
# 1. Stop the server (Ctrl+C)

# 2. Verify .env file
cat server/.env
# or on Windows:
type server\.env

# 3. Restart
npm run dev
```

---

## Need More Help?

The health check endpoint now provides detailed error messages. Check the response at:
http://localhost:3000/api/healthz

The `message` field will tell you exactly what's wrong.

