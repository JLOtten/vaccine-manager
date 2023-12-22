import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import FamilyMemberLog from './components/FamilyMemberLog';

test('renders home page', () => {
  render(
    <App />
  );
  const homeElement = screen.getByText(/Welcome to your vaccine manager/i);
  expect(homeElement).toBeInTheDocument();
})


test('renders family member log page', () => {
  render(
    <Router>
      <FamilyMemberLog />
    </Router>
  );


  const logElement = screen.getByText(/Family Member Log/i);

  expect(logElement).toBeInTheDocument();
});
