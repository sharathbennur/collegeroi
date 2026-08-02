export interface MajorBenchmark {
  id: string;
  name: string;
  baseSalary: number;
}

export interface LocationMultiplier {
  id: string;
  name: string;
  multiplier: number;
}

export interface SalarySource {
  title: string;
  organization: string;
  url: string;
  description: string;
}

export const MAJOR_BENCHMARKS: MajorBenchmark[] = [
  { id: 'custom', name: 'Custom / Manual Entry', baseSalary: 0 },
  { id: 'cs', name: 'Computer Science & Software Engineering', baseSalary: 82000 },
  { id: 'eng', name: 'Engineering (Electrical, Mech, Civil)', baseSalary: 76000 },
  { id: 'nursing', name: 'Nursing & Allied Healthcare', baseSalary: 72000 },
  { id: 'finance', name: 'Finance, Economics & Accounting', baseSalary: 70000 },
  { id: 'business', name: 'Business, Marketing & Management', baseSalary: 58000 },
  { id: 'education', name: 'Education & Teaching', baseSalary: 46000 },
  { id: 'humanities', name: 'Humanities & Social Sciences', baseSalary: 45000 },
  { id: 'arts', name: 'Visual & Performing Arts', baseSalary: 42000 }
];

export const LOCATION_MULTIPLIERS: LocationMultiplier[] = [
  { id: 'national', name: 'National Average (1.0x COL)', multiplier: 1.0 },
  { id: 'ca', name: 'California (1.25x COL)', multiplier: 1.25 },
  { id: 'ny', name: 'New York (1.22x COL)', multiplier: 1.22 },
  { id: 'tx', name: 'Texas (1.02x COL)', multiplier: 1.02 },
  { id: 'fl', name: 'Florida (0.98x COL)', multiplier: 0.98 },
  { id: 'il', name: 'Illinois (1.04x COL)', multiplier: 1.04 },
  { id: 'wa', name: 'Washington (1.18x COL)', multiplier: 1.18 },
  { id: 'ma', name: 'Massachusetts (1.20x COL)', multiplier: 1.20 },
  { id: 'co', name: 'Colorado (1.10x COL)', multiplier: 1.10 },
  { id: 'oh', name: 'Ohio (0.95x COL)', multiplier: 0.95 }
];

export const SALARY_BENCHMARK_SOURCES: SalarySource[] = [
  {
    title: 'Occupational Employment & Wage Statistics (OEWS)',
    organization: 'U.S. Bureau of Labor Statistics (BLS)',
    url: 'https://www.bls.gov/oes/',
    description: 'Official federal wage statistics by field of study, degree level, and region.'
  },
  {
    title: 'NACE Salary Survey Reports',
    organization: 'National Association of Colleges and Employers (NACE)',
    url: 'https://www.naceweb.org/job-market/compensation/salary-survey/',
    description: 'Annual starting salary benchmarks for new bachelor degree graduates.'
  },
  {
    title: 'College Scorecard Field of Study Earnings',
    organization: 'U.S. Department of Education',
    url: 'https://collegescorecard.ed.gov/',
    description: 'Actual median earnings 1 to 4 years post-graduation by institution and field of study.'
  },
  {
    title: 'State Regional Price Parities (RPP) & Cost-of-Living Index',
    organization: 'U.S. Bureau of Economic Analysis (BEA) & Tax Foundation',
    url: 'https://taxfoundation.org/data/all/state/state-income-taxes-cost-of-living-2024/',
    description: 'State purchasing power parity index adjustments.'
  }
];
