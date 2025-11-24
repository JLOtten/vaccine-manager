import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import FamilyMemberLog from "./components/FamilyMemberLog";
import { AuthProvider } from "./contexts/AuthContext";
import * as apiModule from "./api";

// Mock the API module
vi.mock("./api", () => {
  const mockApi = {
    getUser: vi.fn(),
    getFamilyMembers: vi.fn(() => Promise.resolve([])),
    getVaccines: vi.fn(() => Promise.resolve([])),
    getVaccineRecords: vi.fn(() => Promise.resolve([])),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };
  return {
    api: mockApi,
  };
});

// Mock fetch globally
global.fetch = vi.fn();

test("renders login page when not authenticated", async () => {
  // Mock getUser to fail (not authenticated)
  vi.mocked(apiModule.api.getUser).mockRejectedValueOnce(
    new Error("Unauthorized"),
  );

  render(<App />);

  // Should redirect to login - look for username field or login button
  const loginElement = await screen.findByLabelText(/Username/i);
  expect(loginElement).toBeInTheDocument();
});

test("renders home page when authenticated", async () => {
  // Mock getUser to succeed (authenticated)
  vi.mocked(apiModule.api.getUser).mockResolvedValueOnce({
    id: "123",
    username: "testuser",
    name: "Test User",
  });

  render(<App />);

  // Wait for lazy loaded component to render
  const homeElement = await screen.findByText(
    /Welcome to your vaccine manager/i,
  );
  expect(homeElement).toBeInTheDocument();
});

test("renders family member log page", async () => {
  vi.mocked(apiModule.api.getFamilyMembers).mockResolvedValueOnce([]);

  render(
    <AuthProvider>
      <Router>
        <FamilyMemberLog />
      </Router>
    </AuthProvider>,
  );

  const logElement = await screen.findByText(/Family Member Log/i);
  expect(logElement).toBeInTheDocument();
});
