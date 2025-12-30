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
    await user.clear(family);
    await user.clear(loan);
    await user.clear(salary);

    await user.type(college, 'Harvard University');

    await user.click(tuition);
    const modalTuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(modalTuitionInputs[0], '80000');
    await user.click(screen.getByRole('button', { name: /Done/i }));

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

  it('calculates total tuition correctly from modal inputs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));

    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    const roomBoardInputs = screen.getAllByLabelText(/Room \+ Board/i);

    await user.type(tuitionInputs[0], '10000');
    await user.type(roomBoardInputs[0], '5000');
    await user.type(tuitionInputs[1], '12000');
    await user.type(roomBoardInputs[1], '6000');

    await user.click(screen.getByRole('button', { name: /Done/i }));

    expect(screen.getByLabelText(/4-Year Tuition \(\$\)/i)).toHaveValue(33000);
  });

  it('copies Year 1 values to all other years when "Copy to all" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));

    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    const roomBoardInputs = screen.getAllByLabelText(/Room \+ Board/i);

    await user.type(tuitionInputs[0], '20000');
    await user.type(roomBoardInputs[0], '10000');

    await user.click(screen.getByText(/Copy to all/i));

    expect(tuitionInputs[1]).toHaveValue(20000);
    expect(roomBoardInputs[1]).toHaveValue(10000);
    expect(tuitionInputs[3]).toHaveValue(20000);
    expect(roomBoardInputs[3]).toHaveValue(10000);
  });

  it('applies inflation rate correctly when copying values', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));

    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    const inflationInput = screen.getByPlaceholderText(/Inflation/i);

    await user.type(tuitionInputs[0], '10000');
    await user.type(inflationInput, '5');

    await user.click(screen.getByText(/Copy to all/i));

    expect(tuitionInputs[1]).toHaveValue(10500); // Year 2: 10000 * 1.05
    expect(tuitionInputs[2]).toHaveValue(11025); // Year 3: 10000 * 1.05^2
    expect(tuitionInputs[3]).toHaveValue(11576); // Year 4: 10000 * 1.05^3 (rounded)
  });

  it('populates form fields when a college is selected from the dropdown', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    const select = screen.getByLabelText(/Auto-fill from Top 20 Colleges/i);
    const collegeInput = screen.getByLabelText(/College Name/i);
    const tuitionInput = screen.getByLabelText(/4-Year Tuition \(\$\)/i);
    const salaryInput = screen.getByLabelText(/Expected Starting Salary/i);

    await user.selectOptions(select, 'Harvard University');

    expect(collegeInput).toHaveValue('Harvard University');
    // (59000 + 21000) * 4 = 320000
    expect(tuitionInput).toHaveValue(320000);
    expect(salaryInput).toHaveValue(91000);
  });
});
