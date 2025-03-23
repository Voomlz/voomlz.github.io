/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
  },
  test: {
    exclude: ["**/*.spec.ts"],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});
