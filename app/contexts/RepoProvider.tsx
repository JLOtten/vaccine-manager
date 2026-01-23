/**
 * RepoProvider - Provides Automerge Repo context to the React app
 * This enables automatic re-renders when the Automerge document changes
 */

import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import type { ReactNode } from "react";
import { getRepo } from "~/lib/storage";

export function RepoProvider({ children }: { children: ReactNode }) {
  // Only initialize repo in browser context
  const repo = typeof window !== "undefined" ? getRepo() : null;

  if (!repo) {
    // SSR fallback - render children without repo context
    return <>{children}</>;
  }

  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}
