import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    // Render the App component
    render(<App />);

    // Just check that the main container exists (from React Router)
    // Or we can check for a specific header element.
    const headerElement = screen.getByRole('banner'); // The <header> tag in layout
    expect(headerElement).toBeInTheDocument();
  });
});
