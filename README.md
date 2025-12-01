# Orbit

![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

A modern, minimalist personal **finance desktop application** built with Next.js and Tauri. Track your income, expenses, and financial goals with a clean interface designed for focus and clarity.

## Features

### Financial Management

- **Multi-Wallet Support** - Manage multiple accounts (checking, savings, credit cards, cash).
- **Customizable Transactions** - Define your own transaction types with specific attributes.
- **Real-time Analytics** - Interactive charts showing income vs expenses over time.
- **Category Insights** - Detailed breakdown of spending patterns by category.

### Advanced Functionality

- **Intelligent Search** - Find transactions across all data.
- **Sorting & Filtering** - Sort by balance, transaction type, or creation date.
- **CRUD Operations** - Full create, read, update, delete functionality for all data.

### User Experience

- **Minimal Dark Design** - Ultra-clean interface inspired by modern design principles.
- **Auto-hide Sidebar** - Contextual navigation that appears on hover.
- **Responsive Layout** - Works seamlessly across all screen sizes.
- **Smooth Animations** - Framer Motion powered transitions and interactions.

## Tech Stack

### Frontend

- **Next.js 15** - React framework with static export.
- **TypeScript** - Type-safe development.
- **Tailwind CSS v4** - Utility-first styling with custom design system.
- **Zustand** - State management for React applications.
- **Motion** - Smooth animations and transitions.
- **Lucide React** - Beautiful, consistent icons.

### Backend

- **Tauri v2** - Secure desktop app framework.
- **Rust** - High-performance backend with file system operations.
- **JSON Storage** - Local file-based data persistence.
- **Serde** - Serialization and deserialization provided by Tauri.

### Development Tools

- **ESLint** - Code linting and formatting.
- **TypeScript** - Static type checking.
- **Cargo** - Rust package management.
- **Bun** - Fast, lightweight JavaScript runtime.

## Usage

1. Launch the application.
2. Wallet:
  - Create new accounts in your wallet to organize your finances.
  - You can specify a name, initial balance, currency, and type.
  - All the transactions related to an account are shown in a list, click the dropdown menu to view details.
  - Accounts can transfer funds between each other. These tranfers will not modify the total balance of your wallet.
3. Transactions:
  - Create new transactions to record income or expenses.
  - You can specify a description, balance, date, and category.
  - All the transactions are shown in a list, click the dropdown menu to view details.
  - Sort transactions by date, amount, or type.
4. Items:
  - Create new items to record in transactions.
  - You can specify a name brand, or if it has warranty.
  - All the items are shown in a list, click the dropdown menu to view details.
  - View the price history of each item by clicking "View price history" in the dropdown menu.
  - Mark any item as 'leak' with a spending or amount limit; the application will notify you when you exceed the limit.
5. Categories:
  - Create new categories beyond the default ones to organize your transactions.
  - Define custom fields for each one.
6. Analytics:
  - Visualize charts of your expenses vs income over time.
  - See monthly summaries.
  - View most purchased items, insights, and trends.
7. Settings:
  - Customize theme, language, and other preferences.

## Todo

- [ ] Add support for multiple currencies
- [ ] Implement settings page:
  - Customize theme, language, and other preferences.
- [ ] Improve performance
- [ ] Implement connection between devices to sync your data.
- [ ] Add support for Linux and macOS.
