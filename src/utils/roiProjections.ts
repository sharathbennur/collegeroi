export interface ScenarioInputs {
  collegeName: string;
  startingSalary: number;
  salaryGrowthRate?: number; // default 0.03 (3%)
  tuitionTotal: number; // 4-year total cost
  financialAidTotal: number; // 4-year total aid
  initialLoanBalance: number;
  interestRate: number; // e.g. 6.5
  loanTermYears: number; // e.g. 10
  monthlyExpenses: number;
  monthly401k: number;
  taxRatePercent: number; // total tax rate percentage e.g. 22%
}

export interface ProjectionYearData {
  year: number;
  activeCollege: {
    cumulativeNetWorth: number;
    cashBalance: number;
    accumulated401k: number;
    remainingDebt: number;
    annualNetCashFlow: number;
  };
  workforceBaseline: {
    cumulativeNetWorth: number;
    cashBalance: number;
    accumulated401k: number;
    annualNetCashFlow: number;
  };
  comparedColleges: Array<{
    id: string;
    name: string;
    cumulativeNetWorth: number;
    cashBalance: number;
    accumulated401k: number;
    remainingDebt: number;
  }>;
}

export interface BreakEvenInfo {
  year: number | null;
  isReached: boolean;
  netWorthDifferenceAtEnd: number;
}

/**
 * Computes 1..totalYears projection series comparing active college, compared colleges, and workforce baseline.
 */
export function calculateROIProjections(
  activeInputs: ScenarioInputs,
  comparedScenarios: Array<{ id: string; name: string; inputs: ScenarioInputs }> = [],
  totalYears: number = 20,
  baselineStartingSalary: number = 35000
): { projections: ProjectionYearData[]; breakEven: BreakEvenInfo } {
  const salaryGrowth = activeInputs.salaryGrowthRate ?? 0.03;
  const investmentReturn = 0.06; // 6% annual 401k compound growth

  // Helper to compute trajectory for a college scenario
  const computeCollegeTrajectory = (inputs: ScenarioInputs) => {
    const years: Array<{
      year: number;
      cumulativeNetWorth: number;
      cashBalance: number;
      accumulated401k: number;
      remainingDebt: number;
      annualNetCashFlow: number;
    }> = [];

    let cashAcc = 0;
    let k401Acc = 0;
    let debt = inputs.initialLoanBalance;
    const netTuitionPerYear = Math.max(0, (inputs.tuitionTotal - inputs.financialAidTotal - inputs.initialLoanBalance) / 4);

    // Monthly loan payment formula: P * (r(1+r)^n) / ((1+r)^n - 1)
    const monthlyRate = (inputs.interestRate / 100) / 12;
    const totalPayments = inputs.loanTermYears * 12;
    let monthlyLoanPayment = 0;
    if (inputs.initialLoanBalance > 0 && monthlyRate > 0 && totalPayments > 0) {
      monthlyLoanPayment = (inputs.initialLoanBalance * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else if (inputs.initialLoanBalance > 0 && totalPayments > 0) {
      monthlyLoanPayment = inputs.initialLoanBalance / totalPayments;
    }

    let currentSalary = inputs.startingSalary;

    for (let yr = 1; yr <= totalYears; yr++) {
      let annualCashFlow = 0;

      if (yr <= 4) {
        // School years: Out-of-pocket tuition payment, zero career salary
        annualCashFlow = -netTuitionPerYear;
        cashAcc += annualCashFlow;
      } else {
        // Career years (Year 5 = Graduation Year 1)
        const yearInCareer = yr - 4;
        if (yearInCareer > 1) {
          currentSalary *= (1 + salaryGrowth);
        }

        const annualGross = currentSalary;
        const annualTaxes = annualGross * (inputs.taxRatePercent / 100);
        const annual401k = inputs.monthly401k * 12;
        const annualLiving = inputs.monthlyExpenses * 12;

        let annualDebtService = 0;
        if (yearInCareer <= inputs.loanTermYears && debt > 0) {
          annualDebtService = monthlyLoanPayment * 12;

          // Amortize principal for 12 months
          for (let m = 0; m < 12; m++) {
            if (debt <= 0) break;
            const interestMo = debt * monthlyRate;
            const principalMo = Math.min(debt, monthlyLoanPayment - interestMo);
            debt = Math.max(0, debt - Math.max(0, principalMo));
          }
        } else {
          debt = 0;
        }

        annualCashFlow = annualGross - annualTaxes - annual401k - annualLiving - annualDebtService;
        cashAcc += annualCashFlow;

        // 401k growth
        k401Acc = (k401Acc + annual401k) * (1 + investmentReturn);
      }

      const netWorth = cashAcc + k401Acc - debt;

      years.push({
        year: yr,
        cumulativeNetWorth: Math.round(netWorth),
        cashBalance: Math.round(cashAcc),
        accumulated401k: Math.round(k401Acc),
        remainingDebt: Math.round(debt),
        annualNetCashFlow: Math.round(annualCashFlow)
      });
    }

    return years;
  };

  // Helper to compute Workforce Baseline Trajectory (No college, start working Year 1)
  const computeBaselineTrajectory = () => {
    const years: Array<{
      year: number;
      cumulativeNetWorth: number;
      cashBalance: number;
      accumulated401k: number;
      annualNetCashFlow: number;
    }> = [];

    let cashAcc = 0;
    let k401Acc = 0;
    let currentSalary = baselineStartingSalary;

    for (let yr = 1; yr <= totalYears; yr++) {
      if (yr > 1) {
        currentSalary *= (1 + salaryGrowth);
      }

      const annualGross = currentSalary;
      const annualTaxes = annualGross * 0.18; // ~18% baseline tax
      const annual401k = annualGross * 0.04; // 4% 401k savings
      const annualLiving = Math.max(12000, annualGross * 0.55); // estimated modest living expenses

      const annualCashFlow = annualGross - annualTaxes - annual401k - annualLiving;
      cashAcc += annualCashFlow;
      k401Acc = (k401Acc + annual401k) * (1 + investmentReturn);

      const netWorth = cashAcc + k401Acc;

      years.push({
        year: yr,
        cumulativeNetWorth: Math.round(netWorth),
        cashBalance: Math.round(cashAcc),
        accumulated401k: Math.round(k401Acc),
        annualNetCashFlow: Math.round(annualCashFlow)
      });
    }

    return years;
  };

  const activeCollegeTrajectory = computeCollegeTrajectory(activeInputs);
  const baselineTrajectory = computeBaselineTrajectory();
  const comparedTrajectories = comparedScenarios.map(sc => ({
    id: sc.id,
    name: sc.name,
    trajectory: computeCollegeTrajectory(sc.inputs)
  }));

  const projections: ProjectionYearData[] = [];
  let breakEvenYear: number | null = null;

  for (let i = 0; i < totalYears; i++) {
    const yr = i + 1;
    const activeData = activeCollegeTrajectory[i];
    const baseData = baselineTrajectory[i];

    // Check break-even point (when active college surpasses baseline)
    if (breakEvenYear === null && yr >= 4 && activeData.cumulativeNetWorth >= baseData.cumulativeNetWorth) {
      breakEvenYear = yr;
    }

    projections.push({
      year: yr,
      activeCollege: activeData,
      workforceBaseline: baseData,
      comparedColleges: comparedTrajectories.map(ct => ({
        id: ct.id,
        name: ct.name,
        ...ct.trajectory[i]
      }))
    });
  }

  const finalActiveNW = activeCollegeTrajectory[totalYears - 1]?.cumulativeNetWorth ?? 0;
  const finalBaseNW = baselineTrajectory[totalYears - 1]?.cumulativeNetWorth ?? 0;

  return {
    projections,
    breakEven: {
      year: breakEvenYear,
      isReached: breakEvenYear !== null,
      netWorthDifferenceAtEnd: finalActiveNW - finalBaseNW
    }
  };
}
