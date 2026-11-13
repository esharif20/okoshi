import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tools/**/*.test.ts"], environment: "node" },
});
