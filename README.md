# BizFlow ERP — Local Development Edition

A feature-rich, MongoDB-backed business management workspace. This ZIP contains a runnable web MVP with authentication, dashboard analytics, product/inventory management, sales, purchases, customers, suppliers, expenses, employees, departments, invoices, reports, activity log and workspace settings.

## Technology

- Frontend: React 18, TypeScript, Vite, Recharts, Lucide
- Backend: Node.js, Express, TypeScript, Mongoose, JWT, Zod
- Database: MongoDB local or MongoDB Atlas
- Optional extension scaffolds: PHP integration adapter, Java enterprise adapter, Flutter mobile integration notes

> Important: the PHP, Java and Flutter folders are integration scaffolds, not completed production services. The runnable web application uses Node.js/Express as its API and MongoDB as its database. No MySQL or phpMyAdmin is used.

## Requirements

- macOS (Apple Silicon M1/M2/M3/M4) or Windows/Linux
- Node.js 20 LTS or newer
- npm 10+
- MongoDB Community Server running locally **or** a MongoDB Atlas connection string

## 1. Install

Open Terminal in the extracted `bizflow-erp` folder:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

## 2. Configure MongoDB

Copy the example environment file:

```bash
cp server/.env.example server/.env
```

For local MongoDB, keep:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/bizflow_erp
```

If using MongoDB Atlas, replace the value with your Atlas connection string. Add your current IP to Atlas Network Access and URL-encode special characters in the database password. Never commit `.env` to GitHub.

Set a strong JWT secret. On macOS/Linux you can generate one with:

```bash
openssl rand -base64 32
```

Paste it into `JWT_SECRET` in `server/.env`.

## 3. Seed demo data

Make sure MongoDB is running, then run:

```bash
npm run seed
```

This creates sample products, customers, suppliers, employees, departments, sales, purchases and expenses. **Seed clears the BizFlow collections before inserting demo data. Do not run it against a database containing data you want to keep.**

Demo login:

- Email: `admin@bizflow.local`
- Password: `Admin@12345`

Change the demo password and JWT secret before exposing the app to a network.

## 4. Start the app

From the project root:

```bash
npm run dev
```

Open:

- Web app: http://localhost:5173
- API health: http://localhost:4000/api/health

Or run services separately in two Terminal tabs:

```bash
npm run dev --prefix server
```

```bash
npm run dev --prefix client
```

## Features in this edition

- JWT login and protected routes; first-admin registration endpoint is available at `POST /api/auth/register` only while the user collection is empty
- Role field support: admin, manager, staff; delete operations restricted to admin/manager
- Dashboard KPIs, monthly sales chart, recent transactions, activity feed and low-stock indicator
- Product catalogue, SKU uniqueness, pricing, opening stock and reorder thresholds
- Customers and suppliers CRUD
- Sales and purchase records
- Expenses, employees, departments and invoices CRUD
- Inventory adjustment API: `POST /api/inventory/adjust`
- Sales checkout API: `POST /api/sales/checkout` with stock validation and automatic stock deduction
- Search, pagination-ready API, CSV export from module lists
- Reports summary and local workspace preferences
- Responsive desktop/tablet/mobile layout

## API overview

All endpoints except health and auth are protected with `Authorization: Bearer <token>`.

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET|POST /api/products`, `PATCH|DELETE /api/products/:id`
- Same CRUD pattern for `customers`, `suppliers`, `sales`, `purchases`, `expenses`, `employees`, `departments`, `invoices`, `activities`, `settings`
- `POST /api/sales/checkout`
- `POST /api/inventory/adjust`
- `GET /api/reports/summary`

## Notes / next production steps

This is a substantial local portfolio MVP, not a fully audited ERP product. Before production use, add automated tests, stronger per-module authorization, audit trails for all sensitive updates, transactional stock and sales writes (MongoDB replica set), file uploads, password reset, refresh-token rotation, backups, monitoring, and deployment secrets. The current UI uses a generic record editor for most modules; a dedicated POS checkout, payroll, accounting ledger, tax rules and multi-warehouse workflow are suitable next phases.

## Troubleshooting

**MongoDB connection refused**: start MongoDB Community Server, or use a valid Atlas URI in `server/.env`.

**CORS error**: ensure `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`, then restart the API.

**Port in use**: change `PORT` in `server/.env` or stop the process using port 4000/5173.

**Login fails**: run `npm run seed` once against the intended empty development database, then use the demo login above.
