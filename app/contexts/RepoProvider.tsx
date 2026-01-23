/**
 * RepoProvider - Provides Automerge Repo context to the React app
 * This enables automatic re-renders when the Automerge document changes
 */

import { RepoContext } from "@automerge/react";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import type { Repo } from "@automerge/automerge-repo";
import { getRepo } from "~/lib/storage";

export function RepoProvider({ children }: { children: ReactNode }) {
  const [repo, setRepo] = useState<Repo | null>(null);

  useEffect(() => {
    // Only initialize in the browser after mount
    const repoInstance = getRepo();
    setRepo(repoInstance);
  }, []);

  if (!repo) {
    return (
      <div style={{ padding: "20px", textAlign: "center", marginTop: "50px" }}>
        Initializing...
      </div>
    );
  }

  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}
