import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import FamilyMemberLog from "./components/FamilyMemberLog";
import { AuthProvider } from "./contexts/AuthContext";

// Mock the API module
jest.mock("./api", () => ({
  api: {
    getUser: jest.fn(),
    getFamilyMembers: jest.fn(() => Promise.resolve([])),
    getVaccines: jest.fn(() => Promise.resolve([])),
    getVaccineRecords: jest.fn(() => Promise.resolve([])),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

test("renders login page when not authenticated", async () => {
  // Mock getUser to fail (not authenticated)
  const { api } = require("./api");
  api.getUser.mockRejectedValueOnce(new Error("Unauthorized"));

  render(<App />);

  // Should redirect to login - look for username field or login button
  const loginElement = await screen.findByLabelText(/Username/i);
  expect(loginElement).toBeInTheDocument();
});

test("renders home page when authenticated", async () => {
  // Mock getUser to succeed (authenticated)
  const { api } = require("./api");
  api.getUser.mockResolvedValueOnce({
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
  const { api } = require("./api");
  api.getFamilyMembers.mockResolvedValueOnce([]);

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
