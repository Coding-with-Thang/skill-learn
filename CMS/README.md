# Skill-Learn - Super Admin Dashboard

A modern, fully functional super-admin CMS dashboard for a multi-tenant Learning Management System (LMS) SaaS platform.

## Features

- 📊 **Comprehensive Dashboard** - Real-time metrics, revenue charts, and tenant activity
- 🏢 **Tenant Management** - Monitor and manage all tenant organizations
- 💳 **Billing Overview** - Track revenue, subscriptions, and payment status
- 📈 **Analytics** - Beautiful charts with Recharts
- ⚙️ **System Health** - Monitor API, database, storage, and services
- 🎨 **Dark/Light Mode** - Seamless theme switching
- 🎭 **Smooth Animations** - Framer Motion powered interactions
- 📱 **Responsive Design** - Works on all screen sizes

## Tech Stack

- **Framework**: Next.js 14 (JavaScript)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
CMS/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── dashboard/   # Dashboard-specific components
│   │   └── layout/      # Layout components
│   └── lib/             # Utilities and stores
│       ├── utils.js     # Utility functions
│       ├── store.js     # Zustand stores
│       └── mockData.js  # Mock data for prototype
└── public/              # Static assets
```

## Key Components

- **HeroStatsCard** - Animated metric cards with sparklines
- **RevenueChart** - Interactive area chart with time range filters
- **TenantActivityTable** - Searchable, filterable table with pagination
- **SystemHealthPanel** - Real-time system status monitoring
- **RecentAlertsPanel** - Alert notifications with color coding
- **SubscriptionDistribution** - Donut chart showing plan breakdown
- **QuickActions** - Quick access to common admin tasks

## Customization

- Modify `src/lib/mockData.js` to change the displayed data
- Update color scheme in `src/app/globals.css`
- Adjust layout in `src/app/page.jsx`

## License

MIT
