# React Account Async

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![Status](https://img.shields.io/badge/Status-Prototype-orange)
![Data](https://img.shields.io/badge/Data-No%20Persistent%20Storage-red)
![Purpose](https://img.shields.io/badge/Purpose-Account%20Reconciliation-blue)

A lightweight, stand-alone reconciliation tool built on the fly to compare account balances between two accounting systems.

This app was created for one core purpose:  
when balances didn’t match, I needed a fast way to move through records **step by step**, isolate discrepancies, and identify where things went off track.

---

## Why This Exists

When account totals differ, it’s rarely obvious where the mismatch begins.  
This project provides a focused workflow for manual verification:

- Compare online vs local balances
- Inspect transaction records in sequence
- Trace differences record-by-record
- Pinpoint the exact source of mismatch

It’s intentionally simple and practical—built to solve a real reconciliation problem quickly.

---

## Project Characteristics

- **Stand-alone app** (no backend dependency required for core workflow)
- **No persistent data storage** (session-only usage)
- **Built rapidly** for immediate banking troubleshooting needs
- **Step-by-step record review** as the main reconciliation method

> ⚠️ **Important:** This tool does **not** persist reconciliation data.  

---

## Use Case

This project is useful when:

- Your online account balance does not match your desktop/local ledger
- You need to audit transactions one line at a time
- You want a focused interface instead of digging through multiple systems manually
- You need to quickly identify the first point of divergence

---

## Core Workflow

1. Pull your relevant account records from both sources
2. Load/enter records into the app
3. Walk through entries in order
4. Compare amounts, dates, references, and running balances
5. Flag inconsistencies
6. Identify root discrepancy and correct in source system

---

## Tech Stack

- **React** (Create React App base)
- Basic client-side state management (no persistent DB layer)

---

## Getting Started

### Prerequisites

- Node.js (recommended LTS)
- npm

### Installation

```bash
git clone https://github.com/Sam-JobLens360/react-acct-async.git
cd react-acct-async
npm install
```

### Run in Development

```bash
npm start
```

Open `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
```

---

## Available Scripts

In the project directory, you can run:

- `npm start` – Runs the app in development mode
- `npm test` – Launches the test runner
- `npm run build` – Builds the app for production
- `npm run eject` – Ejects CRA configuration (one-way operation)

---

## Design Notes

This project favors **clarity over complexity**:

- Minimal moving parts
- Fast startup
- Clear step-by-step record tracing
- Built for practical reconciliation, not long-term data management

---

## Limitations

- No persistent storage
- Not a full accounting platform
- No automated sync between systems unless added separately
- Primarily intended for discrepancy investigation workflows

---

## Future Improvements (Optional)

- CSV import/export for both sources
- Saved reconciliation sessions
- Rule-based mismatch detection
- Diff summary reports
- Audit trail export (PDF/CSV)

---

## Author Intent

This was built quickly, on the fly, to solve a real bookkeeping pain point:  
when online and local balances diverged, I needed a simple, reliable way to review records methodically and find exactly where the mismatch occurred.

---

## License

If you plan to open-source this project, add a license (e.g., MIT) in a `LICENSE` file.
