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

    // Costs section is open by default
    const college = screen.getByLabelText(/College Name/i);
    const tuition = screen.getByLabelText(/Tuition \(\$\)/i);
    const family = screen.getByLabelText(/Annual Family Contribution/i);

    await user.type(college, 'Harvard University');

    await user.click(tuition);
    const modalTuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(modalTuitionInputs[0], '80000');
    await user.click(screen.getByRole('button', { name: /Done/i }));

    await user.type(family, '40000');

    await user.click(screen.getByRole('button', { name: /Loans/i }));
    const loan = screen.getByLabelText(/Loan Interest/i);
    await user.type(loan, '5.5');

    await user.click(screen.getByRole('button', { name: /Payments/i }));
    const salary = screen.getByLabelText(/Expected Starting Salary/i);
    await user.type(salary, '60000');

    expect(salary).toHaveValue(60000);
  });

  it('validates that numeric inputs have type number', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    const tuition = screen.getByLabelText(/Tuition \(\$\)/i);
    const family = screen.getByLabelText(/Annual Family Contribution/i);
    expect(tuition).toHaveAttribute('type', 'number');
    expect(family).toHaveAttribute('type', 'number');

    await user.click(screen.getByRole('button', { name: /Loans/i }));
    expect(screen.getByLabelText(/Loan Interest/i)).toHaveAttribute('type', 'number');

    await user.click(screen.getByRole('button', { name: /Payments/i }));
    expect(screen.getByLabelText(/Expected Starting Salary/i)).toHaveAttribute('type', 'number');
  });

  it('renders a submit button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /Payments/i }));
    expect(screen.getByRole('button', { name: /Calculate Payment Table/i })).toBeInTheDocument();
  });

  it('shows an error message when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Payments/i }));
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

    await user.click(screen.getByRole('button', { name: /Payments/i }));
    await user.click(screen.getByRole('button', { name: /Calculate Payment Table/i }));

    const salary = screen.getByLabelText(/Expected Starting Salary/i);
    expect(salary).toHaveClass('error-input');

    await user.click(screen.getByRole('button', { name: /Costs/i }));
    expect(screen.getByLabelText(/College Name/i)).toHaveClass('error-input');
    expect(screen.getByLabelText(/Tuition \(\$\)/i)).toHaveClass('error-input');
    expect(screen.getByLabelText(/Annual Family Contribution/i)).toHaveClass('error-input');

    await user.click(screen.getByRole('button', { name: /Loans/i }));
    expect(screen.getByLabelText(/Loan Interest/i)).toHaveClass('error-input');
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

    // Open the modal
    await user.click(screen.getByRole('button', { name: /Auto-fill/i }));

    const select = screen.getByLabelText(/Top 20 Colleges/i);
    const collegeInput = screen.getByLabelText(/College Name/i);
    const tuitionInput = screen.getByLabelText(/4-Year Tuition \(\$\)/i);

    await user.selectOptions(select, 'Harvard University');

    expect(collegeInput).toHaveValue('Harvard University');
    // (59000 + 21000) * 4 = 320000
    expect(tuitionInput).toHaveValue(320000);

    await user.click(screen.getByRole('button', { name: /Payments/i }));
    const salaryInput = screen.getByLabelText(/Expected Starting Salary/i);
    expect(salaryInput).toHaveValue(91000);
  });

  it('calculates monthly payment correctly', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Set Tuition to 100,000 (25k * 4)
    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));
    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(tuitionInputs[0], '25000');
    await user.click(screen.getByText(/Copy to all/i));
    await user.click(screen.getByRole('button', { name: /Done/i }));

    // Set Family Contribution to 10,000 (40k total deduction)
    await user.type(screen.getByLabelText(/Annual Family Contribution/i), '10000');

    // Set Loan Details: 5% for 10 years. Principal = 100k - 40k = 60k
    await user.click(screen.getByRole('button', { name: /Loans/i }));
    await user.type(screen.getByLabelText(/Loan Interest/i), '5');
    await user.type(screen.getByLabelText(/Loan Term/i), '10');

    // Expected: $636 (approx 636.39 rounded down by Intl.NumberFormat with maxFractionDigits: 0)
    expect(screen.getByText('$636')).toBeInTheDocument();
  });

  it('calculates total cost of college correctly', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Set Tuition to 100,000 (25k * 4)
    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));
    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(tuitionInputs[0], '25000');
    await user.click(screen.getByText(/Copy to all/i));
    await user.click(screen.getByRole('button', { name: /Done/i }));

    // Set Family Contribution to 10,000 (40k total deduction)
    await user.type(screen.getByLabelText(/Annual Family Contribution/i), '10000');

    // Set Loan Details: 5% for 10 years. Principal = 100k - 40k = 60k
    await user.click(screen.getByRole('button', { name: /Loans/i }));
    await user.type(screen.getByLabelText(/Loan Interest/i), '5');
    await user.type(screen.getByLabelText(/Loan Term/i), '10');

    // Total Cost = Tuition (100k) + Total Interest (~16,367) = 116,367
    expect(screen.getByText('$116,367')).toBeInTheDocument();
  });

  it('navigates to next section when Next button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Costs section is open initially. Click Next to go to Loans.
    await user.click(screen.getByRole('button', { name: /Next/i }));
    
    // Check if Loans section is open (Loan Interest input should be visible)
    expect(screen.getByLabelText(/Loan Interest/i)).toBeInTheDocument();

    // Click Next in Loans section to go to Payments.
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Check if Payments section is open (Salary input should be visible)
    expect(screen.getByLabelText(/Expected Starting Salary/i)).toBeInTheDocument();
  });

  it('populates payment schedule table when Show Payment Schedule is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Set Tuition to 100,000 (25k * 4)
    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));
    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(tuitionInputs[0], '25000');
    await user.click(screen.getByText(/Copy to all/i));
    await user.click(screen.getByRole('button', { name: /Done/i }));

    // Set Family Contribution to 10,000 (40k total deduction)
    await user.type(screen.getByLabelText(/Annual Family Contribution/i), '10000');

    // Navigate to Loans section
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Set Loan Details: 5% for 10 years. Principal = 100k - 40k = 60k
    await user.type(screen.getByLabelText(/Loan Interest/i), '5');
    await user.type(screen.getByLabelText(/Loan Term/i), '10');

    // Click Show Payment Schedule
    await user.click(screen.getByRole('button', { name: /Show Payment Schedule/i }));

    // Verify table headers exist
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getByText('Interest')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();

    // Verify first row values for Month 1
    // Interest: 60000 * 0.05 / 12 = 250
    expect(screen.getByText('$250')).toBeInTheDocument();
    // Principal: 636 - 250 = 386
    expect(screen.getByText('$386')).toBeInTheDocument();
    // Balance: 60000 - 386 = 59614
    expect(screen.getByText('$59,614')).toBeInTheDocument();
  });
});
