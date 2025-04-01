import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});
