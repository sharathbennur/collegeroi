// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { BrowserRouter } from 'react-router-dom';
import Calculator from '../Calculator';
import { ThemeProvider } from '../context/ThemeContext';
import { MAJOR_BENCHMARKS, LOCATION_MULTIPLIERS, SALARY_BENCHMARK_SOURCES } from '../data/salaryBenchmarks';

const renderCalculator = () => {
  return render(
    <ThemeProvider>
      <BrowserRouter>
        <Calculator />
      </BrowserRouter>
    </ThemeProvider>
  );
};

const ensureRoiSectionOpen = () => {
  if (!document.getElementById('majorPreset')) {
    const roiToggle = document.querySelectorAll('.section-toggle')[2];
    if (roiToggle) fireEvent.click(roiToggle);
  }
};

describe('Major & Salary Benchmark Auto-Fill Component', () => {
  it('contains valid salary benchmarks and citation sources data', () => {
    expect(MAJOR_BENCHMARKS.length).toBeGreaterThan(5);
    expect(LOCATION_MULTIPLIERS.length).toBeGreaterThan(5);
    expect(SALARY_BENCHMARK_SOURCES.length).toBeGreaterThan(2);

    const csBenchmark = MAJOR_BENCHMARKS.find((m) => m.id === 'cs');
    expect(csBenchmark).toBeDefined();
    expect(csBenchmark?.baseSalary).toEqual(82000);

    const caMultiplier = LOCATION_MULTIPLIERS.find((l) => l.id === 'ca');
    expect(caMultiplier).toBeDefined();
    expect(caMultiplier?.multiplier).toEqual(1.25);
  });

  it('renders major & location benchmark dropdowns in ROI section', () => {
    renderCalculator();
    ensureRoiSectionOpen();

    const majorSelect = screen.getByLabelText(/Field of Study \/ Major/i);
    expect(majorSelect).toBeInTheDocument();

    const locationSelect = screen.getByLabelText(/Work Location \/ State/i);
    expect(locationSelect).toBeInTheDocument();
  });

  it('auto-fills starting salary when selecting a major and location', () => {
    renderCalculator();
    ensureRoiSectionOpen();

    const majorSelect = screen.getByLabelText(/Field of Study \/ Major/i) as HTMLSelectElement;
    const salaryInput = screen.getByLabelText(/Expected Annual Starting Salary/i) as HTMLInputElement;

    // Select Computer Science
    fireEvent.change(majorSelect, { target: { value: 'cs' } });
    expect(salaryInput.value).toBe('82000');

    // Select California location multiplier (1.25x of $82,000 = $102,500)
    const locationSelect = screen.getByLabelText(/Work Location \/ State/i) as HTMLSelectElement;
    fireEvent.change(locationSelect, { target: { value: 'ca' } });
    expect(salaryInput.value).toBe('102500');
  });

  it('opens and closes the salary benchmark data sources modal via info button', () => {
    renderCalculator();
    ensureRoiSectionOpen();

    const infoButton = screen.getByRole('button', { name: /View Salary Data Sources/i });
    expect(infoButton).toBeInTheDocument();

    // Click info button to open sources modal
    fireEvent.click(infoButton);

    expect(screen.getByText(/Salary & Cost-of-Living Data Sources/i)).toBeInTheDocument();
    expect(screen.getByText(/U.S. Bureau of Labor Statistics \(BLS\)/i)).toBeInTheDocument();

    // Click close button inside modal
    const closeButtons = screen.getAllByRole('button', { name: /Close/i });
    fireEvent.click(closeButtons[0]);

    expect(screen.queryByText(/Salary & Cost-of-Living Data Sources/i)).not.toBeInTheDocument();
  });
});
