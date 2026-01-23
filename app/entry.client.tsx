/**
 * Custom client entry point for React Router
 *
 * This follows the Automerge React tutorial pattern:
 * https://automerge.org/docs/tutorial/react/
 *
 * The key insight is that the Repo must be initialized BEFORE React renders,
 * not inside a component. This ensures the RepoContext is always available.
 */

import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { RepoContext } from "@automerge/react";
import { getRepo } from "~/lib/storage";

// Initialize the repo BEFORE React renders (browser-only)
// This is the key pattern from the Automerge documentation
const repo = getRepo();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RepoContext.Provider value={repo}>
        <HydratedRouter />
      </RepoContext.Provider>
    </StrictMode>,
  );
});
