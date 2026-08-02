// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';
import { ThemeProvider } from '../context/ThemeContext';

// Mock the image import
vi.mock('./assets/collegeroi-screenshot.png', () => ({
  default: '/assets/collegeroi-screenshot.png',
}));

describe('Home Page', () => {
  it('renders the welcome message and branding', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    );

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings[0]).toHaveTextContent(/Welcome to CollegeROI/i);
    expect(screen.getAllByText(/Empowering Students, Parents & Guardians/i)[0]).toBeInTheDocument();
  });

  it('renders the feature sections for Students and Guardians', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getAllByRole('heading', { name: /For Students/i })[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Is college worth it\?/i)[0]).toBeInTheDocument();

    expect(screen.getAllByRole('heading', { name: /For Guardians/i })[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Is your college investment worth it\?/i)[0]).toBeInTheDocument();
  });

  it('renders the Enter button and it is clickable', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    );

    const enterButton = screen.getAllByRole('button', { name: /Enter the application/i })[0];
    expect(enterButton).toBeInTheDocument();

    await user.click(enterButton);
    expect(enterButton).toBeInTheDocument();
  });

  it('sets the document title on mount', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    );
    expect(document.title).toBe('CollegeROI - Home');
  });

  it('renders the disclaimer footer', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    );
    expect(screen.getAllByText(/Disclaimer:/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/The financial projections, college costs, and tax estimates/i)[0]).toBeInTheDocument();
  });

  it('renders the hero image', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    );
    const images = screen.getAllByAltText('CollegeROI Calculator Dashboard');
    expect(images[0]).toBeInTheDocument();
    expect(images[0]).toHaveAttribute('src', '/src/assets/collegeroi-screenshot.png');
  });

  it('toggles theme mode when clicking theme button', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    );

    const themeToggleBtn = screen.getAllByRole('button', { name: /Toggle Theme/i })[0];
    expect(themeToggleBtn).toBeInTheDocument();

    await user.click(themeToggleBtn);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});