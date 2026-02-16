# Agents Guide

This document is intended for coding assistants (like you!) to quickly understand the `collegeroi` codebase.

## Project Overview

-   **Type**: Single Page Application (SPA)
-   **Framework**: React 19 + TypeScript + Vite
-   **Styling**: Standard CSS (imported directly into components)
-   **State Management**: React `useState` + `useEffect` (local state persistence via `localStorage`)
-   **Testing**: Vitest (`npm run test`)

## Key Files & Structure

-   `src/Calculator.tsx`: **CRITICAL**. This is the main component containing almost all business logic, state, and UI rendering. It is a large file (~2300 lines).
    -   *Note*: When modifying this file, be extremely careful to preserve existing state logic and effects.
    -   *Refactoring Opportunity*: This component is a prime candidate for splitting into smaller sub-components (e.g., `TuitionForm`, `LoanCalculator`, `ResultsSummary`).
-   `src/App.tsx`: Main entry point, handles routing (React Router).
-   `src/utils/`: (Currently empty, but intended for helper functions).

## Conventions

-   **Components**: Functional components with hooks.
-   **Naming**: PascalCase for components, camelCase for functions/variables.
-   **CSS**: Component-specific CSS files (e.g., `Calculator.css`) are imported directly.
-   **Persistence**: The `collegeRoiCalcState` key in `localStorage` is used to persist user data.

## Development Commands

-   `npm run dev`: Start dev server.
-   `npm run build`: Build for production.
-   `npm run test`: Run tests.
-   `npm run lint`: Run ESLint.

## Specific Logic Notes

-   **Inflation Adjustment**: The calculator projects future costs based on a user-provided inflation rate. This logic is embedded within `Calculator.tsx` inside helper functions like `calculateYear`.
-   **Loan Calculation**: Standard amortization formulas are used.
