import type { Config } from "@react-router/dev/config";

export default {
  // Disable SSR for client-only app with browser-only APIs (IndexedDB, CRDTs)
  // This is a local-first application that requires browser storage
  ssr: false,
} satisfies Config;
