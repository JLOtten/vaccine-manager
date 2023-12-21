import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import FamilyMemberLog from './components/FamilyMemberLog';

const linkElement = screen.getByText((content, node) => {
  const hasText = (node) => node.textContent === 'Sign in';
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node.children).every(
    (child) => !hasText(child)
  );

  return nodeHasText && childrenDontHaveText;
});
{/*test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText('Sign in', {exact: true});
  expect(linkElement).toBeInTheDocument();
});
*/}

test('renders family member log page', () => {
  render(
  <Router> 
    <FamilyMemberLog />
  </Router>
  );
  const linkElement = screen.getByText(/Family Member Log/i);

  expect(linkElement).toBeInTheDocument();
});
