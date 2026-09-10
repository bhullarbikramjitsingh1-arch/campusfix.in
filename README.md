# CampusFix — Netlify edition

Full source, same CampusFix UI, student/admin workflow, analysis fallback, report tracking and uploads. The Cloudflare-only backend has been replaced with Netlify Functions + Netlify Blobs. This is a separate export; the original live site is unchanged.

## Fix for the build error in your screenshot
This package uses plain Vite with Netlify Functions. It does not import
`./build/sites-vite-plugin` or require Vinext, Next.js, D1, or R2.

1. Extract this ZIP. Create a **new empty GitHub repository** to avoid old files.
2. Upload the extracted contents. `package.json`, `package-lock.json`,
   `vite.config.ts`, and `netlify.toml` must be at the repository's top level.
3. Import that repository into Netlify. Base directory: leave blank.
4. Build command: `npm run build`. Publish directory: `dist`.
   Functions directory: `netlify/functions`. Node version: `22`.
5. Deploy. These settings are already in `netlify.toml`.

If the build log still says `vinext build`, Netlify is using the old repository,
base directory, or build command. Select this package's repository and use
`npm run build`; its log should show `tsc --noEmit && vite build`.

The same website, dark-mode preference, logo and reporting workflows are included.
The original hosted database is not moved to Netlify; Netlify creates its own
persistent workspace when you first open the site.

## Deployment from your computer (Windows)
1. Install Node.js 22.13+ and extract this ZIP.
2. Open the extracted CampusFix-Netlify folder in VS Code. Choose Terminal → New Terminal. Confirm package.json and netlify.toml are in this folder.
3. Run `npm ci` (PowerShell execution-policy error? Use `npm.cmd ci`, or a Command Prompt terminal).
4. Run `npm run deploy` (or `npm.cmd run deploy`). This builds the frontend and packages the backend functions.
5. Netlify CLI asks you to log in. Complete that in your own browser. Choose/create the Netlify project you want to deploy to. Do not select an unrelated existing project.
6. Open the production URL printed on success. Test Student → report → Admin update → Student tracking.

## Alternative: GitHub import
1. Create a GitHub repository and upload this folder's CONTENTS, including package.json, package-lock.json, netlify.toml, components, lib and netlify. Do not upload the ZIP itself, node_modules or dist.
2. In Netlify, add/import a project from Git and choose that repository.
3. Base directory: blank if package.json is at repository root. Otherwise use the directory containing package.json.
4. Build command: `npm run build`. Publish directory: `dist`. Functions directory: `netlify/functions`.
5. Deploy. netlify.toml already supplies these settings. No Firebase, Cloudflare account or AI key required.

## Important: Netlify Drop is not a full-stack deployment
Dragging source files or a ZIP into Netlify Drop does not run npm or deploy this backend. Even dragging the generated dist folder only publishes the interface. Use the CLI or Git method above for working report storage and uploads.

## Local development
Run `npm ci`, then `npm run dev:full`. Open the URL printed by Netlify Dev, normally http://localhost:8888. This starts the frontend, API and local Blobs emulation. `npm run dev` alone previews the frontend only.

## Configuration
Netlify Functions automatically receives credentials for Netlify Blobs on a normal hosted deployment. No manually supplied secrets are required. Never put a Netlify access token in browser code. CLI login stores its authentication on your computer; it is not included in this ZIP.

## Storage and demo limits
Data is stored in site-wide Netlify Blobs, not browser localStorage. Each browser has a private demo session cookie. Student and Admin intentionally share that demo. A different browser or cleared cookies starts a new demo. Original ChatGPT-hosted reports are NOT migrated. Demo roles are not production university authentication. Analysis is a labeled rule-based fallback, not a connected AI model. Photos support JPG/PNG/WebP up to 3 MB, reduced to fit serverless payload limits. Hosting and storage usage are subject to your Netlify plan and limits.

## Files
- main.tsx, index.html: app entry
- components/campus/: existing UI and flows
- style.css: responsive glass UI
- lib/campus/model.ts: types, demo data, analysis
- lib/campus/client.ts: request timeouts and compatible IDs
- netlify/functions/api.ts: server validation, persistent report updates, image upload/delivery
- netlify.toml: builds, function packaging and route rewrites
- vite.config.ts, tsconfig.json, package-lock.json: reproducible build configuration

## Troubleshooting
- Blank page / 404: check publish directory is dist and netlify.toml is at the project root.
- API returns HTML or reports unavailable: deploy via Git or CLI; static Drop does not include functions.
- Build cannot find package.json: fix the base directory or upload the extracted contents.
- npm not found: install Node.js and reopen the terminal.
- Storage missing locally: use npm run dev:full, not npm run dev.
- Concurrent update: refresh and retry; conditional writes prevent overwriting another update.
- Upload fails: use a valid image under 3 MB.

## Validation
The TypeScript check, Vite production build, and Netlify API function packaging passed for this export.

Run `npm run build` for TypeScript and production bundle validation. The export is not a deployment to your Netlify account; your account's deployment result is the final hosted verification.
