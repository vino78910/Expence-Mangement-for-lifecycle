# 💰 Expence Management for Lifecycle

A simple, beautiful day-to-day expense tracker built for real life. Log what you spend in seconds, see where your money goes, set a monthly budget, and get AI-powered saving tips — all in **Indian Rupees (₹)**.

## ✨ Features

- **Quick daily logging** — amount, category, payment mode (Cash / UPI / Card / Other) and an optional note
- **16 smart categories** in 4 groups:
  - 🥬 **Essentials** — Groceries, Rent, Utility Bills, Transport
  - 🛍️ **Lifestyle** — Eating Out, Shopping, Entertainment, Hobbies
  - 💊 **Health** — Medicines, Doctor Visits, Fitness, Insurance
  - 📚 **Education / Work** — Courses, Books, Subscriptions, Work Travel
- **Live summary cards** — Today's spend, this week, this month, and budget left
- **Monthly budget with alerts** — amber warning banner at 80% used, red alert when you cross 100%
- **Charts** — spending by group (donut), 14-day trend (bars), top categories
- **Detailed summary** — week-over-week change, payment mode split, 4-week breakdown, full category ranking
- **Expense table** — filter by month, search anything, export to CSV, delete with confirmation
- **AI saving tips** — personalized suggestions generated from your real spending pattern (with friendly fallback tips if AI is unavailable)
- **Dark mode** 🌙 and fully responsive on mobile

## 🛠️ Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) + shadcn/ui components
- [Prisma](https://www.prisma.io/) ORM with SQLite (zero-config local database)
- [TanStack React Query](https://tanstack.com/query) for data fetching
- [Recharts](https://recharts.org/) for charts
- [z-ai-web-dev-sdk](https://z-ai-web-dev-sdk) for AI saving tips

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Create a `.env` file in the project root:

```
DATABASE_URL=file:./db/custom.db
```

Then create the database tables:

```bash
npx prisma db push
```

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start tracking!

### First steps in the app

1. Add today's first expense (try it — it takes 5 seconds)
2. Set your monthly budget (e.g. ₹15,000) in the budget card
3. Watch the summary cards and charts fill up as you log
4. Hit **80% of budget** and see the warning banner appear 🔔

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── budget/        # GET / PUT monthly budget
│   │   ├── expenses/      # GET / POST expenses, DELETE by id
│   │   └── tips/          # AI saving tips endpoint
│   ├── page.tsx           # Main dashboard
│   └── layout.tsx
├── components/expense/    # Form, cards, charts, table, panels
└── lib/                   # Categories, formatting, types, db client
prisma/schema.prisma       # Expense + Budget models
```

## 📄 License

MIT — free to use, modify and share.
