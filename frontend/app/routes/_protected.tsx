import { Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/utils/session.server";
import ResponsiveAppBar from "~/components/ResponsiveAppBar";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  return json({});
}

export default function ProtectedLayout() {
  return (
    <>
      <ResponsiveAppBar />
      <Outlet />
    </>
  );
}
