# Morrow & Bean POS — Café Point of Sale & Management System

> **A professional, offline-ready Point of Sale and Café Operations Management System developed by [Infinex Loop](https://infinexloop.netlify.app/).**

![Brand](https://img.shields.io/badge/Brand-Morrow%20%26%20Bean-38261F?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20TailwindCSS-C87553?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Hosting-Cloudflare%20Pages%20Ready-87977A?style=for-the-badge)

---

## ☕ Overview

**Morrow & Bean POS** is an enterprise-grade, touchscreen-optimized sales and restaurant management application built specifically for modern specialty coffee shops, artisan bakeries, and dine-in bistros.

Designed to operate seamlessly on counter tablets, desktop touch-monitors, and mobile staff handhelds, the software provides an end-to-end operational suite — from fast checkout and order customization to live Kitchen Display System (KDS), multi-floor table tracking, automated inventory deduction, loyalty rewards, and customer analytics.

This sales demonstration is fully client-side and offline-capable, storing all operational state locally with zero reliance on external databases or cloud latency.

---

## 🚀 Key Modules & Capabilities

The demonstration features 14 fully interactive operations, management, and business modules:

### 1. Operations
* **Point of Sale (POS Billing)**: High-speed item search, category filters, veg/non-veg toggle, multi-size variants, customizable add-ons (oat milk, syrups, extra shots), order notes, held orders management, percentage/flat discounts, guest assignment, split tender payments (Cash, UPI, Card), real-time change calculation, and 80mm thermal receipt previews.
* **Tables & Floor Management**: Real-time interactive floor plan across **Ground Floor** and **Terrace**, occupancy timers, running order viewer, quick-settle checkout, and live audio/visual table calling alert system with waiter acknowledgement.
* **Kitchen Display System (KDS)**: Live paperless tickets with station filtering (**Hot Kitchen**, **Coffee Bar / Beverages**, **All Stations**), preparation stages (`New` → `Preparing` → `Ready`), elapsed time warnings (target 15 min), and printable kitchen order tickets (KOT).
* **Orders & Bills**: Searchable historical bill ledger with date range and dining type filters, bill breakdown modals, receipt reprinting, voiding with mandatory manager reason logging, and one-click CSV report exports.

### 2. Management
* **Menu Management**: 36 preloaded artisan coffee, sourdough pizza, and bakery items across 7 categories. Includes variant configuration, recipe ingredient linking, category item counters, instant availability switches, and an Add/Edit item modal.
* **Inventory & Stock Control**: Real-time stock on hand with minimum threshold badges, total valuation, low-stock alerts, Stock In voucher creation with unit purchase pricing, and Adjustment/Waste logging with reason tracking.
* **Customer Relationship Management (CRM)**: Customer directory with spending statistics, visit frequency, loyalty tier indicators (Bronze, Silver, Gold, Platinum), order history drawer, and new customer registration.
* **Loyalty & Rewards Program**: Configurable points earning ratios, redemption thresholds, active rules card, 14-day points issued vs redeemed chart, and a leaderboard of top loyalty patrons.
* **QR Table Ordering**: Self-ordering QR code generation for every table with instant canvas rendering, printable table tent card layout, direct link copying, and guest mobile menu view (`/#/guest-menu?table=T1`).
* **Staff & Access Control**: Role-based staff profiles (**Manager**, **Cashier**, **Barista**, **Kitchen Lead**, **Server**) with 4-digit PIN authentication, individual shift performance metrics, and user management.

### 3. Business & Insights
* **Interactive Dashboard**: Real-time floor occupancy, daily revenue, active KOT counters, 14-day sales bar chart with table toggle, category sales distribution pie chart, top-performing items, hourly rush distribution, and an audit feed of recent staff actions.
* **Analytics & Reports**: Comprehensive business reporting across 6 analytical views (Sales Overview, Product Performance, Payment Method Breakdown, Staff Productivity, Customer Cohorts, and Loyalty Trends) with period filtering and CSV data export.
* **Settings & Printers**: Outlet identity configuration, GST tax rates, invoice numbering prefixes, local LAN server diagnostic monitor with connected devices, and browser print test routines for receipt and KOT printers.
* **Data Backup & Disaster Recovery**: Client-side JSON database snapshot download, backup file restoration, danger zone Demo Reset, and sample CSV data imports.

---

## 🔐 Demo Credentials

Quickly log in using any of the simulated staff accounts or enter the 4-digit PIN directly:

| Staff Member | Role | 4-Digit PIN | Permissions |
| :--- | :--- | :---: | :--- |
| **Adrian Mitchell** | Owner / Administrator | `1111` | Full administrative & void permissions |
| **Daniel Brooks** | Billing Counter | `2222` | POS billing, tables, orders & discounts |
| **Oliver Bennett** | Floor Captain | `3333` | Floor tables, table calls & mobile orders |
| **Sophia Carter** | Floor Captain | `4444` | Floor tables, table calls & mobile orders |
| **Ethan Parker** | Kitchen Staff | `5555` | Kitchen display system & inventory updates |

---

## 🎨 Brand Identity & Palette

* **Brand Name**: Morrow & Bean
* **Application Title**: Morrow & Bean POS
* **Tagline**: Café Point of Sale & Management System
* **Color Palette**:
  * **Primary (Deep Espresso)**: `#38261F` — grounding, rich, and commanding
  * **Secondary (Terracotta)**: `#C87553` — warm artisan warmth and callouts
  * **Accent (Sage Green)**: `#87977A` — fresh botanical accents and status badges
  * **Background (Warm Cream)**: `#FAF7F1` — soft, low-glare surface for all-day counter use
* **Typography**: *DM Sans* for structural display headers and *Inter* for legible tabular data.

---

## 🛠 Technology Stack

* **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build System**: [Vite 5](https://vitejs.dev/)
* **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with custom design tokens
* **Icons**: [Lucide React](https://lucide.dev/)
* **Charts**: [Recharts](https://recharts.org/)
* **Routing**: [React Router DOM](https://reactrouter.com/) (HashRouter for zero-config static hosting)
* **QR Codes**: [qrcode](https://www.npmjs.com/package/qrcode) canvas rendering
* **Package Manager**: [pnpm](https://pnpm.io/)
* **Testing & Inspection**: [Playwright](https://playwright.dev/)

---

## 💻 Local Installation & Development

### Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher
* [pnpm](https://pnpm.io/) v9.0.0 or higher

### Steps

1. **Clone or enter the project directory**:
   ```bash
   cd /path/to/cafe-pos-management-system
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the local development server**:
   ```bash
   pnpm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Run TypeScript check & production build**:
   ```bash
   pnpm run build
   ```
   The compiled production assets will be generated in the `dist/` directory.

5. **Preview production build locally**:
   ```bash
   pnpm run preview
   ```

---

## ☁️ Cloudflare Pages Deployment

This application is ready for static deployment on Cloudflare Pages, Netlify, or AWS S3 / CloudFront.

* **Build command**: `pnpm run build`
* **Build output directory**: `dist`
* **SPA Routing**: Handled via `public/_redirects` (`/* /index.html 200`) and React HashRouter (`/#/route`).

---

## ⚖️ Architecture & Privacy Notes

* **Client-Side Simulation**: This is an interactive sales demonstration. No external databases, merchant accounts, or payment gateways are connected.
* **Deterministic Demo Seed**: The application initializes with 30 days of realistic sales, 46 fictional customers, 36 curated food & drink items, and 12 floor tables.
* **Data Isolation**: All modifications are persisted in the browser's `localStorage` under the key `morrow_bean.pos.v1` and active staff sessions in `sessionStorage` under `morrow_bean.pos.session`.
* **Thermal Printing**: The receipt generator produces standard 80mm ESC/POS formatted print stylesheets via native browser print dialogs (`window.print()`).

---

## 🏢 Attribution

**Developed by [Infinex Loop](https://infinexloop.netlify.app/). All rights reserved.**

Visit [infinexloop.netlify.app](https://infinexloop.netlify.app/) to learn more about our enterprise retail software solutions, custom POS architectures, and digital ordering platforms.
