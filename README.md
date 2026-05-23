# 🚀 JobScoutAI — AI-Powered Job Alert System

JobScoutAI is a modern, high-performance job tracking and scraping application built with Next.js, Supabase, Prisma, and Playwright. It automatically aggregates job listings from top remote platforms, filters them using smart heuristics, and delivers real-time notifications to help job seekers apply faster.

> [!TIP]
> This platform runs automated scraping bots every 4 hours, ensuring you receive matching developer and remote listings before they appear on standard aggregates.

---

## 🌟 Key Features

*   🔄 **Automated Sync & Scraping**: Scheduled scraping of 8+ major platforms (including We Work Remotely, Wellfound, Working Nomads, Remote.co, OnlineJobs.ph) using **Playwright**.
*   🧠 **AI Smart Filtering**: Define custom profiles with role preferences, keywords, and salary ranges to display only relevant roles.
*   🛡️ **Scam Job Detection**: Integrated classification system flags suspicious listings before they waste your time.
*   🔔 **Instant Notification Channels**: Email and Telegram alerts deliver new matching jobs directly to you within minutes of posting.
*   📊 **Application Tracker**: Sleek dashboard to organize and track application states (Saved, Applied, Interviewing, Offer, Rejected).
*   💼 **Market Salary Insights**: Provides real-time salary analytics gathered across Philippines-specific and international job listings.
*   💳 **Monetization**: Complete PayPal and Stripe payment gateways for Basic Pro and Elite plan subscriptions.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 16 (App Router)
*   **Library**: React 19 & React DOM
*   **Styling**: Tailwind CSS v4 & PostCSS
*   **Animations**: GSAP (GreenSock Animation Platform) & `@gsap/react`
*   **Icons**: Lucide React

### Backend & Infrastructure
*   **Database**: Supabase (PostgreSQL)
*   **ORM**: Prisma Client
*   **Authentication**: Supabase Auth (with Google OAuth support)
*   **Scraper Engine**: Playwright
*   **Sync / Cron**: Node-cron worker scripts
*   **Emails**: Nodemailer

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [npm](https://www.npmjs.com/) installed.

### ⚙️ Environment Configuration

Create a `.env` (or `.env.local`) file in the root directory. You will need keys for:
*   Supabase Database URL (`DATABASE_URL`, `DIRECT_URL`)
*   Supabase Client Credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
*   Payment Gateways (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`)
*   SMTP credentials for Nodemailer alerts

### 🛠️ Installation

1.  **Clone the repository and install dependencies**:
    ```bash
    npm install
    ```

2.  **Synchronize your Prisma schema** with your database:
    ```bash
    npx prisma db push
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Directory Structure

```
smart-job-tracker/
├── app/                  # Next.js App Router (pages & API routes)
├── components/           # Reusable UI component library
├── lib/                  # Shared utility modules and core logic
├── prisma/               # Prisma Database Schemas and seeds
├── public/               # Static assets (images, favicon, logo)
│   ├── jobscoutai.png    # New Brand Logo
│   └── logo old.png      # Previous Backup Logo
├── scrape-worker/        # Standalone scraper worker and Playwright automation
└── utils/                # Supabase helpers and server utility functions
```

---

## 🛡️ License

This project is private and proprietary. All rights reserved.
