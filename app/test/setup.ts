import "@testing-library/jest-dom";
import { beforeEach, afterEach, vi } from "vitest";

// Mock crypto.randomUUID for consistent test IDs
let mockUuidCounter = 0;
beforeEach(() => {
  mockUuidCounter = 0;
  if (typeof crypto === "undefined") {
    (global as any).crypto = {};
  }
  crypto.randomUUID = vi.fn(() => `test-uuid-${++mockUuidCounter}`) as any;
});

// Setup localStorage mock
const localStorageMock: Storage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Setup global mocks
beforeEach(() => {
  Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(global, "window", {
    value: { localStorage: localStorageMock },
    writable: true,
  });

  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
