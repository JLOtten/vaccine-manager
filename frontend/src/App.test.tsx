import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import FamilyMemberLog from './components/FamilyMemberLog';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText('Sign in', {exact: true});
  expect(linkElement).toBeInTheDocument();
});

test('renders family member log page', () => {
  render(<FamilyMemberLog />);
  const linkElement = screen.getByText(/Family Member Log/i);

  expect(linkElement).toBeInTheDocument();
});
