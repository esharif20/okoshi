import type { Config } from "@react-router/dev/config";
import { projects } from "./src/content";

// BASE_PATH is the one setting that changes when the site moves to its own domain ("/").
const base = process.env.BASE_PATH ?? "/";

export default {
  appDirectory: "src",
  basename: base,
  ssr: false,
  prerender: () => ["/", ...projects.map((p) => `/work/${p.slug}`)],
} satisfies Config;
