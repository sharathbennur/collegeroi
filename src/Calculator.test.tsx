// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import Calculator from './Calculator';
import { MemoryRouter } from 'react-router-dom';

describe('Calculator inputs', () => {
  afterEach(() => {
    cleanup();
  });

  it('allows typing into all inputs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    const college = screen.getByLabelText(/College Name/i) as HTMLInputElement;
    const tuition = screen.getByLabelText(/Tuition \(\$\)/i) as HTMLInputElement;
    const family = screen.getByLabelText(/Annual Family Contribution/i) as HTMLInputElement;
    const loan = screen.getByLabelText(/Loan Interest/i) as HTMLInputElement;
    const salary = screen.getByLabelText(/Expected Starting Salary/i) as HTMLInputElement;

    await user.clear(college);
    await user.clear(tuition);
    await user.clear(family);
    await user.clear(loan);
    await user.clear(salary);

    await user.type(college, 'Harvard University');
    await user.type(tuition, '80000');
    await user.type(family, '40000');
    await user.type(loan, '5.5');
    await user.type(salary, '60000');

    expect(college.value).toBe('Harvard University');
    expect(tuition.value).toBe('80000');
    expect(family.value).toBe('40000');
    expect(loan.value).toBe('5.5');
    expect(salary.value).toBe('60000');
  });

  it('validates that numeric inputs have type number', () => {
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    const tuition = screen.getByLabelText(/Tuition \(\$\)/i);
    const family = screen.getByLabelText(/Annual Family Contribution/i);
    const loan = screen.getByLabelText(/Loan Interest/i);
    const salary = screen.getByLabelText(/Expected Starting Salary/i);

    expect(tuition).toHaveAttribute('type', 'number');
    expect(family).toHaveAttribute('type', 'number');
    expect(loan).toHaveAttribute('type', 'number');
    expect(salary).toHaveAttribute('type', 'number');
  });

  it('renders a submit button', () => {
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows an error message when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Calculate Payment Table/i }));
    expect(screen.getByText(/Please fill in all fields with valid data/i)).toBeInTheDocument();
  });

  it('highlights invalid fields with error class when submitting empty form', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Calculate Payment Table/i }));

    const college = screen.getByLabelText(/College Name/i);
    const tuition = screen.getByLabelText(/Tuition \(\$\)/i);
    const family = screen.getByLabelText(/Annual Family Contribution/i);
    const loan = screen.getByLabelText(/Loan Interest/i);
    const salary = screen.getByLabelText(/Expected Starting Salary/i);

    expect(college).toHaveClass('error-input');
    expect(tuition).toHaveClass('error-input');
    expect(family).toHaveClass('error-input');
    expect(loan).toHaveClass('error-input');
    expect(salary).toHaveClass('error-input');
  });
});
