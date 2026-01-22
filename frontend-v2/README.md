# Vaccine Manager

A local-first vaccine tracking application that stores all data in your browser.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Open http://localhost:3000
```

**Note**: If you encounter "too many open files" error on macOS:
```bash
ulimit -n 10240 && pnpm run dev
```

## Available Scripts

```bash
# Development server with hot reload
pnpm run dev

# Type checking
pnpm run typecheck

# Build for production
pnpm run build

# Preview production build
pnpm start
```

## Project Structure

```
app/
├── components/              # UI components
│   ├── ResponsiveAppBar.tsx
│   ├── Home.tsx
│   ├── FamilyMemberLog.tsx
│   ├── AddVaccine.tsx
│   ├── ViewRecord.tsx
│   ├── Settings.tsx
│   ├── About.tsx
│   └── Contact.tsx
├── hooks/
│   └── useStorage.ts        # Custom hooks for data access
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── schemas.ts           # Zod validation schemas
│   └── storage/             # Pluggable storage layer
│       ├── interface.ts     # IStorage interface
│       ├── localStorage.ts  # LocalStorage implementation
│       └── index.ts         # Storage singleton
├── routes/                  # File-based routes
└── root.tsx                 # Root layout with navigation
```

## Storage Architecture

The app uses a pluggable storage interface (`IStorage`) that makes it easy to swap backends:

**Current**: LocalStorage (browser-based, no backend needed)

To add a new storage backend:
1. Create a new class implementing `IStorage` interface
2. Update `app/lib/storage/index.ts` to use your implementation

## Technology Stack

- **Framework**: React Router v7
- **Language**: TypeScript
- **UI**: Material-UI (MUI)
- **Validation**: Zod
- **Build**: Vite
- **Package Manager**: pnpm

## Default Vaccines

The app comes pre-configured with:
- COVID-19
- Seasonal Flu
- Tdap (Tetanus, diphtheria, pertussis)

## Development Notes

- All data is stored in browser LocalStorage
- Export/import functionality available in Settings
- No authentication or backend required
