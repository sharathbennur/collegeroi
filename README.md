# College ROI Calculator

A comprehensive tool designed to help students and families calculate the Return on Investment (ROI) for college education. This application enables users to estimate the total cost of attendance, including tuition, room & board, and other expenses, while also accounting for financial aid, family contributions, and student loans.

## Features

- **College Expense Calculator**: Detailed breakdown of tuition, room & board, and other expenses over 4 years.
- **Loan Estimation**: Calculate monthly loan payments, total interest, and projected payoff timelines.
- **Financial Planning**: Input family contributions and financial aid to see their impact on total debt.
- **Future Projections**: Estimate taxes, net monthly cash flow, and projected savings based on expected starting salaries.
- **College Comparison**: Compare multiple colleges side-by-side to make informed financial decisions.
- **Inflation Adjustment**: Automatically calculate future costs based on custom inflation rates.
- **Privacy Focused**: All data is stored locally in your browser. No personal information is sent to external servers.

## Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Hosting**: Firebase Hosting

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (usually comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sharathbennur/collegeroi.git
    cd collegeroi
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Running Tests

To run the test suite:

```bash
npm run test
```

### Linting

To run the linter and check for code style issues:

```bash
npm run lint
```

## Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License.

## For Coding Assistants

See [agents.md](./agents.md) for architectural details and conventions.
