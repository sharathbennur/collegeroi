// @vitest-environment jsdom
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach, vi } from 'vitest';
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
    const salary = screen.getByLabelText(/Expected Annual Starting Salary/i);
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
    expect(screen.getByLabelText(/Expected Annual Starting Salary/i)).toHaveAttribute('type', 'number');
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

    const salary = screen.getByLabelText(/Expected Annual Starting Salary/i);
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

  it('populates form fields when a college is selected from auto-complete', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    const collegeInput = screen.getByLabelText(/College Name/i);
    
    // Type to trigger suggestions
    await user.type(collegeInput, 'Harvard');
    
    // Click suggestion
    await user.click(screen.getByText('Harvard University'));

    const tuitionInput = screen.getByLabelText(/4-Year Tuition \(\$\)/i);

    expect(collegeInput).toHaveValue('Harvard University');
    // Year 1: 80,000
    // Year 2: 82,400 (3% inflation)
    // Year 3: 84,872
    // Year 4: 87,418
    // Total: 334,690
    expect(tuitionInput).toHaveValue(334690);

    await user.click(screen.getByRole('button', { name: /Payments/i }));
    const salaryInput = screen.getByLabelText(/Expected Annual Starting Salary/i);
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
    expect(screen.getByLabelText(/Expected Annual Starting Salary/i)).toBeInTheDocument();
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

    // Verify table headers exist within the schedule table
    const scheduleTable = screen.getByText('Year / Month').closest('table');
    expect(scheduleTable).toBeInTheDocument();
    
    const tableScope = within(scheduleTable as HTMLElement);

    expect(tableScope.getByText('Payment')).toBeInTheDocument();
    expect(tableScope.getByText('Principal')).toBeInTheDocument();
    expect(tableScope.getByText('Interest')).toBeInTheDocument();
    expect(tableScope.getByText('Balance')).toBeInTheDocument();

    // Expand Year 1 to see monthly details
    await user.click(screen.getByText(/Year 1$/i));

    // Verify first row values for Month 1 (now visible)
    // Interest: 60000 * 0.05 / 12 = 250
    expect(tableScope.getByText('$250')).toBeInTheDocument();
    // Principal: 636 - 250 = 386
    expect(tableScope.getByText('$386')).toBeInTheDocument();
    // Balance: 60000 - 386 = 59614
    expect(tableScope.getByText('$59,614')).toBeInTheDocument();
  });

  it('triggers a confirmation dialog when Clear Saved Data is clicked', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    const clearButton = screen.getByRole('button', { name: /Clear Saved Data/i });
    await user.click(clearButton);

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('Are you sure'));
    confirmSpy.mockRestore();
  });

  it('saves state to localStorage when Save button is clicked', async () => {
    const user = userEvent.setup();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    const collegeInput = screen.getByLabelText(/College Name/i);
    await user.type(collegeInput, 'Test University');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(setItemSpy).toHaveBeenCalledWith(
      'collegeRoiCalcState',
      expect.stringContaining('"collegeName":"Test University"')
    );

    setItemSpy.mockRestore();
  });

  it('loads state from localStorage on mount', () => {
    const savedState = {
      formData: {
        collegeName: 'Saved University',
        tuition: '50000',
        familyContribution: '10000',
        loanInterest: '4.5',
        loanTerm: '10',
        salary: '70000'
      },
      sections: { costs: true, loans: true, payments: false }
    };

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(savedState));

    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/College Name/i)).toHaveValue('Saved University');
    expect(screen.getByLabelText(/Loan Interest/i)).toHaveValue(4.5);

    getItemSpy.mockRestore();
  });

  it('calculates total expenses correctly from modal inputs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Navigate to Payments section
    await user.click(screen.getByRole('button', { name: /Payments/i }));

    // Open Expenses modal
    await user.click(screen.getByLabelText(/Expenses \(\$\)/i));

    // Fill in expenses
    const rent = screen.getByLabelText(/Rent/i);
    await user.clear(rent);
    await user.type(rent, '1500');
    const groceries = screen.getByLabelText(/Groceries/i);
    await user.clear(groceries);
    await user.type(groceries, '400');
    const eatingOut = screen.getByLabelText(/Eating out/i);
    await user.clear(eatingOut);
    await user.type(eatingOut, '200');
    const utilities = screen.getByLabelText(/Utilities/i);
    await user.clear(utilities);
    await user.type(utilities, '150');
    const transportation = screen.getByLabelText(/Transportation/i);
    await user.clear(transportation);
    await user.type(transportation, '300');
    const healthCare = screen.getByLabelText(/HealthCare/i);
    await user.clear(healthCare);
    await user.type(healthCare, '100');
    const miscellaneous = screen.getByLabelText(/Miscellaneous/i);
    await user.clear(miscellaneous);
    await user.type(miscellaneous, '100');
    const contribution401k = screen.getByLabelText(/401k Contribution/i);
    await user.clear(contribution401k);
    await user.type(contribution401k, '500');

    await user.click(screen.getByRole('button', { name: /Done/i }));

    // Total: 1500 + 400 + 200 + 150 + 300 + 100 + 100 + 500 = 3250
    expect(screen.getByLabelText(/Expenses \(\$\)/i)).toHaveValue(3250);
  });

  it('calculates take-home pay correctly from tax modal inputs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Navigate to Payments section
    await user.click(screen.getByRole('button', { name: /Payments/i }));

    // Set Salary
    const salaryInput = screen.getByLabelText(/Expected Annual Starting Salary/i);
    await user.type(salaryInput, '120000'); // 10k monthly

    // Open Tax modal
    await user.click(screen.getByLabelText(/Takehome after taxes/i));

    // Verify default calculation (Federal ~15.3 + State 5.0 + Medicare 1.45 + SS 6.2 + City 0.0 = ~27.95%)
    // 10000 * 0.2795 = 2795 tax. Takehome = 7205.
    expect(screen.getByText('$2,795')).toBeInTheDocument();
    expect(screen.getAllByText('$7,205')[0]).toBeInTheDocument();

    // Change rates
    const state = screen.getByLabelText(/State Tax/i);
    await user.clear(state);
    await user.type(state, '6.0');

    // New Total: 15.3 + 6.0 + 1.45 + 6.2 + 0.0 = 28.95%
    // 10000 * 0.2895 = 2895 tax. Takehome = 7105.
    expect(screen.getByText('$2,895')).toBeInTheDocument();
    expect(screen.getAllByText('$7,105')[0]).toBeInTheDocument();

    // Change Federal
    const federal = screen.getByLabelText(/Federal Tax/i);
    await user.clear(federal);
    await user.type(federal, '10.0');
    // Total: 10.0 + 6.0 + 1.45 + 6.2 + 0.0 = 23.65%
    // 10000 * 0.2365 = 2365. Takehome = 7635.
    expect(screen.getByText('$2,365')).toBeInTheDocument();
    expect(screen.getAllByText('$7,635')[0]).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Done/i }));

    expect(screen.getByLabelText(/Takehome after taxes/i)).toHaveValue(7635);
  });

  it('verifies tax breakdown values sum up to the total monthly tax', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Navigate to Payments section
    await user.click(screen.getByRole('button', { name: /Payments/i }));

    // Set Salary to 120,000 (10,000 monthly)
    const salaryInput = screen.getByLabelText(/Expected Annual Starting Salary/i);
    await user.type(salaryInput, '120000');

    // Open Tax modal
    await user.click(screen.getByLabelText(/Takehome after taxes/i));

    // Set City Tax to 1.5% to ensure all values are non-zero and avoid trailing zero ambiguity
    const cityInput = screen.getByLabelText(/City\/County Tax/i);
    await user.clear(cityInput);
    await user.type(cityInput, '1.5');

    // Verify breakdown values
    // Federal: ~15.3% -> $1,530
    expect(screen.getByText(/Federal \(15.3%\)/)).toBeInTheDocument();
    expect(screen.getByText('$1,530')).toBeInTheDocument();

    // State: 5.0% -> $500
    expect(screen.getByText(/State \(5.0%\)/)).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();

    // City: 1.5% -> $150
    expect(screen.getByText(/City\/County \(1.5%\)/)).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();

    // Social Security: 6.2% -> $620
    expect(screen.getByText(/Social Security \(6.2%\)/)).toBeInTheDocument();
    expect(screen.getByText('$620')).toBeInTheDocument();

    // Medicare: 1.45% -> $145
    expect(screen.getByText(/Medicare \(1.45%\)/)).toBeInTheDocument();
    expect(screen.getByText('$145')).toBeInTheDocument();

    // Total Monthly Tax: 1530 + 500 + 150 + 620 + 145 = 2945
    expect(screen.getByText('$2,945')).toBeInTheDocument();
  });

  it('calculates net monthly cash flow correctly', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // 1. Set up Loan ($60k, 5%, 10yr -> ~$636/mo)
    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));
    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(tuitionInputs[0], '25000');
    await user.click(screen.getByText(/Copy to all/i));
    await user.click(screen.getByRole('button', { name: /Done/i }));

    await user.type(screen.getByLabelText(/Annual Family Contribution/i), '10000');

    await user.click(screen.getByRole('button', { name: /Loans/i }));
    await user.type(screen.getByLabelText(/Loan Interest/i), '5');
    await user.type(screen.getByLabelText(/Loan Term/i), '10');

    // 2. Set up Income ($60k/yr -> $5k/mo)
    await user.click(screen.getByRole('button', { name: /Payments/i }));
    await user.type(screen.getByLabelText(/Expected Annual Starting Salary/i), '60000');

    // 3. Set up Expenses ($1000/mo)
    await user.click(screen.getByLabelText(/Monthly Expenses \(\$\)/i));
    await user.click(screen.getByRole('button', { name: /Clear All/i }));
    await user.type(screen.getByLabelText(/Rent/i), '1000');
    await user.click(screen.getByRole('button', { name: /Done/i }));

    // 4. Verify Net Cash Flow
    // Take-home: $3,767.50 (based on default 24.65% tax on $5k) - Expenses: $1,000 - Loan: ~$636.39 = ~$2,131.11
    expect(screen.getByText('$2,131')).toBeInTheDocument();
  });

  it('verifies ledger table structure and values', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // 1. Set up Loan ($60k, 5%, 10yr -> ~$636/mo)
    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));
    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(tuitionInputs[0], '25000');
    await user.click(screen.getByText(/Copy to all/i));
    await user.click(screen.getByRole('button', { name: /Done/i }));

    await user.type(screen.getByLabelText(/Annual Family Contribution/i), '10000');

    await user.click(screen.getByRole('button', { name: /Loans/i }));
    await user.type(screen.getByLabelText(/Loan Interest/i), '5');
    await user.type(screen.getByLabelText(/Loan Term/i), '10');

    // 2. Set up Income ($60k/yr -> $5k/mo)
    await user.click(screen.getByRole('button', { name: /Payments/i }));
    await user.type(screen.getByLabelText(/Expected Annual Starting Salary/i), '60000');

    // 3. Set up Expenses ($1000/mo)
    await user.click(screen.getByLabelText(/Monthly Expenses \(\$\)/i));
    await user.click(screen.getByRole('button', { name: /Clear All/i }));
    await user.type(screen.getByLabelText(/Rent/i), '1000');
    await user.click(screen.getByRole('button', { name: /Done/i }));

    // 4. Verify Ledger Table Headers
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getAllByText('Balance')[0]).toBeInTheDocument();

    // 5. Verify Ledger Rows
    // Row 1: Salary ($5,000)
    expect(screen.getByText('Monthly Salary')).toBeInTheDocument();
    expect(screen.getAllByText('$5,000').length).toBeGreaterThanOrEqual(2); // Amount and Balance

    // Row 2: Taxes (Default ~24.65% of 5000 = 1232.5 -> 1233)
    expect(screen.getByText('Monthly Taxes')).toBeInTheDocument();
    expect(screen.getByText('-$1,233')).toBeInTheDocument();
    expect(screen.getByText('$3,768')).toBeInTheDocument(); // 5000 - 1232.5 = 3767.5

    // Row 3: Loan Payment (~636)
    expect(screen.getByText('Loan Payment')).toBeInTheDocument();
    expect(screen.getByText('-$636')).toBeInTheDocument();
    expect(screen.getByText('$3,131')).toBeInTheDocument(); // 3767.5 - 636.39 = 3131.11

    // Row 4: Expenses (1000)
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    expect(screen.getByText('-$1,000')).toBeInTheDocument();
    expect(screen.getAllByText('$2,131').length).toBeGreaterThanOrEqual(1); // 3131.11 - 1000 = 2131.11
  });

  it('calculates 10-year savings projection correctly', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // 1. Set up Loan ($60k, 5%, 10yr -> ~$636/mo)
    await user.click(screen.getByLabelText(/4-Year Tuition \(\$\)/i));
    const tuitionInputs = screen.getAllByLabelText(/Tuition \+ Other/i);
    await user.type(tuitionInputs[0], '25000');
    await user.click(screen.getByText(/Copy to all/i));
    await user.click(screen.getByRole('button', { name: /Done/i }));

    await user.type(screen.getByLabelText(/Annual Family Contribution/i), '10000');

    await user.click(screen.getByRole('button', { name: /Loans/i }));
    await user.type(screen.getByLabelText(/Loan Interest/i), '5');
    await user.type(screen.getByLabelText(/Loan Term/i), '10');

    // 2. Set up Income ($60k/yr -> $5k/mo)
    await user.click(screen.getByRole('button', { name: /Payments/i }));
    await user.type(screen.getByLabelText(/Expected Annual Starting Salary/i), '60000');

    // 3. Set up Expenses (Rent 1000, 401k 500 -> Total 1500)
    await user.click(screen.getByLabelText(/Monthly Expenses \(\$\)/i));
    await user.click(screen.getByRole('button', { name: /Clear All/i }));
    await user.type(screen.getByLabelText(/Rent/i), '1000');
    await user.type(screen.getByLabelText(/401k Contribution/i), '500');
    await user.click(screen.getByRole('button', { name: /Done/i }));

    // 4. Verify 10-Year Projections
    // 401k: 500 * 12 * 10 = 60,000
    const contributionHeader = screen.getByText('Total 401k Contribution');
    expect(contributionHeader.closest('.result-item')).toHaveTextContent('$60,000');

    // Net Flow: (3767.50 - 1500 - 636.39) * 120 = 1631.11 * 120 = 195,733.2
    expect(screen.getByText('Accumulated Net Cash Flow')).toBeInTheDocument();
    expect(screen.getByText('$195,733')).toBeInTheDocument();

    // Total: 60,000 + 195,733.2 = 255,733.2
    expect(screen.getByText('Total Projected Savings')).toBeInTheDocument();
    expect(screen.getByText('$255,733')).toBeInTheDocument();
  });

  it('displays the disclaimer footer', () => {
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    expect(screen.getByText(/Disclaimer:/i)).toBeInTheDocument();
    expect(screen.getByText(/The financial projections, college costs, and tax estimates provided by this tool are calculations based on user inputs and assumptions/i)).toBeInTheDocument();
  });

  it('toggles side columns visibility when toggle buttons are clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    // Initial state: both columns visible
    expect(screen.getByRole('heading', { name: 'Inputs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Guidance' })).toBeInTheDocument();

    // Toggle Left Column
    const leftToggle = screen.getByTitle('Collapse Inputs');
    await user.click(leftToggle);

    expect(screen.queryByRole('heading', { name: 'Inputs' })).not.toBeInTheDocument();
    expect(leftToggle).toHaveAttribute('title', 'Expand Inputs');

    await user.click(leftToggle);
    expect(screen.getByRole('heading', { name: 'Inputs' })).toBeInTheDocument();

    // Toggle Right Column
    const rightToggle = screen.getByTitle('Collapse Guidance');
    await user.click(rightToggle);

    expect(screen.queryByRole('heading', { name: 'Guidance' })).not.toBeInTheDocument();
    expect(rightToggle).toHaveAttribute('title', 'Expand Guidance');

    await user.click(rightToggle);
    expect(screen.getByRole('heading', { name: 'Guidance' })).toBeInTheDocument();
  });

  it('toggles instructions visibility', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    expect(screen.getByText(/Why use CollegeROI/i)).toBeInTheDocument();

    const hideButton = screen.getByLabelText('Hide Instructions');
    await user.click(hideButton);

    expect(screen.queryByText(/Why use CollegeROI/i)).not.toBeInTheDocument();
    
    const showButton = screen.getByRole('button', { name: /Show Instructions/i });
    await user.click(showButton);

    expect(screen.getByText(/Why use CollegeROI/i)).toBeInTheDocument();
  });

  it('calculates total financial aid correctly from the new financial aid modal', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

    await user.click(screen.getByLabelText(/4-Year Financial Aid \(\$\)/i));

    const aidInputs = screen.getAllByLabelText(/Financial Aid \(\$\)/i);
    await user.type(aidInputs[0], '5000');
    await user.click(screen.getByText(/Copy to all/i));
    
    await user.click(screen.getByRole('button', { name: /Done/i }));

    expect(screen.getByLabelText(/4-Year Financial Aid \(\$\)/i)).toHaveValue(20000);
  });
});
