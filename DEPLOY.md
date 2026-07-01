# ParkSpot - Live Deployment Guide (FREE)

## Step 1: Create MongoDB Atlas Database (2 minutes)

1. Go to https://www.mongodb.com/atlas
2. Click **"Try Free"** → Sign up with email
3. Click **"Build a Database"**
4. Choose **M0 Free** tier → Click **"Create"**
5. Select cloud provider: **AWS** → Region: **Mumbai (ap-south-1)** → Click **"Create"**
6. Set database access:
   - Username: `parkspot_user`
   - Password: `ParkSpot123` (save this!)
   - Click **"Create User"**
7. Set network access:
   - Click **"Add Entry"**
   - IP Address: `0.0.0.0/0` (allow from anywhere)
   - Click **"Confirm"**
8. Click **"Choose a connection method"** → **"Drivers"**
9. Copy the connection string that looks like:
   ```
   mongodb+srv://parkspot_user:ParkSpot123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```
10. **Replace** `?retryWrites` part with `/parkspot?retryWrites`:
    ```
    mongodb+srv://parkspot_user:ParkSpot123@cluster0.abc123.mongodb.net/parkspot?retryWrites=true&w=majority
    ```

---

## Step 2: Deploy Backend to Render.com (5 minutes)

1. Go to https://github.com → Sign up / Login
2. Create a **new repository** called `parkspot`
3. Download and install GitHub Desktop: https://desktop.github.com
4. Open GitHub Desktop → **File → Clone Repository** → Enter your repo URL
5. Copy ALL files from `C:\Users\MITHESH D\parkspot` into the cloned repo folder
6. Commit and push all files

### Now deploy on Render:

1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub `parkspot` repository
4. Settings:
   - **Name**: `parkspot-server`
   - **Runtime**: Node
   - **Region**: Asia (Mumbai)
   - **Build Command**:
     ```
     cd server && npm install
     ```
   - **Start Command**:
     ```
     cd server && node src/server.js
     ```
5. Add Environment Variables (click **"Add Env Variable"** for each):
   - `MONGODB_URI` = your MongoDB Atlas connection string from Step 1
   - `JWT_SECRET` = `parkspot_production_secret_key_2026`
   - `JWT_EXPIRE` = `7d`
   - `RAZORPAY_KEY_ID` = your Razorpay test key
   - `RAZORPAY_KEY_SECRET` = your Razorpay test secret
   - `CLIENT_URL` = `https://parkspot-server.onrender.com`
   - `NODE_ENV` = `production`
6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. Your backend is now LIVE at: `https://parkspot-server.onrender.com`

### Seed demo data:

After deployment, open your browser:
```
https://parkspot-server.onrender.com/api/health
```
You should see: `{"status":"ok"}`

Then run seed locally connected to your Atlas:
```bash
cd server
set MONGODB_URI=your_atlas_connection_string
node src/seed.js
```

---

## Step 3: Update Flutter App for Live Server

1. Edit `C:\Users\MITHESH D\parkspot_mobile\lib\config\api_config.dart`:
```dart
class ApiConfig {
  static const String baseUrl = 'https://parkspot-server.onrender.com/api';
  static const String razorpayKeyId = 'rzp_test_yourkey';
}
```

2. Rebuild APK:
```bash
cd C:\Users\MITHESH D\parkspot_mobile
flutter build apk --release
```

3. Install new APK on your phone

---

## Step 4: Set Up Razorpay (for payments)

1. Go to https://dashboard.razorpay.com
2. Sign up → Complete KYC
3. Go to **Settings → API Keys**
4. Copy **Key ID** and **Key Secret**
5. Update Render environment variables with your keys
6. For testing, use test mode keys (rzp_test_xxx)

---

## Your Live App URLs

| Service | URL |
|---------|-----|
| Backend API | `https://parkspot-server.onrender.com/api` |
| Health Check | `https://parkspot-server.onrender.com/api/health` |
| Flutter App | Install APK on phone |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@parkspot.in | admin123 |
| Owner | rajesh@parkspot.in | owner123 |
| Customer | amit@parkspot.in | customer123 |

---

## How It All Connects

```
Flutter App (Phone)
    ↓
Backend API (Render.com Cloud)
    ↓
Database (MongoDB Atlas Cloud)
    ↓
Payments (Razorpay)
```

**Everything runs in the cloud 24/7. No localhost needed. Works from anywhere in the world.**
