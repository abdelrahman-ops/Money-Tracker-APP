# Finora - Money Tracker App

A modern, AI-powered personal finance management application built with React, Vite, and IndexedDB. Finora helps users track their income and expenses, manage budgets, and gain financial insights with a beautiful, intuitive interface.

## Features

- **Dashboard**: Overview of total balance, recent transactions, and quick actions.
- **Transaction Management**: Add, edit, and delete income and expense transactions.
- **Budget Tracking**: Set monthly budgets for different categories and track progress.
- **Wallet Management**: Manage multiple accounts (cash, bank, credit cards) with custom icons and colors.
- **Analytics**: Visual charts and insights into spending habits.
- **Recurring Transactions**: Set up automatic recurring transactions (daily, weekly, monthly, yearly).
- **Template System**: Create and reuse transaction templates for quick entry.
- **Dark Mode**: Automatic theme switching based on system preference.
- **Offline-First**: Built with IndexedDB for reliable offline access.
- **PWA Support**: Installable as a Progressive Web App.

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, CSS Custom Properties
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useMemo, useRef)
- **Database**: IndexedDB (Dexie.js wrapper)
- **PWA**: Vite PWA Plugin

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Money-Tracker-APP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- The app will automatically detect your system's dark mode preference.
- All data is stored locally in your browser's IndexedDB.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── LucideIcon.jsx # Icon component
│   ├── Navbar.jsx     # Navigation bar
│   └── ...
├── pages/             # Application pages
│   ├── Dashboard.jsx  # Main dashboard
│   ├── Transactions.jsx # Transaction list
│   ├── AddTransaction.jsx # Transaction form
│   ├── Wallets.jsx    # Wallet management
│   ├── WalletForm.jsx # Wallet creation/edit
│   ├── Analytics.jsx  # Analytics and charts
│   ├── Settings.jsx   # Settings and preferences
│   └── ...
├── utils/             # Utility functions
│   ├── db.js          # IndexedDB helper
│   └── helpers.js     # General helpers
├── App.jsx            # Main application component
└── index.css          # Global styles
```

## License

MIT
