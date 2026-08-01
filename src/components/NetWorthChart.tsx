import React, { useState } from 'react';
import { calculateROIProjections, type ScenarioInputs } from '../utils/roiProjections';

interface NetWorthChartProps {
  activeInputs: ScenarioInputs;
  comparedScenarios?: Array<{ id: string; name: string; inputs: ScenarioInputs }>;
  formatCurrency: (val: number) => string;
}

export const NetWorthChart: React.FC<NetWorthChartProps> = ({
  activeInputs,
  comparedScenarios = [],
  formatCurrency
}) => {
  const [timeframeYears, setTimeframeYears] = useState<number>(10);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Filter out any duplicate of the active college from compared scenarios so it only appears once
  const uniqueComparedScenarios = comparedScenarios.filter(
    (sc) => sc.name.trim().toLowerCase() !== (activeInputs.collegeName || '').trim().toLowerCase()
  );

  const { projections, breakEven } = calculateROIProjections(
    activeInputs,
    uniqueComparedScenarios,
    timeframeYears
  );

  // SVG Dimensions & Padding
  const width = 800;
  const height = 360;
  const padding = { top: 40, right: 30, bottom: 50, left: 75 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Find min and max Y values for scale
  let minY = 0;
  let maxY = 0;

  projections.forEach((p) => {
    minY = Math.min(minY, p.activeCollege.cumulativeNetWorth, p.workforceBaseline.cumulativeNetWorth);
    maxY = Math.max(maxY, p.activeCollege.cumulativeNetWorth, p.workforceBaseline.cumulativeNetWorth);

    p.comparedColleges.forEach((cc) => {
      minY = Math.min(minY, cc.cumulativeNetWorth);
      maxY = Math.max(maxY, cc.cumulativeNetWorth);
    });
  });

  // Add 10% padding to max and min
  const yPadding = (maxY - minY) * 0.1 || 10000;
  minY = Math.floor((minY - yPadding) / 10000) * 10000;
  maxY = Math.ceil((maxY + yPadding) / 10000) * 10000;

  // Scale helpers
  const getX = (index: number) => {
    if (projections.length <= 1) return padding.left;
    return padding.left + (index / (projections.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    const range = maxY - minY || 1;
    return height - padding.bottom - ((val - minY) / range) * graphHeight;
  };

  // Generate SVG path for a series
  const generatePath = (getValue: (p: typeof projections[0]) => number) => {
    return projections.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(getValue(p))}`).join(' ');
  };

  // Generate SVG area path for active college
  const activePath = generatePath((p) => p.activeCollege.cumulativeNetWorth);
  const baselinePath = generatePath((p) => p.workforceBaseline.cumulativeNetWorth);
  const zeroY = getY(0);

  const activeAreaPath = `${activePath} L ${getX(projections.length - 1)} ${zeroY} L ${getX(0)} ${zeroY} Z`;

  // Palette colors for compared colleges
  const comparedColors = ['#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4'];

  // Default snapshot display year to Year 10 (or timeframe bounds)
  const defaultYear = Math.min(10, timeframeYears);
  const activeDisplayYear = hoveredYear ?? defaultYear;
  const hoveredData = projections.find((p) => p.year === activeDisplayYear) ?? projections[projections.length - 1];
  const hoveredIndex = hoveredData ? hoveredData.year - 1 : projections.length - 1;

  // Y-axis tick values (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => minY + (i * (maxY - minY)) / 4);

  return (
    <div className="net-worth-chart-card result-card">
      <div className="chart-header">
        <div>
          <h3>Cumulative Net Worth & ROI Trajectory</h3>
          <p className="chart-subtitle">
            10–20 year financial outlook comparing college ROI against the straight-to-workforce baseline.
          </p>
        </div>
        <div className="chart-controls">
          <div className="timeframe-button-group" role="group" aria-label="Select projection timeframe">
            {[10, 15, 20].map((years) => (
              <button
                key={years}
                type="button"
                className={`timeframe-btn ${timeframeYears === years ? 'active' : ''}`}
                onClick={() => setTimeframeYears(years)}
              >
                {years} Yrs
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Break-Even Status Banner */}
      <div className={`break-even-banner ${breakEven.isReached ? 'reached' : 'pending'}`}>
        <div className="break-even-status">
          <span className="status-dot"></span>
          {breakEven.isReached ? (
            <span>
              <strong>Break-Even Reached at Year {breakEven.year}:</strong> College ROI surpasses baseline by{' '}
              <strong className="text-success-val">{formatCurrency(breakEven.netWorthDifferenceAtEnd)}</strong> at Year {timeframeYears}.
            </span>
          ) : (
            <span>
              <strong>Break-Even Not Reached:</strong> Baseline remains higher within {timeframeYears} years by{' '}
              <strong className="text-danger-val">{formatCurrency(Math.abs(breakEven.netWorthDifferenceAtEnd))}</strong>.
            </span>
          )}
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="svg-chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="net-worth-svg"
          onMouseLeave={() => setHoveredYear(null)}
          role="img"
          aria-label="Cumulative Net Worth line chart visualization over time"
        >
          <defs>
            <linearGradient id="activeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines & Y-axis */}
          {yTicks.map((tick, i) => {
            const yPos = getY(tick);
            return (
              <g key={i} className="chart-grid-line">
                <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padding.left - 10} y={yPos + 4} textAnchor="end" className="chart-axis-label">
                  {formatCurrency(tick).replace(/\.00$/, '')}
                </text>
              </g>
            );
          })}

          {/* Zero baseline line */}
          {minY < 0 && maxY > 0 && (
            <line
              x1={padding.left}
              y1={zeroY}
              x2={width - padding.right}
              y2={zeroY}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          )}

          {/* X-axis ticks */}
          {projections.map((p, i) => {
            // Display label every few years or on endpoints
            const showLabel = i === 0 || i === projections.length - 1 || (i + 1) % 5 === 0;
            const xPos = getX(i);
            return (
              <g key={p.year} className="chart-x-tick">
                <line x1={xPos} y1={height - padding.bottom} x2={xPos} y2={height - padding.bottom + 6} stroke="#cbd5e1" />
                {showLabel && (
                  <text x={xPos} y={height - padding.bottom + 22} textAnchor="middle" className="chart-axis-label">
                    Yr {p.year}
                  </text>
                )}
                {/* Interactive transparent hover capture column */}
                <rect
                  x={xPos - (graphWidth / projections.length) / 2}
                  y={padding.top}
                  width={graphWidth / projections.length}
                  height={graphHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredYear(p.year)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}

          {/* Gradient Area under Active College */}
          <path d={activeAreaPath} fill="url(#activeAreaGrad)" />

          {/* Workforce Baseline Line (Dashed) */}
          <path
            d={baselinePath}
            fill="none"
            stroke="#64748b"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="chart-line-baseline"
          />

          {/* Compared Colleges Lines */}
          {uniqueComparedScenarios.map((sc, scIdx) => {
            const pathD = generatePath((p) => {
              const comp = p.comparedColleges.find((c) => c.id === sc.id);
              return comp ? comp.cumulativeNetWorth : 0;
            });
            const color = comparedColors[scIdx % comparedColors.length];
            return (
              <path
                key={sc.id}
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                className="chart-line-compared"
              />
            );
          })}

          {/* Active College Primary Line */}
          <path
            d={activePath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3.5"
            className="chart-line-active"
          />

          {/* Break-Even Marker Point */}
          {breakEven.isReached && breakEven.year !== null && (
            <g className="break-even-marker">
              {(() => {
                const idx = breakEven.year - 1;
                const bx = getX(idx);
                const by = getY(projections[idx].activeCollege.cumulativeNetWorth);
                return (
                  <>
                    <circle cx={bx} cy={by} r="8" fill="#10b981" opacity="0.3" className="pulse-ring" />
                    <circle cx={bx} cy={by} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <rect x={bx - 40} y={by - 28} width="80" height="20" rx="4" fill="#065f46" />
                    <text x={bx} y={by - 15} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      Break-Even
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* Always Visible Guide Line & Dot Highlights */}
          {hoveredData && hoveredIndex >= 0 && (
            <g className="hover-guide-group">
              {/* Vertical Guide Line */}
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={height - padding.bottom}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Active Dot */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(hoveredData.activeCollege.cumulativeNetWorth)}
                r="6"
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Baseline Dot */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(hoveredData.workforceBaseline.cumulativeNetWorth)}
                r="5"
                fill="#64748b"
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Compared Dots */}
              {hoveredData.comparedColleges.map((cc, idx) => (
                <circle
                  key={cc.id}
                  cx={getX(hoveredIndex)}
                  cy={getY(cc.cumulativeNetWorth)}
                  r="5"
                  fill={comparedColors[idx % comparedColors.length]}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Always Visible Snapshot Panel */}
      {hoveredData && (
        <div className="chart-tooltip-panel">
          <div className="tooltip-header">
            <strong>Year {hoveredData.year} Snapshot</strong>
            <span className="tooltip-year-badge">
              {hoveredYear !== null ? `Hovering Yr ${hoveredData.year}` : `Default Yr ${hoveredData.year}`} (Age ~{21 + hoveredData.year})
            </span>
          </div>
          <div className="tooltip-grid">
            <div className="tooltip-item active">
              <div className="item-title">
                <span className="dot active-dot"></span>
                <strong>{activeInputs.collegeName || 'Selected College'}</strong>
              </div>
              <div className="item-metrics">
                <span>Net Worth: <strong>{formatCurrency(hoveredData.activeCollege.cumulativeNetWorth)}</strong></span>
                <span>Cash: {formatCurrency(hoveredData.activeCollege.cashBalance)}</span>
                <span>401(k): {formatCurrency(hoveredData.activeCollege.accumulated401k)}</span>
                {hoveredData.activeCollege.remainingDebt > 0 && (
                  <span className="text-danger-val">Loan Debt: {formatCurrency(hoveredData.activeCollege.remainingDebt)}</span>
                )}
              </div>
            </div>

            <div className="tooltip-item baseline">
              <div className="item-title">
                <span className="dot baseline-dot"></span>
                <strong>Straight-to-Workforce Baseline</strong>
                <span className="info-icon info-icon-aligned">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <span className="tooltip-text tooltip-250">
                    Financial benchmark assuming entering workforce after high school at $35,000/yr salary (3% annual growth), $0 college debt, and 4% 401(k) savings.
                  </span>
                </span>
              </div>
              <div className="item-metrics">
                <span>Net Worth: <strong>{formatCurrency(hoveredData.workforceBaseline.cumulativeNetWorth)}</strong></span>
                <span>Cash: {formatCurrency(hoveredData.workforceBaseline.cashBalance)}</span>
                <span>401(k): {formatCurrency(hoveredData.workforceBaseline.accumulated401k)}</span>
              </div>
            </div>

            {hoveredData.comparedColleges.map((cc, idx) => (
              <div key={cc.id} className="tooltip-item compared">
                <div className="item-title">
                  <span className="dot" style={{ backgroundColor: comparedColors[idx % comparedColors.length] }}></span>
                  <strong>{cc.name}</strong>
                </div>
                <div className="item-metrics">
                  <span>Net Worth: <strong>{formatCurrency(cc.cumulativeNetWorth)}</strong></span>
                  <span>401(k): {formatCurrency(cc.accumulated401k)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-chip active-chip"></span>
          <span>{activeInputs.collegeName || 'Selected College'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-chip baseline-chip"></span>
          <span>Workforce Baseline</span>
        </div>
        {uniqueComparedScenarios.map((sc, idx) => (
          <div key={sc.id} className="legend-item">
            <span
              className="legend-chip"
              style={{ backgroundColor: comparedColors[idx % comparedColors.length] }}
            ></span>
            <span>{sc.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
