# ParkSpot - Real-Time Car Parking Land Rental Booking Portal

A full-stack web application connecting land owners with event organizers and individuals seeking temporary parking solutions.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Leaflet/OpenStreetMap
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Payments**: Razorpay (UPI, Cards, Net Banking)
- **Maps**: Leaflet + OpenStreetMap (free, no API key needed)

## Features

- Interactive map-based parking land discovery
- Auto-calculation of parking capacity (2-wheeler + 4-wheeler spots)
- Dynamic pricing (peak hours, weekends, events)
- Real-time availability checking
- Secure payment via Razorpay (UPI/GPay/Paytm, Cards)
- Land registration with map boundary drawing
- Rating and review system
- Admin dashboard for land verification and dispute resolution
- User authentication with JWT

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Setup

```bash
# Clone and enter project
cd parkspot

# Backend setup
cd server
npm install
npm run seed    # Creates demo data
npm run dev     # Starts on port 5000

# Frontend setup (new terminal)
cd client
npm install
npm run dev     # Starts on port 5173
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@parkspot.in | admin123 |
| Land Owner | rajesh@parkspot.in | owner123 |
| Customer | amit@parkspot.in | customer123 |

### Environment Variables

Copy `.env.example` to `.env` in the server directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parkspot
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
```

## Project Structure

```
parkspot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API service layer
│   │   └── utils/          # Helpers and constants
│   └── ...
└── server/                 # Node.js backend
    └── src/
        ├── config/         # DB, Razorpay, CORS
        ├── models/         # Mongoose schemas (6)
        ├── routes/         # Express routes (6)
        ├── controllers/    # Business logic (6)
        ├── middleware/      # Auth, upload, validation
        └── utils/          # Pricing, capacity calc
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Lands
- `GET /api/lands` - List approved lands
- `POST /api/lands` - Register land (owner)
- `GET /api/lands/:id` - Get land details
- `PUT /api/lands/:id/verify` - Verify land (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - My bookings
- `GET /api/bookings/availability` - Check availability

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews/land/:landId` - Get land reviews

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/disputes` - List disputes
