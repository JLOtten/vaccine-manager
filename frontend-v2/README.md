# Vaccine Manager - Local-First Application

A privacy-focused vaccine tracking application that stores all data locally in your browser.

## Features

- ✅ Track vaccinations for multiple family members
- ✅ Record vaccine details (date, location, dosage, notes)
- ✅ View vaccination history by family member
- ✅ Export and import data as JSON files
- ✅ All data stored locally in browser (LocalStorage)
- ✅ No authentication required - personal/family use
- ✅ Pluggable storage architecture (easy to swap backends)
- ✅ Material-UI components for modern UI
- ✅ Full TypeScript with type safety

## Default Vaccines

The app comes pre-configured with three common vaccines:
- COVID-19
- Seasonal Flu
- Tdap (Tetanus, diphtheria, pertussis)

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
# Run type checking
pnpm run typecheck

# Build the application
pnpm run build

# Start production server
pnpm start
```

The app will be available at `http://localhost:3000`

### Development Server (Alternative)

If you encounter "too many open files" error on macOS:

```bash
# Increase file descriptor limit
ulimit -n 10240

# Then run dev server
pnpm run dev
```

## Project Structure

```
frontend-v2/
├── app/
│   ├── components/          # React components
│   │   ├── ResponsiveAppBar.tsx
│   │   ├── Home.tsx
│   │   ├── FamilyMemberLog.tsx
│   │   ├── AddVaccine.tsx
│   │   ├── ViewRecord.tsx
│   │   ├── Settings.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   ├── hooks/
│   │   └── useStorage.ts    # Custom hooks for data access
│   ├── lib/
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── schemas.ts       # Zod validation schemas
│   │   └── storage/
│   │       ├── interface.ts       # IStorage interface
│   │       ├── localStorage.ts    # LocalStorage implementation
│   │       └── index.ts           # Storage singleton
│   ├── routes/              # React Router routes
│   └── root.tsx             # Root layout
```

## Storage Architecture

The app uses a pluggable storage interface that makes it easy to swap implementations:

### Current Implementation: LocalStorage
- Data stored in browser's LocalStorage
- Perfect for personal use
- No backend required
- Export/import for data portability

### Future Implementations (Easy to Add)
- **IndexedDB**: Better for large datasets
- **Cloudflare KV**: Cloud sync across devices
- **Durable Objects**: Real-time multi-device sync
- **File System API**: Direct file access

To swap implementations, simply create a new class implementing `IStorage` interface and update `app/lib/storage/index.ts`.

## Data Management

### Export Data
1. Navigate to Settings
2. Click "Export Data"
3. Save the JSON file

### Import Data
1. Navigate to Settings
2. Click "Import Data"
3. Select your JSON file

### Clear Data
⚠️ **Warning**: This permanently deletes all data!
1. Navigate to Settings
2. Click "Clear All Data"
3. Confirm the action

## Privacy

- All data stays in your browser
- No servers, no tracking, no analytics
- Export your data anytime
- Full control over your information

## Technology Stack

- **Framework**: React Router v7 (Remix successor)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Validation**: Zod
- **Package Manager**: pnpm
- **Build Tool**: Vite

## Deployment

### Cloudflare Pages

This app is ready to deploy to Cloudflare Pages:

```bash
# Build the app
pnpm run build

# Deploy (requires wrangler CLI)
npx wrangler pages deploy ./build/client
```

The app works as a static SPA, so it can be deployed to any static hosting service:
- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Future Enhancements

- [ ] PWA support (offline-first)
- [ ] Cloud sync with Cloudflare KV/Durable Objects
- [ ] Vaccination reminders
- [ ] PDF export of records
- [ ] Multi-language support
- [ ] Custom vaccine management

## License

This is a personal project. Use at your own discretion.
