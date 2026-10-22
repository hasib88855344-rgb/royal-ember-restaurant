# Royal Ember — Luxury Restaurant Website

A responsive restaurant website starter with 26 menu items, category filters, search, cart, checkout, Express API, MongoDB order storage, and protected demo admin API routes.

## Requirements
- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally
1. Install Node.js from https://nodejs.org if you do not already have it.
2. Install/start MongoDB locally, or create a MongoDB Atlas database.
3. Open a terminal in this project folder.
4. Run `npm install`
5. Copy `.env.example` to `.env` and update `MONGODB_URI` and `ADMIN_KEY`.
6. Run `npm start`
7. Open http://localhost:3000

The page can render even if MongoDB is unavailable, but the order API will return a database-not-connected message until MongoDB connects.

## API routes
- `GET /api/health` — server/database health
- `GET /api/menu` — menu items
- `POST /api/orders` — validates and saves an order to MongoDB
- `GET /api/admin/orders` — lists recent orders; send `x-admin-key` header
- `PATCH /api/admin/orders/:id` — changes order status; send `x-admin-key` header and JSON `{ "status": "Preparing" }`

## Important before production
This is a portfolio/demo starter, not a production-ready payment or reservation system. Replace the demo admin-key approach with proper administrator authentication, add rate limiting and stronger validation, configure HTTPS and secure deployment secrets, and connect a real reservation/email/SMS/payment provider if needed. Reservation requests and newsletter submissions are browser-only demo interactions. Online payments are not enabled. Food photos use remote Unsplash image URLs and therefore require an internet connection.
