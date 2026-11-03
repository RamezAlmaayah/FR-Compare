# FR Compare

Supplier Quotation Management and Comparison System

FR Compare is a MERN full-stack procurement application for managing suppliers, catalog items, RFQs, quotations, quotation comparison, purchasing decisions, supplier ratings, and historical prices.

## Features

- User Registration and Login
- Supplier Management
- Item Catalog
- RFQ Management
- Quotation Management
- Automatic Quotation Calculations
- Side-by-Side Quotation Comparison
- Cheapest Offer Analysis
- Cheapest Supplier per Item
- Split Award Analysis
- Weighted Best Value Scoring
- Winner Selection
- Supplier Rating
- Historical Paid Prices
- Dashboard
- Responsive UI

## Technology Stack

Frontend: React, JavaScript, React Router, Axios, Bootstrap, and CSS. Vite provides development and production builds.

Backend: Node.js, Express.js, JWT, bcryptjs, and Multer.

Database: MongoDB and Mongoose.

## Project Structure

```text
FR Compare Project/
├── backend/                           # REST API, models, controllers, middleware, and tests
├── frontend/                          # React pages, shared components, styles, and local artwork
├── FR_Compare_Project_Requirements.md  # Project requirements and functional rules
├── DESIGN.md                          # Approved UI design specification
└── README.md
```

The backend follows MVC-style routes → controllers → models. The frontend uses a shared Axios client and authentication context.

## Setup

Install Node.js with npm and have a running MongoDB instance available.

### Backend

```sh
cd backend
npm install
```

Create `backend/.env` based on `backend/.env.example`. Set `PORT` (normally `5000`), `MONGO_URI` to your MongoDB connection URI, and `JWT_SECRET` to a securely generated secret. Keep this file local and never commit credentials.

```sh
npm run dev
```

For normal server startup without the development watcher, use `npm start`. Uploaded supplier and quotation images are stored locally in `backend/uploads/` and are not included in Git.

### Frontend

In a separate terminal:

```sh
cd frontend
npm install
```

Create `frontend/.env` based on `frontend/.env.example`. `VITE_SERVER` is the public API base URL, normally `http://localhost:5000/api`; never put secrets in frontend environment variables.

```sh
npm run dev
```

The normal frontend URL is `http://localhost:5173`; use the URL printed by Vite if that port is occupied.

Build the frontend with `npm run build`, or preview the production build with `npm run preview`.

## Testing

With the backend running and its environment configured, run these existing scripts from `backend/`:

```sh
npm run test:phase4
npm run test:phase5
npm run test:phase6
npm run test:phase7
```

These integration tests exercise the API and MongoDB. Use a dedicated local test database; the suites create temporary fixtures and clean up their own records.

From `frontend/`, run `npm run build` to verify the production build.

## Author

FR Compare project author.
