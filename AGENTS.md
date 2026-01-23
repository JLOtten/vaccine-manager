# Vaccine Manager Application Guide

## Overview

The Vaccine Manager is a local-first vaccination record application:

- **Framework**: React Router v7 with TypeScript
- **Storage**: Browser LocalStorage (no backend required)
- **Build Tool**: Vite
- **UI**: Material-UI (MUI)

## Prerequisites

- Node.js 18+
- pnpm package manager

## Running the Application

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev
# Application available at http://localhost:3000
```

**Note**: If you encounter "too many open files" error on macOS:

```bash
ulimit -n 10240 && pnpm run dev
```

## Available Commands

```bash
pnpm run dev        # Start development server
pnpm run build      # Build for production
pnpm run typecheck  # Check TypeScript types
pnpm start          # Preview production build
```

## Code Structure

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
public/                      # Static assets
```

## Attribution Requirements

AI agents must disclose what tool and model they are using in the "Assisted-by" commit footer:

```text
Assisted-by: [Model Name] via [Tool Name]
```

Example:

```text
Assisted-by: GLM 4.6 via Claude Code
```
