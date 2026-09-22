# 🌾 SIH Smart E-Mandi Platform - Backend API

Production-ready Node.js & Express REST API for the **Smart E-Mandi Platform**, featuring multi-tier user role authentication, digital gate token generation, real-time live mandi transactions, MSP rates discovery, and trilingual voice-assisted commands (English, Hindi, Telugu).

---

## 🚀 Quick Local Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the `backend/` directory:
   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://admin:Adarsh%40123@cluster0.ulkkg90.mongodb.net/mandidb?appName=Cluster0
   JWT_SECRET=supersecretjwtkey_replace_me_in_production
   NODE_ENV=development
   ```
3. **Run Locally**:
   ```bash
   npm run dev    # with nodemon
   # or
   npm start      # standard node server
   ```
4. **Health Check**:
   Open [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## ☁️ Deploying to Render

### Method 1: Automatic Blueprint (Recommended)
1. Push this repository to your GitHub account (e.g. `https://github.com/2500030266klu/sih-emandi`).
2. Log into your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically read `render.yaml` and configure:
   - **Service Name**: `sih-emandi-backend`
   - **Runtime**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Fill in the required environment variables:
   - `MONGODB_URI`: `mongodb+srv://admin:Adarsh%40123@cluster0.ulkkg90.mongodb.net/mandidb?appName=Cluster0`
   - `JWT_SECRET`: (or let Render auto-generate one)
7. Click **Apply**. Your API will be live in 1–2 minutes!

---

### Method 2: Manual Web Service Setup on Render
If you prefer creating the Web Service manually:
1. On [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository** and connect your repository.
3. Fill in these settings:
   | Setting | Value |
   | :--- | :--- |
   | **Name** | `sih-emandi-backend` |
   | **Region** | Singapore (or closest to your users) |
   | **Branch** | `main` or `master` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |
4. Scroll down to **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://admin:Adarsh%40123@cluster0.ulkkg90.mongodb.net/mandidb?appName=Cluster0`
   - `JWT_SECRET` = `supersecretjwtkey_replace_me_in_production`
5. In **Advanced Settings**, set **Health Check Path** to `/api/health`.
6. Click **Create Web Service**.

---

## 📡 API Endpoints Reference

### Health Check
- `GET /api/health` - Ping server status

### Authentication & Users (`/api/auth`)
- `POST /api/auth/register` - Register new user (`farmer`, `trader`, `district_admin`, `auction_admin`, `central_admin`, `state_admin`)
- `POST /api/auth/login` - User login with credentials / phone / ID
- `GET /api/auth/users` - Fetch user list

### Mandi Data & Operations (`/api`)
- `GET /api/tokens` - List all mandi gate entry tokens
- `POST /api/tokens` - Generate new gate entry token
- `PUT /api/tokens/:id` - Update gate token status
- `GET /api/transactions` - Fetch auction & trade transactions
- `POST /api/transactions` - Record new trade transaction
- `GET /api/msp` - Get government MSP benchmark rates
- `POST /api/msp` - Update MSP rates

### Trilingual Voice NLP & Speech (`/api/speech`)
- `POST /api/speech/command` - Process voice command in English, Hindi, or Telugu
- `POST /api/speech/transcribe` - Transcribe audio input (supports Groq Whisper Cloud / fallback)
