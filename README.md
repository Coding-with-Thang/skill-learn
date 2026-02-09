# Skill-Learn 🎓

> AI-Powered Learning Management System with Gamification

Skill-Learn is a comprehensive, multi-tenant Learning Management System (LMS) designed to make workplace training engaging and effective. Built with modern web technologies, it combines personalized learning paths, interactive quizzes, gamification, and rewards to accelerate skill development.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=white)

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Applications](#-applications)
- [Shared Packages](#-shared-packages)
- [Multi-Tenant RBAC](#-multi-tenant-rbac)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Documentation](#-documentation)

## ✨ Features

### 📚 Learning Management

- **Course Management** - Create, edit, and publish training courses with rich text content
- **Category Organization** - Organize content by skill areas and topics
- **Progress Tracking** - Real-time progress monitoring across courses and quizzes
- **Personalized Learning** - AI-driven recommendations based on user performance

### 📝 Interactive Quizzes

- **Quiz Builder** - Create quizzes with multiple-choice questions
- **Media Support** - Add images and videos to questions
- **Time Limits** - Configure timed assessments
- **Scoring System** - Configurable passing scores with instant feedback
- **Question Review** - Optional review of answers after completion

### 🎮 Gamification

Built-in games to make learning fun and engaging:

| Game | Genre | Description |
|------|-------|-------------|
| **Tic Tac Toe** | Strategy | Classic game against AI |
| **Emoji Memory** | Brain Teaser | Match emoji pairs before time runs out |
| **Guessing Game** | Logic | Number guessing challenge |
| **Rock Paper Scissors** | Casual | Classic hand game |

### 🏆 Rewards & Points System

- **Points Economy** - Earn points by completing courses and quizzes
- **Daily Streaks** - Bonus points for consecutive daily logins
- **Rewards Catalog** - Redeem points for prizes and perks
- **Redemption Limits** - One-time and multiple redemption rewards
- **Featured Rewards** - Highlight special offers

### 📊 Leaderboards & Analytics

- **Lifetime Points Leaderboard** - Track top performers by total points
- **Quiz Performance Leaderboard** - Rankings by average quiz scores
- **Podium Display** - Visual top 3 showcase
- **Admin Dashboard** - Comprehensive analytics and user activity tracking

### 👤 User Features

- **Personalized Dashboard** - Welcome banner, daily activities, achievements
- **Profile Management** - User details and settings
- **Achievement Badges** - Recognition for milestones
- **Topic Progress** - Visual progress indicators per category

### 🔐 Admin Capabilities

- **User Management** - Create, update, and manage user accounts
- **Content Administration** - Full CRUD for courses, quizzes, and categories
- **Reward Configuration** - Set up and manage rewards catalog
- **Audit Logging** - Complete activity tracking for compliance
- **System Settings** - Configure platform behavior

## 🏗 Architecture

Skill-Learn uses a **monorepo architecture** powered by Turborepo with two main applications:

```
┌─────────────────────────────────────────────────────────────┐
│                      Turborepo Monorepo                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │       LMS        │        │       CMS        │          │
│  │   (Port 3000)    │        │   (Port 3001)    │          │
│  │                  │        │                  │          │
│  │  • User Portal   │        │  • Super Admin   │          │
│  │  • Admin Panel   │        │  • Tenant Mgmt   │          │
│  │  • Quizzes       │        │  • Billing       │          │
│  │  • Games         │        │  • Analytics     │          │
│  │  • Rewards       │        │                  │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│  ┌────────────────────┴────────────────────┐               │
│  │           Shared Packages               │               │
│  ├──────────────────────────────────────────┤               │
│  │  @skill-learn/database  │ Prisma + MongoDB│               │
│  │  @skill-learn/ui        │ UI Components   │               │
│  │  @skill-learn/lib       │ Utils & Hooks   │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **Tailwind CSS 4** | Styling |
| **Framer Motion** | Animations |
| **Recharts** | Data visualization |
| **Lucide React** | Icons |
| **TipTap** | Rich text editor |

### Backend & Data

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Backend API |
| **Prisma** | Database ORM |
| **MongoDB** | Database |
| **Firebase Storage** | File storage |

### Authentication & Security

| Technology | Purpose |
|------------|---------|
| **Clerk.js** | Authentication |
| **Svix** | Webhook verification |
| **Zod** | Schema validation |

### State & Forms

| Technology | Purpose |
|------------|---------|
| **Zustand** | State management |
| **React Hook Form** | Form handling |
| **Axios** | HTTP client |

### Build & Development

| Technology | Purpose |
|------------|---------|
| **Turborepo** | Monorepo management |
| **ESLint** | Code linting |
| **npm Workspaces** | Package management |

## 📁 Project Structure

```
skill-learn/
├── apps/
│   ├── lms/                    # Learning Management System
│   │   ├── app/
│   │   │   ├── (lms)/
│   │   │   │   ├── (admin)/   # Admin dashboard routes
│   │   │   │   ├── (auth)/    # Authentication pages
│   │   │   │   └── (user)/    # User-facing routes
│   │   │   ├── (public)/      # Public pages
│   │   │   └── api/           # API routes
│   │   ├── components/        # LMS-specific components
│   │   ├── config/            # Configuration files
│   │   └── lib/               # App-specific utilities
│   │
│   └── cms/                    # Content Management System
│       ├── app/
│       │   ├── api/           # CMS API routes
│       │   └── cms/           # CMS dashboard routes
│       ├── components/        # CMS-specific components
│       └── lib/               # CMS utilities
│
├── packages/
│   ├── database/              # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   └── index.js           # Prisma client export
│   │
│   ├── ui/                    # Shared UI components
│   │   └── components/        # 50+ reusable components
│   │
│   └── lib/                   # Shared utilities
│       ├── hooks/             # Custom React hooks
│       ├── stores/            # Zustand stores
│       └── utils/             # Utility functions
│
├── docs/                      # Documentation
├── public/                    # Static assets
├── turbo.json                 # Turborepo configuration
└── package.json               # Root package configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** database (local or Atlas)
- **Clerk** account for authentication
- **Firebase** project for storage (optional)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd skill-learn
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

4. **Generate Prisma client**

```bash
npm run prisma:generate
```

5. **Start development servers**

```bash
npm run dev
```

This starts both applications:
- **LMS**: http://localhost:3000
- **CMS**: http://localhost:3001

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# ============================================
# Database
# ============================================
MONGODB_URI=mongodb+srv://your-connection-string

# ============================================
# Clerk Authentication
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# ============================================
# Firebase Storage
# ============================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com

# ============================================
# Stripe Payment Integration
# ============================================
# Get these from your Stripe Dashboard: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (optional - create products/prices in Stripe Dashboard)
# These are used for subscription plans (Starter, Pro, and Enterprise)
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_ANNUAL_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...

# ============================================
# Application URLs
# ============================================
NEXT_PUBLIC_LMS_URL=http://localhost:3000
NEXT_PUBLIC_CMS_URL=http://localhost:3001
```

## 📜 Available Scripts

Run from the project root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps for production |
| `npm run start` | Start all apps in production mode |
| `npm run lint` | Run ESLint across all packages |
| `npm run clean` | Clean build artifacts and node_modules |
| `npm run prisma:generate` | Generate Prisma client |

## 📱 Applications

### LMS (Learning Management System)

The main user-facing application for learners and administrators.

**User Routes:**
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/home` | User dashboard |
| `/quiz` | Quiz listing |
| `/quiz/start/[quizId]` | Take a quiz |
| `/training` | Training courses |
| `/games` | Mini-games hub |
| `/rewards` | Rewards catalog |
| `/leaderboard` | Rankings |
| `/achievements` | User achievements |

**Admin Routes:**
| Route | Description |
|-------|-------------|
| `/dashboard` | Admin overview |
| `/dashboard/users` | User management |
| `/dashboard/courses` | Course management |
| `/dashboard/quizzes` | Quiz management |
| `/dashboard/rewards` | Rewards configuration |
| `/dashboard/categories` | Category management |
| `/dashboard/audit-logs` | Activity logs |
| `/dashboard/settings` | System settings |

### CMS (Content Management System)

Super admin dashboard for managing the entire platform.

| Route | Description |
|-------|-------------|
| `/cms` | Dashboard overview |
| `/cms/tenants` | Tenant management |
| `/cms/tenants/[tenantId]` | Tenant details |
| `/cms/billing` | Billing & subscriptions |

## 📦 Shared Packages

### @skill-learn/database

Prisma client and database schema.

```javascript
import { prisma } from '@skill-learn/database';

const users = await prisma.user.findMany();
```

**Models:**
- `User` - User accounts with Clerk integration
- `Category` - Content categories
- `Quiz` / `Question` / `Option` - Quiz system
- `Course` - Training courses
- `Reward` / `RewardLog` - Rewards system
- `PointLog` / `CategoryStat` - Gamification
- `Tenant` / `TenantRole` / `UserRole` - Multi-tenancy
- `Permission` / `RoleTemplate` - RBAC
- `AuditLog` - Activity tracking
- `SystemSetting` - Configuration

### @skill-learn/ui

50+ reusable UI components built with Radix UI and Tailwind CSS.

```javascript
import { Button } from '@skill-learn/ui/components/button';
import { Card } from '@skill-learn/ui/components/card';
import { Dialog } from '@skill-learn/ui/components/dialog';
```

**Component Categories:**
- **Forms**: Input, Select, Checkbox, Switch, Textarea
- **Feedback**: Alert, Dialog, Toast (Sonner), Loader
- **Data Display**: Card, Table, Avatar, Badge
- **Navigation**: Breadcrumb, Sidebar, Dropdown Menu
- **Charts**: LineChart, PieChart
- **Overlays**: Sheet, Popover, Tooltip, Hover Card

### @skill-learn/lib

Shared utilities, hooks, and state stores.

**Hooks:**
```javascript
import { useDebounce } from '@skill-learn/lib/hooks/useDebounce';
import { useLocalStorage } from '@skill-learn/lib/hooks/useLocalStorage';
import { useMobile } from '@skill-learn/lib/hooks/useMobile';
```

**Zustand Stores:**
```javascript
import { usePointsStore } from '@skill-learn/lib/stores/pointsStore';
import { useRewardStore } from '@skill-learn/lib/stores/rewardStore';
import { useQuizStore } from '@skill-learn/lib/stores/quizStore';
```

**Utilities:**
- `axios` - Configured HTTP client
- `rateLimit` - API rate limiting
- `auditLogger` - Activity logging
- `formatNumbers` / `formatTime` - Formatting helpers

## 🔐 Multi-Tenant RBAC

Skill-Learn supports multi-tenant architecture with role-based access control.

### Tenant Hierarchy

```
Super Admin (CMS)
    └── Tenant (Organization)
            ├── Tenant Admin
            │       └── TenantRole (custom roles)
            │               └── Permissions
            └── Users
                    └── UserRole assignments
```

### Permission System

- **Global Content**: Quizzes, courses, and rewards can be marked as global (available to all tenants)
- **Role Templates**: Pre-defined role configurations for quick tenant setup
- **Custom Roles**: Tenant admins can create custom roles with specific permissions
- **Role Slots**: Subscription-based limits on the number of roles per tenant

### Subscription Tiers

| Tier | Users | Features |
|------|-------|----------|
| **Free** | Up to 5 | Basic courses, community access |
| **Pro** ($12.99/mo) | Up to 100 | AI coaching, priority support, certifications |
| **Enterprise** | Unlimited | Custom integrations, SLA, dedicated support |

## 🔌 API Endpoints

### User APIs (`/api/user/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user` | GET | Get current user profile |
| `/api/user/dashboard` | GET | Dashboard data |
| `/api/user/points` | GET | User points balance |
| `/api/user/points/add` | POST | Add points |
| `/api/user/points/spend` | POST | Spend points |
| `/api/user/rewards` | GET | Available rewards |
| `/api/user/rewards/redeem` | POST | Redeem a reward |
| `/api/user/quiz/start` | POST | Start a quiz session |
| `/api/user/quiz/finish` | POST | Submit quiz answers |
| `/api/user/streak` | GET | Current streak info |

### Admin APIs (`/api/admin/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET/POST | User management |
| `/api/admin/users/points` | POST | Award points |
| `/api/admin/quizzes` | GET/POST | Quiz management |
| `/api/admin/categories` | GET/POST | Category management |
| `/api/admin/courses` | GET/POST | Course management |
| `/api/admin/rewards` | GET/POST | Rewards management |
| `/api/admin/audit-logs` | GET | Activity logs |
| `/api/admin/settings` | GET/PUT | System settings |

### Public APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET | List categories |
| `/api/courses` | GET | List courses |
| `/api/leaderboard/points` | GET | Points leaderboard |
| `/api/leaderboard/quiz-score` | GET | Quiz leaderboard |

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Configure build settings**:
   - Framework: Next.js
   - Root Directory: `apps/lms` or `apps/cms`
3. **Set environment variables** in Vercel dashboard
4. **Configure Clerk webhook** URL to point to production

### Environment Setup per App

For separate deployments:

```bash
# LMS App
NEXT_PUBLIC_APP_URL=https://lms.yourdomain.com

# CMS App  
NEXT_PUBLIC_APP_URL=https://cms.yourdomain.com
```

### Database Setup

1. Create a MongoDB Atlas cluster
2. Configure network access (IP whitelist)
3. Create database user
4. Copy connection string to `MONGODB_URI`

## 📚 Documentation

Additional documentation is available in the `/docs` directory:

| Document | Description |
|----------|-------------|
| [MONOREPO_TECH_STACK_INTEGRATION.md](docs/MONOREPO_TECH_STACK_INTEGRATION.md) | Tech stack integration guide |
| [CLERK_ENVIRONMENT_SETUP.md](docs/CLERK_ENVIRONMENT_SETUP.md) | Clerk authentication setup |
| [CMS_AUTHENTICATION_SETUP.md](docs/CMS_AUTHENTICATION_SETUP.md) | CMS auth configuration |
| [API_ERROR_HANDLING.md](docs/API_ERROR_HANDLING.md) | API error handling patterns |
| [FORM_STANDARDIZATION.md](docs/FORM_STANDARDIZATION.md) | Form component standards |
| [THEME_GUIDE.md](docs/THEME_GUIDE.md) | Theming and styling guide |
| [VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) | Deployment instructions |

## 🔒 Security

- All API endpoints are protected with Clerk authentication
- Rate limiting is implemented on sensitive endpoints
- Webhook signatures are verified using Svix
- Role-based access control for all admin functions
- Audit logging for compliance and security monitoring

## 📞 Support

For technical support or questions, please contact the development team.

---

<p align="center">
  <strong>Skill-Learn</strong> — Proprietary Software. All Rights Reserved.
</p>
