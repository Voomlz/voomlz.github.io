/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const ReactCompilerConfig = {};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          //
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ],
      },
    }),
  ],
  build: { rollupOptions: { output: { manualChunks: splitVendorChunk } } },
  server: {
    port: 8080,
  },
  test: {
    include: ["**/*.test.ts"],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});

function splitVendorChunk(id: string) {
  if (id.includes("node_modules")) {
    return "vendor";
  }

  return null;
}
