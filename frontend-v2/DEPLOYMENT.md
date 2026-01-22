# Deployment Guide

## Cloudflare Pages (Recommended)

### Option 1: Deploy via Git (Automatic)

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Create a project"
   - Connect your Git repository

3. **Configure Build Settings**
   - Framework preset: **React Router**
   - Build command: `pnpm run build`
   - Build output directory: `build/client`
   - Root directory: `frontend-v2` (or leave blank if this is the root)

4. **Deploy**
   - Click "Save and Deploy"
   - Your site will be live at `https://vaccine-manager.pages.dev`

### Option 2: Deploy via Wrangler CLI (Manual)

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build and Deploy**
   ```bash
   # Build the application
   pnpm run build

   # Deploy to Cloudflare Pages
   wrangler pages deploy build/client --project-name=vaccine-manager
   ```

4. **Your site is live!**
   - Wrangler will output the deployment URL
   - Example: `https://vaccine-manager.pages.dev`

### Custom Domain

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains"
3. Add your domain (e.g., `vaccine.example.com`)
4. Follow DNS configuration instructions

---

## Alternative: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   pnpm run build
   cd build/client
   vercel --prod
   ```

---

## Alternative: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   pnpm run build
   netlify deploy --prod --dir=build/client
   ```

---

## Alternative: GitHub Pages

1. **Build the application**
   ```bash
   pnpm run build
   ```

2. **Configure for subdirectory** (if deploying to `username.github.io/repo-name`)
   - Update `vite.config.ts` to add `base: '/repo-name/'`
   - Rebuild

3. **Deploy**
   ```bash
   # Create gh-pages branch
   git checkout -b gh-pages
   
   # Copy build files
   cp -r build/client/* .
   
   # Commit and push
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

4. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Select `gh-pages` branch
   - Save

---

## Environment Variables

Since this is a local-first application, no environment variables are needed! All data stays in the browser.

If you later add cloud sync features, you can configure environment variables in your deployment platform:

### Cloudflare Pages
- Dashboard > Pages > Project > Settings > Environment variables

### Vercel/Netlify
- Dashboard > Project > Settings > Environment Variables

---

## Post-Deployment Checklist

- [ ] Test the deployed site
- [ ] Verify LocalStorage persistence
- [ ] Test export/import functionality
- [ ] Check mobile responsiveness
- [ ] Add to home screen (PWA)
- [ ] Share with family!

---

## Monitoring & Analytics (Optional)

Since this is a privacy-focused app, analytics are **not included**. 

If you want to add them:
- **Cloudflare Web Analytics** (privacy-friendly, no cookies)
- **Plausible** (open-source, privacy-focused)
- **Umami** (self-hosted, privacy-focused)

---

## Troubleshooting

### Build Fails
- Clear `node_modules` and reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
- Check TypeScript errors: `pnpm run typecheck`

### Data Not Persisting
- Check browser LocalStorage settings (must allow storage)
- Test in incognito/private mode
- Check browser console for errors

### PWA Not Installing
- Must be served over HTTPS (automatic on Cloudflare Pages)
- Check manifest.json is accessible
- Look for errors in browser DevTools > Application > Manifest

---

## Updates

To deploy updates:

1. Make changes locally
2. Test: `pnpm run build && pnpm start`
3. Commit and push (for Git-based deployments)
   - OR run `wrangler pages deploy build/client` (for CLI deployments)

Your users' data will remain intact since it's stored locally!
