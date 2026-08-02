// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
};

describe('ThemeContext System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark-theme');
  });

  afterEach(() => {
    cleanup();
  });

  it('provides default light theme and toggles to dark theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    const toggleBtn = screen.getByText('Toggle Theme');
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(localStorage.getItem('collegeroi_theme')).toBe('dark');
  });

  it('persists selected theme across renders', () => {
    localStorage.setItem('collegeroi_theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
