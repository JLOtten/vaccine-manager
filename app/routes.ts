import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("family-members", "routes/family-members.tsx"),
  route("add-vaccine", "routes/add-vaccine.tsx"),
  route("view-records", "routes/view-records.tsx"),
  route("settings", "routes/settings.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
