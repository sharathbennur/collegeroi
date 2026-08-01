// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { NetWorthChart } from '../components/NetWorthChart';
import { calculateROIProjections, type ScenarioInputs } from '../utils/roiProjections';

const sampleActiveInputs: ScenarioInputs = {
  collegeName: 'MIT',
  startingSalary: 85000,
  tuitionTotal: 80000,
  financialAidTotal: 20000,
  initialLoanBalance: 40000,
  interestRate: 6.5,
  loanTermYears: 10,
  monthlyExpenses: 1500,
  monthly401k: 500,
  taxRatePercent: 22
};

const sampleFormatCurrency = (val: number) => `$${val.toLocaleString()}`;

describe('roiProjections utility', () => {
  it('computes 10, 15, and 20 year projection points correctly', () => {
    const res10 = calculateROIProjections(sampleActiveInputs, [], 10);
    expect(res10.projections).toHaveLength(10);

    const res20 = calculateROIProjections(sampleActiveInputs, [], 20);
    expect(res20.projections).toHaveLength(20);
  });

  it('identifies break-even point when college salary outweighs tuition debt', () => {
    const res = calculateROIProjections(sampleActiveInputs, [], 15);
    expect(res.breakEven.isReached).toBe(true);
    expect(res.breakEven.year).toBeGreaterThanOrEqual(4);
  });
});

describe('NetWorthChart Component', () => {
  it('renders title, SVG chart, and legend chips', () => {
    render(
      <NetWorthChart
        activeInputs={sampleActiveInputs}
        comparedScenarios={[]}
        formatCurrency={sampleFormatCurrency}
      />
    );

    expect(screen.getByText('Cumulative Net Worth & ROI Trajectory')).toBeInTheDocument();
    expect(screen.getAllByText('MIT')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Workforce Baseline')[0]).toBeInTheDocument();
  });

  it('updates timeframe when timeframe buttons are clicked', () => {
    render(
      <NetWorthChart
        activeInputs={sampleActiveInputs}
        comparedScenarios={[]}
        formatCurrency={sampleFormatCurrency}
      />
    );

    const btn15 = screen.getAllByRole('button', { name: /15 Yrs/i })[0];
    fireEvent.click(btn15);

    expect(btn15).toHaveClass('active');
  });
});
