# ParkSpot - Real-Time Car Parking Land Rental Booking Portal

A **mobile application** that connects land owners with event organizers and individuals seeking temporary parking solutions for weddings, conferences, and large gatherings.

## Live Server

| Service | URL |
|---------|-----|
| Backend API | `https://parkspot-ao4f.onrender.com` |
| Health Check | `https://parkspot-ao4f.onrender.com/api/health` |
| Database | MongoDB Atlas (Cloud) |

## Tech Stack

### Mobile App (Flutter)
- **Framework**: Flutter 3.44 + Dart 3.12
- **State Management**: Provider
- **Maps**: flutter_map + OpenStreetMap (free, no API key)
- **HTTP**: http package with timeout handling
- **Payments**: Razorpay Flutter SDK (UPI, GPay, Paytm, Cards)
- **Location**: Geolocator for GPS
- **Storage**: shared_preferences for local token storage

### Backend (Node.js)
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21
- **Database**: MongoDB 8.0 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Razorpay Server SDK
- **File Upload**: Multer
- **Validation**: express-validator

### Cloud Infrastructure
- **Database**: MongoDB Atlas M0 Free Tier
- **Hosting**: Render.com (Node.js Web Service)
- **Payments**: Razorpay (Test Mode)

## Features

### For Customers
- Interactive map showing all available parking lands
- Real-time availability checking
- Vehicle type selection (2-wheeler / 4-wheeler)
- Dynamic pricing display (peak hours, weekends)
- Secure payment via UPI, GPay, Paytm, Cards
- Booking history and status tracking
- Rating and review system

### For Land Owners
- Register parking land with map boundary
- Auto-calculated parking capacity from land area
- Dynamic pricing rules
- Booking notifications
- Revenue tracking

### For Admin
- Land verification and approval
- Dispute resolution
- User management
- Platform analytics

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@parkspot.in | admin123 |
| Land Owner | rajesh@parkspot.in | owner123 |
| Customer | amit@parkspot.in | customer123 |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/seed` | GET | Seed demo data |
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/profile` | GET | Get profile |
| `/api/lands` | GET | List lands |
| `/api/lands` | POST | Register land |
| `/api/lands/:id` | GET | Land details |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/my` | GET | My bookings |
| `/api/bookings/availability` | GET | Check availability |
| `/api/payments/create-order` | POST | Create payment order |
| `/api/payments/verify` | POST | Verify payment |
| `/api/reviews` | POST | Submit review |
| `/api/admin/dashboard` | GET | Admin stats |

## Project Structure

```
parkspot/
├── client/                     # React Web Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level pages (12 pages)
│   │   ├── context/            # Auth context
│   │   ├── services/           # API service layer (7 files)
│   │   └── utils/              # Helpers
│   └── ...
│
├── server/                     # Node.js Backend API
│   └── src/
│       ├── config/             # DB, Razorpay, CORS
│       ├── models/             # Mongoose schemas (6 models)
│       ├── routes/             # Express routes (7 files)
│       ├── controllers/        # Business logic (6 files)
│       ├── middleware/          # Auth, upload, validation
│       ├── utils/              # Pricing, capacity calc
│       └── server.js           # Entry point
│
├── parkspot_mobile/            # Flutter Mobile Application
│   └── lib/
│       ├── config/             # API config
│       ├── models/             # Data models (4 files)
│       ├── services/           # API service
│       ├── providers/          # Auth state management
│       ├── screens/            # App screens (8 screens)
│       └── utils/              # Helpers
│
├── render.yaml                 # Cloud deployment config
├── DEPLOY.md                   # Deployment guide
└── PROJECT-DOCUMENTATION.md    # Full project documentation
```

## Quick Start

### Backend Server
```bash
cd server
npm install
npm run seed    # Populate demo data
npm run dev     # Start on port 5000
```

### Mobile App (Flutter)
```bash
cd parkspot_mobile
flutter pub get
flutter run          # Run on emulator/device
flutter build apk --release   # Build APK
```

## Deployment

### Render.com (Current Live Server)
1. Push code to GitHub
2. Connect repo on Render.com
3. Build: `cd server && npm install`
4. Start: `cd server && node src/server.js`
5. Add env vars (MONGODB_URI, JWT_SECRET, RAZORPAY keys)

### Environment Variables
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
CLIENT_URL=https://your-app.onrender.com
```

## License

MIT License

## Contact

Mithesh D - mithesh1892@gmail.com
