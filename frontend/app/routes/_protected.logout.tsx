import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getSession, destroySession } from "~/utils/session.server";
import { api } from "~/utils/api";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  // Call the backend logout endpoint
  try {
    await api.logout();
  } catch (error) {
    // Even if logout fails, we'll still destroy the session
    console.error("Logout error:", error);
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function Logout() {
  return null;
}
