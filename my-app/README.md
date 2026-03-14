# Refinery Purchase Order System

A Buyer-facing Purchase Order system for refinery equipment. Built with **AdonisJS**, **React** (Inertia), and **PostgreSQL**. Supports catalog search, PO draft creation, single-supplier enforcement, submission, and status tracking with an activity log.

## Tech stack

- **Backend:** AdonisJS 7, Lucid ORM, Vine validators
- **Frontend:** React 19, Inertia.js, Vite
- **Database:** PostgreSQL (with single-supplier trigger and status timeline table)
- **API:** REST JSON; OpenAPI spec included

## Prerequisites

- Node.js >= 24
- PostgreSQL
- Catalog seed data: place `refinery_items_50_5suppliers_strict.json` in the `requirements` folder (one level up from this app, or adjust the seeder path)

## Setup

1. **Clone and install**
   ```bash
   cd my-app
   npm install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `APP_KEY` (generate with `node ace generate:key` if needed)
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` for PostgreSQL

3. **Database**
   ```bash
   node ace migration:run
   node ace db:seed --files "database/seeders/catalog_item_seeder"
   node ace db:seed --files "database/seeders/purchase_order_sample_seeder"
   ```
   Ensure the catalog seeder can read the JSON path (see `database/seeders/catalog_item_seeder.ts`).

4. **Run**
   ```bash
   npm run dev
   ```
   App: http://localhost:3333

## Main URLs

| Page | URL |
|------|-----|
| Home | `/` |
| Catalog (search, filter, sort, add to draft) | `/buyer/catalog` |
| PO Draft (header → review → submit) | `/buyer/draft` |
| Purchase orders list | `/buyer/purchase-orders` |
| PO detail + activity log | `/buyer/purchase-orders/:id` |

## Features

- **Catalog:** Search by name, id, supplier, manufacturer, model; filter by category and in-stock; sort by price, lead time, supplier. Debounced search and URL query params.
- **Draft:** First item defines supplier; all lines must be same supplier (409 on mismatch). Header (requestor, cost center, needed-by, payment terms), review with line edit/remove, submit with PO number. Draft id persisted in `localStorage`.
- **PO list & detail:** List POs with status filter; detail shows lines and **activity log** (status timeline: when, from→to, reason).
- **Backend:** Catalog and Procurement API boundaries; single-supplier enforced in API and via DB trigger; status events stored in `purchase_order_status_events`.

## API

- **Catalog:** `GET /api/catalog/items?q=&category=&inStock=&sort=`
- **Procurement:** `POST/GET/PATCH/DELETE /api/procurement/drafts/*`, `POST /api/procurement/drafts/:id/submit`, `GET/POST /api/procurement/purchase-orders/*`

See `openapi.yaml` in the project root for the full API spec.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `node ace migration:run` | Run migrations |
| `node ace db:seed --files "database/seeders/catalog_item_seeder"` | Seed catalog |
| `node ace db:seed --files "database/seeders/purchase_order_sample_seeder"` | Seed sample POs and activity log |

## License

UNLICENSED
