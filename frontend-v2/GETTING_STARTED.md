# Getting Started with Vaccine Manager

Congratulations! Your local-first vaccine tracking application is ready to use.

## ✅ What's Been Built

### Core Features
- ✅ **Local-First Architecture** - All data stored in browser LocalStorage
- ✅ **No Authentication** - Perfect for personal/family use
- ✅ **Pluggable Storage** - Easy to swap LocalStorage for other backends
- ✅ **Full TypeScript** - Type-safe throughout
- ✅ **Material-UI** - Modern, responsive design
- ✅ **Export/Import** - JSON file-based data portability
- ✅ **PWA Ready** - Installable, works offline

### Pre-configured Vaccines
1. COVID-19
2. Seasonal Flu  
3. Tdap (Tetanus, diphtheria, pertussis)

### Pages
- **Home** - Dashboard with quick actions
- **Family Members** - Add/manage family members
- **Add Vaccine** - Record new vaccinations
- **View Records** - See vaccination history
- **Settings** - Export/import data, clear all data
- **About** - App information
- **Contact** - Contact information

## 🚀 Quick Start

```bash
cd frontend-v2

# Install dependencies
pnpm install

# Check types
pnpm run typecheck

# Build application
pnpm run build

# Start production server
pnpm start
```

Visit `http://localhost:3000`

## 📱 Using the App

### 1. Add Family Members
- Navigate to "Family Members"
- Fill in name, birthdate, and optional sex
- Click "Add Family Member"

### 2. Record Vaccinations
- Navigate to "Add Vaccine"
- Select family member
- Select vaccine (COVID-19, Seasonal Flu, or Tdap)
- Enter date, location, dosage (optional), notes (optional)
- Click "Add Vaccine Record"

### 3. View Records
- Navigate to "View Records"
- Select a family member from dropdown
- See all their vaccination history in a table

### 4. Export Your Data
- Navigate to "Settings"
- Click "Export Data"
- Save the JSON file as backup

### 5. Import Data
- Navigate to "Settings"
- Click "Import Data"
- Select a previously exported JSON file
- All data will be replaced with imported data

## 🏗️ Architecture Highlights

### Storage Interface
```typescript
// app/lib/storage/interface.ts
export interface IStorage {
  getFamilyMembers(): Promise<FamilyMember[]>;
  addFamilyMember(member): Promise<FamilyMember>;
  // ... all CRUD operations
}
```

This means you can easily create:
- `IndexedDBAdapter` for large datasets
- `CloudflareKVAdapter` for cloud sync
- `DurableObjectAdapter` for real-time sync
- `FileSystemAdapter` for direct file access

Just implement the interface and swap in `app/lib/storage/index.ts`!

### Custom Hooks
```typescript
// Easy data access anywhere in your app
const { members, addMember, deleteMember } = useFamilyMembers();
const { vaccines } = useVaccines();
const { records, addRecord } = useVaccineRecords(familyMemberId);
const { exportData, importData } = useExportImport();
```

### Type Safety
Full TypeScript coverage with Zod runtime validation:
- Types defined in `app/lib/types.ts`
- Schemas in `app/lib/schemas.ts`
- Automatic validation on data import

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy to Cloudflare Pages:**
```bash
pnpm run build
npx wrangler pages deploy build/client --project-name=vaccine-manager
```

## 🔒 Privacy & Security

- **No Backend** - No servers, no databases, no APIs
- **No Authentication** - No passwords, no login, no accounts
- **No Tracking** - No analytics, no cookies (except LocalStorage for your data)
- **Full Control** - Export your data anytime, delete anytime
- **Offline-First** - Works without internet after first load

Your medical data never leaves your device!

## 📂 Project Structure

```
frontend-v2/
├── app/
│   ├── components/          # All UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── storage/        # Pluggable storage layer
│   │   ├── types.ts        # TypeScript types
│   │   └── schemas.ts      # Zod validation
│   ├── routes/             # File-based routing
│   └── root.tsx            # Root layout with nav
├── public/                  # Static assets
│   ├── manifest.json       # PWA manifest
│   └── favicon.ico
├── README.md               # Full documentation
├── DEPLOYMENT.md           # Deployment guide
└── package.json
```

## 🎨 Customization

### Add More Vaccines
Edit `app/lib/storage/localStorage.ts` and update `getDefaultVaccines()`:

```typescript
private getDefaultVaccines(): Vaccine[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "MMR",
      description: "Measles, mumps, rubella vaccine",
    },
    // ... add more
  ];
}
```

### Change Theme
Material-UI theme can be customized in components or by wrapping the app with `<ThemeProvider>`.

### Add Cloud Sync
1. Create new storage adapter (e.g., `cloudflareKV.ts`)
2. Implement `IStorage` interface
3. Update `app/lib/storage/index.ts` to use new adapter

## 🐛 Troubleshooting

### Dev Server "Too Many Open Files"
```bash
# macOS: Increase file descriptor limit
ulimit -n 10240
pnpm run dev
```

### Data Not Saving
- Check browser allows LocalStorage
- Try incognito/private mode
- Check browser console for errors

### Build Errors
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

## 📚 Next Steps

1. **Test the app** - Add some family members and records
2. **Export your data** - Get familiar with backup/restore
3. **Deploy** - Share with family (see DEPLOYMENT.md)
4. **Customize** - Add more vaccines, change styling
5. **Extend** - Add cloud sync, reminders, PDF export

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📝 License

Personal use project. No warranty provided.

---

**Built with ❤️ using React Router v7, TypeScript, Material-UI, and Zod**

Enjoy your privacy-focused vaccine tracking! 💉📱
