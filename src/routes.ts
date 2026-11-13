import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("work/:slug", "routes/work.tsx")] satisfies RouteConfig;
