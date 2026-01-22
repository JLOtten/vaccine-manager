import type { LinksFunction } from "@remix-run/node";
import Home from "~/components/Home";
import homeStyles from "~/styles/home.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: homeStyles },
];

export default Home;
