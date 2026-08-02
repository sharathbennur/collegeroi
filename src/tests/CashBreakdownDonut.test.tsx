// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { CashBreakdownDonut, type CashBreakdownInputs } from '../components/CashBreakdownDonut';

const sampleInputs: CashBreakdownInputs = {
  grossMonthlyIncome: 5000,
  monthlyTaxes: 1000,
  monthlyExpenses: 1200,
  monthlyHousingRent: 1200,
  monthlyLoanPayment: 400,
  monthly401k: 300
};

const sampleFormatCurrency = (val: number) => `$${val.toLocaleString()}`;

describe('CashBreakdownDonut Component', () => {
  it('renders donut SVG, center gross text, and segment labels', () => {
    render(
      <CashBreakdownDonut
        inputs={sampleInputs}
        formatCurrency={sampleFormatCurrency}
      />
    );

    expect(screen.getByText('Gross Monthly')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getAllByText('Taxes (Federal/State/FICA)')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Rent & Living Expenses')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Student Loan Payment')[0]).toBeInTheDocument();
  });

  it('triggers housing over-leveraged alert when rent > 30% of income', () => {
    const highRentInputs: CashBreakdownInputs = {
      ...sampleInputs,
      monthlyHousingRent: 2000 // 2000 / 5000 = 40% > 30%
    };

    render(
      <CashBreakdownDonut
        inputs={highRentInputs}
        formatCurrency={sampleFormatCurrency}
      />
    );

    expect(screen.getByText(/Housing Over-Leveraged/i)).toBeInTheDocument();
    expect(screen.getAllByText(/40.0%/i)[0]).toBeInTheDocument();
  });

  it('triggers debt over-leveraged alert when loan payment > 30% of income', () => {
    const highDebtInputs: CashBreakdownInputs = {
      ...sampleInputs,
      monthlyLoanPayment: 1800 // 1800 / 5000 = 36% > 30%
    };

    render(
      <CashBreakdownDonut
        inputs={highDebtInputs}
        formatCurrency={sampleFormatCurrency}
      />
    );

    expect(screen.getByText(/Student Debt Over-Leveraged/i)).toBeInTheDocument();
    expect(screen.getAllByText(/36.0%/i)[0]).toBeInTheDocument();
  });

  it('updates center text on legend item hover', () => {
    render(
      <CashBreakdownDonut
        inputs={sampleInputs}
        formatCurrency={sampleFormatCurrency}
      />
    );

    const taxLegendItem = screen.getAllByText('Taxes (Federal/State/FICA)')[0];
    fireEvent.mouseEnter(taxLegendItem);

    expect(screen.getByText('20.0% of Income')).toBeInTheDocument();
  });
});
