# Daily Expense Tracker

A modern, minimalist personal **finance desktop application** built with Next.js and Tauri. Track your income, expenses, and financial goals with a clean, dark interface designed for focus and clarity.

## ✨ Features

### 💰 Financial Management

- **Multi-Wallet Support** - Manage multiple accounts (checking, savings, credit cards, cash).
- **Smart Transactions** - Different transaction types with specific attributes (salary, freelance, food purchases, etc.).
- **Real-time Analytics** - Interactive charts showing income vs expenses over time.
- **Category Insights** - Detailed breakdown of spending patterns by category.

### 🔍 Advanced Functionality

- **Intelligent Search** - Find transactions across all data with debounced search.
- **Sorting & Filtering** - Sort by balance, transaction count, or creation date.
- **CRUD Operations** - Full create, read, update, delete functionality for all data.
- **Optimistic Updates** - Instant UI feedback with SWR caching.

### 🎨 User Experience

- **Minimal Dark Design** - Ultra-clean interface inspired by modern design principles.
- **Auto-hide Sidebar** - Contextual navigation that appears on hover.
- **Responsive Layout** - Works seamlessly across all screen sizes.
- **Smooth Animations** - Framer Motion powered transitions and interactions.

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with static export.
- **TypeScript** - Type-safe development.
- **Tailwind CSS v4** - Utility-first styling with custom design system.
- **SWR** - Data fetching with intelligent caching.
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

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and [bun](https://bun.sh/).
- **Rust** 1.70+ with Cargo
- **Tauri CLI** - Install with `cargo install tauri-cli`

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AlejandroDalzotto/orbit.git
   cd daily-expense-tracker
   ```

2. **Install dependencies**

   ```bash
   bun i

   cargo build
   ```

3. **Development server**

   ```bash
   bun tauri dev
   ```

4. **Build for production**

   ```bash
   bun tauri build
   ```

## 📁 Project Structure

```txt
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main wallets page
│   ├── transactions/      # Transactions management
│   ├── analytics/         # Financial analytics
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── buttons/          # Button components
│   └── forms/            # Form components
├── hooks/                # Custom React hooks
│   ├── useTransactions.ts
│   └── useWalletAccounts.ts
├── models/               # TypeScript type definitions
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── commands/    # Tauri commands
│   │   └── models/      # Rust data models
│   └── Cargo.toml
└── types/               # Shared TypeScript types
```

## 💡 Usage

### Managing Wallets

- Add new wallets with custom names and initial balances.
- View transaction counts for each wallet.
- Sort wallets by balance, transactions, or creation date.

### Recording Transactions

- Create different transaction types (salary, freelance, food, etc.).
- Add specific details like items for grocery purchases.
- Edit and delete transactions with confirmation dialogs.

### Analytics & Insights

- View interactive charts of income vs expenses.
- Analyze spending patterns by category.
- Track financial trends over time.

### Search & Organization

- Search across all transactions with real-time results.
- Filter by date ranges, categories, or amounts.
- Sort and organize data by multiple criteria.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Design inspiration from modern financial applications.
- Built with the amazing Tauri and Next.js ecosystems.
- Icons provided by Lucide React.
- Charts powered by Lightweight Charts library.
