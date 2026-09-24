# SIH E-Mandi Backend API

Robust Express.js and MongoDB REST API backend for the Smart India Hackathon (SIH) National E-Mandi platform.

## Features
- **Role-Based Authentication & Registry**: Supports Farmers, Grain Traders, Mandi Officers, District Admins, and State/Central Management.
- **Trilingual Agricultural NLP Speech Engine**: Voice assistant endpoints (`/api/speech/command`, `/api/speech/transcribe`) supporting English, Hindi, and Telugu.
- **MSP & Commodity Management**: Endpoints for retrieving central and state MSP benchmarks and quotas.
- **Transaction & Mandi Token Engine**: Real-time gate-entry token generation and transparent trade transaction recording.
- **Render Production Ready**: Configured for Render deployment with zero-downtime health checks.

## Environment Variables
Create a `.env` file in the root directory (or configure in Render environment settings):

```env
PORT=8000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=optional_groq_api_key_for_whisper_transcription
```

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Authentication & Users
- `POST /api/auth/register` - Register a new user (farmer, trader, admin, management)
- `POST /api/auth/login` - Authenticate user credentials
- `GET /api/auth/users` - Retrieve users list
- `GET /authservice/getallusers/:page/:size` - Paginated user lookup for traders

### Mandi Data & Transactions
- `GET /api/msp` - Get Minimum Support Prices
- `POST /api/msp` - Update MSP rates (Management/Admin)
- `GET /api/quotas` - Get procurement quotas
- `GET /api/transactions` - List all mandi transactions
- `POST /api/transactions` - Record a new transaction
- `GET /api/tokens` - Get gate entry tokens
- `POST /api/tokens` - Create entry token
- `PUT /api/tokens/:id` - Update token status (approved, rejected, pending)

### Speech & Voice Assistant
- `POST /api/speech/command` - Natural language understanding for voice commands (Hindi, Telugu, English)
- `POST /api/speech/transcribe` - Audio transcription endpoint

## Running Locally

```bash
npm install
npm run dev
```
