import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import FamilyMemberLog from "./components/FamilyMemberLog";

test("renders home page", async () => {
  render(<App />);
  // Wait for lazy loaded component to render
  const homeElement = await screen.findByText(
    /Welcome to your vaccine manager/i,
  );
  expect(homeElement).toBeInTheDocument();
});

test("renders family member log page", () => {
  render(
    <Router>
      <FamilyMemberLog />
    </Router>,
  );

  const logElement = screen.getByText(/Family Member Log/i);
  expect(logElement).toBeInTheDocument();
});
