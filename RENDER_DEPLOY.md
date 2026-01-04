# Deploying to Render

Follow these steps to deploy this monorepo (client + server) to Render. The repository is configured so the root `npm run build` will build the client and server, and `npm start` runs the server which serves the built client in production.

1. Commit your code and push to GitHub:

   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. In Render, create a new **Web Service** and connect your GitHub repository.

   - For **Build Command** enter: `npm run build`
   - For **Start Command** enter: `npm start`
   - Set the **Root Directory** to the repository root (default).

3. Add environment variables in the Render dashboard (do NOT commit secrets):

   - `UPSTASH_REDIS_REST_URL` = your Upstash REST URL
   - `UPSTASH_REDIS_REST_TOKEN` = your Upstash REST token
   - `NODE_ENV` = `production` (optional; also set via `render.yaml`)

4. (Optional) In the Render service settings, set the Node version to match the `engines` field (>=18).

5. Deploy. Render will run `npm run build` (root), which runs the client build and the server `tsc` build, producing `client/dist` and `server/dist`. The server (started with `node server/dist/index.js` via `npm start`) is configured to serve `client/dist` when `NODE_ENV=production`.

Notes and troubleshooting

- Do not commit `client/dist` or `server/dist`. The repository's `.gitignore` already excludes `dist/`.
- If you prefer using Render's `render.yaml`, it's included at the repo root. You still need to add secret values in the Render UI.
- If your build fails due to missing devDependencies, ensure Render installs devDependencies during build (default); if you use a custom build environment, make sure `typescript` is available for the `tsc` step.

If you want, I can:
- Create a small GitHub Actions workflow to run tests/build before push.
- Add a `postinstall` script to ensure any required build tools are available on Render.
