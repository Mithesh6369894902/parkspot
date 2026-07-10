# ParkSpot - Real-Time Car Parking Land Rental Booking Portal

## Project Documentation

---

## 1. Title

**ParkSpot: A Real-Time Car Parking Land Rental Booking Portal Using Location-Based Services and Secure Payment Integration**

---

## 2. Abstract

Event organizers and corporate entities face significant challenges in finding temporary parking solutions for large-scale events, conferences, weddings, and gatherings. Existing parking infrastructure is often insufficient, expensive, or poorly located relative to event venues. This project presents ParkSpot, a mobile application that connects land owners (suppliers) with event organizers and individuals (customers) seeking temporary parking solutions.

ParkSpot enables real-time location-based discovery of available parking lands using interactive maps, instant booking with dynamic pricing mechanisms, and secure online payment processing through multiple gateways including UPI (Google Pay, PhonePe, Paytm), debit cards, and credit cards. The application implements a rating and review system to build trust among stakeholders, an administrative dashboard for land verification and dispute resolution, and push notifications for real-time booking updates.

The system uses a MERN stack (MongoDB, Express.js, React.js, Node.js) for the backend and web interface, with a Flutter-based cross-platform mobile application for Android and iOS. Leaflet with OpenStreetMap provides free, API-key-free mapping services. The application auto-calculates parking capacity based on land area, distinguishing between two-wheeler and four-wheeler parking spaces. Dynamic pricing adjusts rates based on peak hours, weekends, and special events.

The proposed system eliminates the middleman in temporary parking arrangements, provides transparent pricing, ensures secure transactions, and creates a trust ecosystem through verified listings and user reviews.

---

## 3. Feasibility Study

### 3.1 Technical Feasibility
- **Technology Stack**: The project uses well-established, open-source technologies (Flutter, Node.js, MongoDB, Express.js) that are widely supported and documented
- **Mapping Services**: Leaflet with OpenStreetMap provides free mapping without API key costs, making it commercially viable
- **Payment Gateway**: Razorpay supports UPI, cards, and net banking in India with easy integration and test mode for development
- **Cloud Hosting**: MongoDB Atlas (free tier) and Render.com provide cloud infrastructure at zero cost during development
- **Development Tools**: Flutter enables cross-platform development from a single codebase, reducing development time by 40%

### 3.2 Operational Feasibility
- **User Adoption**: The app addresses a real pain point for event organizers who currently rely on word-of-mouth or manual searches for temporary parking
- **Land Owner Participation**: Land owners can monetize idle land with minimal effort - register, set pricing, and accept bookings
- **Admin Operations**: The administrative dashboard enables efficient land verification, dispute resolution, and user management
- **Scalability**: The microservices-ready architecture supports horizontal scaling as user base grows

### 3.3 Economic Feasibility
- **Development Cost**: Zero - all technologies used are open-source and free
- **Hosting Cost**: Free tier services (MongoDB Atlas, Render.com) support initial operations
- **Revenue Model**: Platform commission on each booking transaction (5-10%)
- **Market Size**: India's event management industry is valued at over ₹10,000 crore, with parking being a critical ancillary service
- **ROI**: Break-even achievable with 100 active land listings and 500 monthly bookings

### 3.4 Schedule Feasibility
- **Development Phase**: 4-6 weeks for full MVP
- **Testing Phase**: 1-2 weeks for comprehensive testing
- **Deployment Phase**: 1 week for cloud deployment and monitoring
- **Total Timeline**: 6-9 weeks from conception to production

---

## 4. Existing System

### 4.1 Current Approaches
The current market relies on several inadequate solutions for temporary parking:

1. **Manual Arrangements**: Event organizers personally contact land owners through word-of-mouth, local brokers, or classified advertisements. This process is time-consuming, unreliable, and lacks transparency.

2. **Fixed Parking Lots**: Existing parking infrastructure near event venues is limited and often fully booked well in advance. Multi-story parking complexes are expensive and may not be located near the event venue.

3. **Street Parking**: Unauthorized street parking leads to traffic congestion, fines, and vehicle damage. It also creates safety concerns for parked vehicles.

4. **Local Brokers**: Middlemen charge exorbitant commissions (20-30%) for connecting land owners with customers. The process lacks documentation and dispute resolution mechanisms.

5. **Online Classifieds**: Platforms like OLX and Quikr list parking spaces but lack real-time availability, secure payments, and verified listings.

### 4.2 Limitations of Existing Systems

| Limitation | Impact |
|-----------|--------|
| No real-time availability | Customers arrive to find no space |
| No transparent pricing | Exploitation by middlemen |
| No secure payments | Risk of fraud and disputes |
| No verification system | Unsafe and unverified parking lands |
| No rating system | No quality assurance |
| Manual booking process | Time-consuming and error-prone |
| No dynamic pricing | Land owners lose revenue potential |
| No centralized platform | Fragmented market |

---

## 5. Proposed System

### 5.1 System Overview
ParkSpot is a comprehensive mobile-first platform that digitizes the temporary parking rental ecosystem. The system consists of three interconnected components:

1. **Mobile Application** (Flutter) - Customer and land owner interface
2. **Backend API** (Node.js + Express.js) - Business logic and data management
3. **Cloud Database** (MongoDB Atlas) - Persistent data storage

### 5.2 Core Features

**For Customers (Event Organizers):**
- Interactive map-based discovery of available parking lands
- Real-time availability checking with date/time filters
- Vehicle type selection (two-wheeler/four-wheeler) with capacity display
- Dynamic pricing with transparent breakdown (base rate, peak surcharge, weekend premium)
- Secure online payment via Razorpay (UPI, GPay, Paytm, Cards, Net Banking)
- QR code generation for check-in
- Booking management with cancellation support
- Rating and review system for quality assurance

**For Land Owners:**
- Simple land registration with map boundary drawing
- Auto-calculation of parking capacity from land area
- Dynamic pricing rules (peak hours, weekends, events)
- Real-time booking notifications
- Booking management dashboard
- Revenue tracking

**For Administrators:**
- Land verification and approval workflow
- Dispute resolution system
- User management
- Revenue analytics and platform statistics

### 5.3 System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Flutter Mobile  │────▶│   Node.js API    │────▶│   MongoDB Atlas  │
│    App (Android) │     │  (Express.js)    │     │  (Cloud DB)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────────┐
                        │   Razorpay       │
                        │   (Payments)     │
                        └──────────────────┘
                              │
                              ▼
                        ┌──────────────────┐
                        │  Leaflet/OSM     │
                        │  (Maps)          │
                        └──────────────────┘
```

### 5.4 Key Algorithms

**Vehicle Capacity Calculation:**
```
Area (sq ft) calculated from boundary coordinates
Two-wheeler spots = (Area × 0.6) / 30 sq ft per vehicle
Four-wheeler spots = (Area × 0.4) / 120 sq ft per vehicle
```

**Dynamic Pricing:**
```
Final Price = Base Price × Multiplier × Hours
Multiplier = max(Peak Multiplier, Weekend Multiplier)
Peak Hours: 6-9 AM, 5-9 PM → 1.5x
Weekends: Saturday, Sunday → 1.3x
Events: High demand periods → 2.0x
```

---

## 6. Benefits of Proposed System

### 6.1 For Customers
- **Time Saving**: Find and book parking in minutes instead of hours of searching
- **Transparent Pricing**: Know exactly what you pay before booking
- **Secure Payments**: PCI-compliant payment processing through Razorpay
- **Quality Assurance**: Verified land listings with user reviews
- **Real-time Availability**: No more arriving to find no space
- **Instant Confirmation**: Immediate booking confirmation with QR code

### 6.2 For Land Owners
- **Passive Income**: Monetize unused land with zero effort
- **Dynamic Pricing**: Maximize revenue with automated peak/weekend pricing
- **No Middlemen**: Direct connection with customers, no broker commissions
- **Automated Management**: Real-time booking notifications and tracking
- **Trust Building**: Verified listing and review system builds credibility

### 6.3 For Society
- **Reduced Traffic Congestion**: Organized parking reduces street parking chaos
- **Better Land Utilization**: Idle land converted to productive use
- **Environmental Impact**: Fewer vehicles circling for parking reduces emissions
- **Employment**: Creates ecosystem for parking management services

### 6.4 Technical Benefits
- **Cross-Platform**: Single Flutter codebase for Android and iOS
- **Free Mapping**: Leaflet/OpenStreetMap eliminates Google Maps API costs
- **Scalable Architecture**: Microservices-ready design supports growth
- **Real-time Updates**: WebSocket support for live booking notifications
- **Auto-calculated Capacity**: Eliminates manual capacity estimation errors

---

## 7. Scope of the Project

### 7.1 In Scope
- User registration and authentication (customers, land owners, administrators)
- Interactive map-based parking land discovery
- Land registration with boundary drawing and photo upload
- Auto-calculation of parking capacity from land area
- Real-time availability management
- Dynamic pricing engine
- Booking management with real-time status updates
- Secure payment processing (UPI, Cards, Net Banking via Razorpay)
- Rating and review system
- Administrative dashboard for land verification and dispute resolution
- Push notifications for booking updates
- Responsive mobile application (Android)

### 7.2 Future Scope
- **iOS Application**: Extend Flutter app to iOS platform
- **Web Application**: Responsive web interface for desktop users
- **GPS Tracking**: Real-time vehicle tracking within parking area
- **Smart Entry/Exit**: QR code scanning for automated vehicle entry/exit
- **Analytics Dashboard**: Advanced analytics for land owners and admins
- **Multi-language Support**: Hindi, Tamil, Telugu, and other regional languages
- **Corporate Packages**: Bulk booking for corporate events
- **Insurance Integration**: Vehicle insurance for parked vehicles
- **EV Charging**: Electric vehicle charging station integration
- **Valet Parking**: On-demand valet service integration

---

## 8. System Specifications

### 8.1 Hardware Requirements

**Development:**
| Component | Specification |
|-----------|--------------|
| Processor | Intel Core i5 or higher |
| RAM | 8 GB minimum, 16 GB recommended |
| Storage | 256 GB SSD |
| Internet | Broadband connection (10 Mbps+) |
| Mobile Device | Android phone with GPS for testing |

**Server (Production):**
| Component | Specification |
|-----------|--------------|
| Cloud Provider | Oracle Cloud Free Tier / Render.com |
| CPU | 4 cores (ARM Ampere A1) |
| RAM | 24 GB |
| Storage | 200 GB Block Volume |
| Network | 10 TB monthly egress |
| Database | MongoDB Atlas M0 Free Tier (512 MB) |

### 8.2 Software Requirements

**Development Environment:**
| Software | Version | Purpose |
|----------|---------|---------|
| Flutter SDK | 3.44+ | Mobile app development |
| Dart | 3.12+ | Programming language |
| Node.js | 18+ | Backend runtime |
| npm | 10+ | Package management |
| MongoDB | 8.0+ | Database |
| VS Code / Android Studio | Latest | IDE |
| Git | 2.x | Version control |
| Android SDK | API 21+ | Android compilation |

**Production Stack:**
| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile Framework | Flutter | 3.44 |
| Backend Runtime | Node.js | 18+ |
| Web Framework | Express.js | 4.21 |
| Database | MongoDB | 8.0 |
| ODM | Mongoose | 8.13 |
| Authentication | JWT | 9.0 |
| Payment Gateway | Razorpay | 2.9 |
| Mapping | Leaflet + OpenStreetMap | 8.3 |
| Cloud Database | MongoDB Atlas | M0 Free |
| Cloud Hosting | Render.com / Oracle Cloud | - |
| Image Upload | Multer | 1.4 |
| HTTP Client | http (Dart) | 1.6 |
| State Management | Provider | 6.1 |

### 8.3 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/profile` | GET | Get user profile |
| `/api/lands` | GET | List approved parking lands |
| `/api/lands` | POST | Register new land (owner) |
| `/api/lands/:id` | GET | Get land details |
| `/api/lands/:id` | PUT | Update land |
| `/api/lands/:id/verify` | PUT | Verify land (admin) |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/my` | GET | Get my bookings |
| `/api/bookings/availability` | GET | Check availability |
| `/api/payments/create-order` | POST | Create Razorpay order |
| `/api/payments/verify` | POST | Verify payment |
| `/api/reviews` | POST | Submit review |
| `/api/reviews/land/:id` | GET | Get land reviews |
| `/api/admin/dashboard` | GET | Admin dashboard stats |
| `/api/admin/disputes` | GET | List disputes |

### 8.4 Database Schema

**Users Collection:**
```
- _id: ObjectId
- name: String (required)
- email: String (unique, required)
- password: String (hashed, required)
- phone: String (required)
- role: Enum [customer, owner, admin]
- avatar: String
- isVerified: Boolean
- createdAt, updatedAt: Timestamp
```

**Lands Collection:**
```
- _id: ObjectId
- owner: ObjectId (ref: User)
- title: String (required)
- description: String (required)
- location: GeoJSON Point [lng, lat]
  - address, city, state: String
- boundary: Array of [lng, lat] coordinates
- areaSqFt: Number (auto-calculated)
- totalSpots, twoWheelerSpots, fourWheelerSpots: Number
- pricePerHour: Number (required)
- dynamicPricing: { peakMultiplier, weekendMultiplier, eventMultiplier }
- images: Array of String (URLs)
- amenities: Array of String
- status: Enum [pending, approved, rejected]
- isAvailable: Boolean
- averageRating, reviewCount: Number
```

**Bookings Collection:**
```
- _id: ObjectId
- customer: ObjectId (ref: User)
- land: ObjectId (ref: Land)
- eventDate: { start: Date, end: Date }
- duration: Number (hours)
- vehicleType: Enum [two_wheeler, four_wheeler, mixed]
- vehicleCount: Number
- totalAmount: Number
- status: Enum [pending, confirmed, active, completed, cancelled]
- qrCode: String
```

**Payments Collection:**
```
- _id: ObjectId
- booking: ObjectId (ref: Booking)
- user: ObjectId (ref: User)
- razorpayOrderId, razorpayPaymentId, razorpaySignature: String
- amount, currency: Number/String
- status: Enum [created, captured, failed, refunded]
```

### 8.5 Project Structure

```
parkspot/
├── client/                     # React Web Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level pages
│   │   ├── context/            # React context (Auth)
│   │   ├── services/           # API service layer
│   │   └── utils/              # Helpers and constants
│   └── ...
│
├── server/                     # Node.js Backend
│   └── src/
│       ├── config/             # DB, Razorpay, CORS
│       ├── models/             # Mongoose schemas (6 models)
│       ├── routes/             # Express routes (7 route files)
│       ├── controllers/        # Business logic (6 controllers)
│       ├── middleware/          # Auth, upload, validation
│       ├── utils/              # Pricing, capacity calculation
│       └── server.js           # Entry point
│
├── parkspot_mobile/            # Flutter Mobile App
│   └── lib/
│       ├── config/             # API configuration
│       ├── models/             # Data models
│       ├── services/           # API service layer
│       ├── providers/          # State management
│       ├── screens/            # App screens
│       └── utils/              # Helpers
│
└── render.yaml                 # Cloud deployment config
```

---

## 9. Testing

### 9.1 Test Cases

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| TC01 | User registration with valid data | Account created, JWT returned | Pass |
| TC02 | User login with correct credentials | JWT token returned | Pass |
| TC03 | User login with wrong password | 401 Unauthorized error | Pass |
| TC04 | Fetch approved lands | List of approved lands returned | Pass |
| TC05 | Create booking with available slots | Booking created in pending state | Pass |
| TC06 | Create booking with no available slots | Error: Not enough spots | Pass |
| TC07 | Payment order creation | Razorpay order ID returned | Pass |
| TC08 | Payment verification with valid signature | Payment captured, booking confirmed | Pass |
| TC09 | Submit review for completed booking | Review saved, land rating updated | Pass |
| TC10 | Admin land verification | Land status changed to approved/rejected | Pass |

---

## 10. Conclusion

ParkSpot addresses the critical gap in temporary parking management for events by providing a technology-driven platform connecting land owners with event organizers. The system leverages modern technologies including Flutter for cross-platform mobile development, Node.js for scalable backend services, MongoDB for flexible data storage, and Razorpay for secure payment processing.

The application's key innovations include auto-calculated parking capacity from land boundary coordinates, dynamic pricing algorithms, and a trust ecosystem built through verified listings and user reviews. The free mapping solution using Leaflet and OpenStreetMap eliminates recurring API costs, making the platform economically viable.

The proposed system demonstrates significant improvements over existing manual approaches in terms of efficiency, transparency, security, and user experience. With its scalable architecture and comprehensive feature set, ParkSpot is well-positioned to become the go-to platform for temporary parking solutions in India's growing event management industry.

---

*Prepared by: Mithesh D*
*Date: July 2026*
*Project: ParkSpot - Real-Time Car Parking Land Rental Booking Portal*
