import React, { useState } from 'react';

export interface CashBreakdownInputs {
  grossMonthlyIncome: number;
  monthlyTaxes: number;
  monthlyExpenses: number;
  monthlyHousingRent: number;
  monthlyLoanPayment: number;
  monthly401k: number;
}

interface CashBreakdownDonutProps {
  inputs: CashBreakdownInputs;
  formatCurrency: (val: number) => string;
  compact?: boolean;
}

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export const CashBreakdownDonut: React.FC<CashBreakdownDonutProps> = ({
  inputs,
  formatCurrency,
  compact = false
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<DonutSegment | null>(null);

  const gross = Math.max(1, inputs.grossMonthlyIncome);
  const taxes = Math.max(0, inputs.monthlyTaxes);
  const expenses = Math.max(0, inputs.monthlyExpenses);
  const loan = Math.max(0, inputs.monthlyLoanPayment);
  const savings401k = Math.max(0, inputs.monthly401k);

  const allocatedTotal = taxes + expenses + loan + savings401k;
  const discretionary = Math.max(0, gross - allocatedTotal);
  const totalSum = Math.max(gross, allocatedTotal);

  const segments: DonutSegment[] = [
    {
      id: 'taxes',
      label: 'Taxes (Federal/State/FICA)',
      value: taxes,
      color: '#ef4444',
      percentage: (taxes / totalSum) * 100
    },
    {
      id: 'expenses',
      label: 'Rent & Living Expenses',
      value: expenses,
      color: '#f59e0b',
      percentage: (expenses / totalSum) * 100
    },
    {
      id: 'loan',
      label: 'Student Loan Payment',
      value: loan,
      color: '#8b5cf6',
      percentage: (loan / totalSum) * 100
    },
    {
      id: 'savings401k',
      label: '401(k) Retirement Savings',
      value: savings401k,
      color: '#3b82f6',
      percentage: (savings401k / totalSum) * 100
    },
    {
      id: 'discretionary',
      label: 'Discretionary Cash Flow',
      value: discretionary,
      color: '#10b981',
      percentage: (discretionary / totalSum) * 100
    }
  ].filter((seg) => seg.value > 0);

  // Over-leveraged threshold calculations (>30% of income)
  const housingPercent = (inputs.monthlyHousingRent / gross) * 100;
  const debtPercent = (inputs.monthlyLoanPayment / gross) * 100;

  const isHousingOverLeveraged = housingPercent > 30;
  const isDebtOverLeveraged = debtPercent > 30;

  // Donut SVG Math
  const cx = 110;
  const cy = 110;
  const radius = 75;
  const strokeWidth = 24;

  let currentAngle = -90; // Start at top

  // Generate SVG Arc paths
  const arcSegments = segments.map((seg) => {
    const angle = (seg.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // Handle full 360 circle edge case
    const pathData =
      angle >= 359.9
        ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      ...seg,
      pathData
    };
  });

  return (
    <div className={`cash-donut-container ${compact ? 'compact' : ''}`}>
      {/* Over-leveraged Warnings Banner */}
      {(isHousingOverLeveraged || isDebtOverLeveraged) && (
        <div className="donut-alert-banner">
          {isHousingOverLeveraged && (
            <div className="alert-item warning">
              <span className="alert-icon">⚠️</span>
              <span>
                <strong>Housing Over-Leveraged:</strong> Rent is{' '}
                <strong>{housingPercent.toFixed(1)}%</strong> of income (Recommended max: 30%).
              </span>
            </div>
          )}
          {isDebtOverLeveraged && (
            <div className="alert-item warning">
              <span className="alert-icon">🚨</span>
              <span>
                <strong>Student Debt Over-Leveraged:</strong> Loan payment is{' '}
                <strong>{debtPercent.toFixed(1)}%</strong> of income (Recommended max: 30%).
              </span>
            </div>
          )}
        </div>
      )}

      <div className="donut-chart-body">
        {/* SVG Donut Visualizer */}
        <div className="donut-svg-wrapper">
          <svg
            viewBox="0 0 220 220"
            className="donut-svg"
            role="img"
            aria-label="Monthly cash breakdown donut chart"
            onMouseLeave={() => setHoveredSegment(null)}
          >
            {/* Background Track Circle */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#334155"
              strokeWidth={strokeWidth}
              opacity="0.2"
            />

            {/* Segment Arcs */}
            {arcSegments.map((seg) => {
              const isHovered = hoveredSegment?.id === seg.id;
              return (
                <path
                  key={seg.id}
                  d={seg.pathData}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  className="donut-segment-path"
                  onMouseEnter={() => setHoveredSegment(seg)}
                  style={{
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    filter: isHovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none'
                  }}
                />
              );
            })}

            {/* Donut Center Label */}
            <g className="donut-center-text" pointerEvents="none">
              <text x={cx} y={cy - 10} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
                {hoveredSegment ? hoveredSegment.label : 'Gross Monthly'}
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="bold">
                {hoveredSegment
                  ? formatCurrency(hoveredSegment.value)
                  : formatCurrency(gross)}
              </text>
              <text x={cx} y={cy + 28} textAnchor="middle" fill="#cbd5e1" fontSize="10">
                {hoveredSegment
                  ? `${hoveredSegment.percentage.toFixed(1)}% of Income`
                  : `${formatCurrency(allocatedTotal)} Committed`}
              </text>
            </g>
          </svg>
        </div>

        {/* Donut Legend Items */}
        <div className="donut-legend">
          {segments.map((seg) => {
            const isHovered = hoveredSegment?.id === seg.id;
            return (
              <div
                key={seg.id}
                className={`donut-legend-item ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="legend-chip-title">
                  <span className="legend-dot" style={{ backgroundColor: seg.color }}></span>
                  <span className="legend-label">{seg.label}</span>
                </div>
                <div className="legend-chip-values">
                  <span className="legend-amount">{formatCurrency(seg.value)}</span>
                  <span className="legend-percent">{seg.percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
