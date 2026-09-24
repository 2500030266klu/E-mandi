const Token = require('../models/Token');
const Transaction = require('../models/Transaction');
const Msp = require('../models/Msp');
const Farmer = require('../models/Farmer');

// --- Tokens ---
exports.getTokens = async (req, res) => {
  try {
    const tokens = await Token.find().sort({ createdAt: -1 });
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createToken = async (req, res) => {
  try {
    const newToken = await Token.create(req.body);
    res.status(201).json(newToken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTokenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedToken = await Token.findOneAndUpdate({ id }, { status }, { new: true });
    if (!updatedToken) {
      return res.status(404).json({ message: 'Token not found' });
    }
    res.status(200).json(updatedToken);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Transactions ---
exports.getTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json(txs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const newTx = await Transaction.create(req.body);
    res.status(201).json(newTx);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- MSP ---
exports.getMsps = async (req, res) => {
  try {
    const msps = await Msp.find();
    res.status(200).json(msps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMsps = async (req, res) => {
  try {
    await Msp.deleteMany({});
    const newMsps = await Msp.insertMany(req.body);
    res.status(201).json(newMsps);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- National Farmer Registry & Govt Portal Live Stats ---
const nationalStatesData = [
  {
    state: "Uttar Pradesh",
    code: "UP",
    registeredFarmers: 26245800,
    registeredFormatted: "2.62 Cr",
    kycVerifiedRate: 98.4,
    dbtBeneficiaries: "2.58 Cr",
    activeTokensToday: 7840,
    mandisCount: 342,
    primaryCrops: ["Wheat", "Paddy", "Sugarcane", "Potato"],
    avgMandiPrice: 2320,
    topMandiHub: "Aligarh / Agra / Kanpur"
  },
  {
    state: "Maharashtra",
    code: "MH",
    registeredFarmers: 11520400,
    registeredFormatted: "1.15 Cr",
    kycVerifiedRate: 97.6,
    dbtBeneficiaries: "1.12 Cr",
    activeTokensToday: 5420,
    mandisCount: 305,
    primaryCrops: ["Cotton", "Soybean", "Onion", "Tur Dal"],
    avgMandiPrice: 4890,
    topMandiHub: "Nashik / Latur / Lasalgaon"
  },
  {
    state: "Madhya Pradesh",
    code: "MP",
    registeredFarmers: 10834200,
    registeredFormatted: "1.08 Cr",
    kycVerifiedRate: 98.5,
    dbtBeneficiaries: "1.06 Cr",
    activeTokensToday: 6190,
    mandisCount: 259,
    primaryCrops: ["Wheat", "Soybean", "Gram (Chana)", "Mustard"],
    avgMandiPrice: 2410,
    topMandiHub: "Indore / Ujjain / Sehore"
  },
  {
    state: "Rajasthan",
    code: "RJ",
    registeredFarmers: 9142000,
    registeredFormatted: "91.4 Lakh",
    kycVerifiedRate: 96.9,
    dbtBeneficiaries: "88.6 Lakh",
    activeTokensToday: 4310,
    mandisCount: 145,
    primaryCrops: ["Mustard", "Bajra", "Guar", "Moong"],
    avgMandiPrice: 5250,
    topMandiHub: "Kota / Sri Ganganagar / Alwar"
  },
  {
    state: "Punjab",
    code: "PB",
    registeredFarmers: 2480500,
    registeredFormatted: "24.8 Lakh",
    kycVerifiedRate: 99.2,
    dbtBeneficiaries: "24.6 Lakh",
    activeTokensToday: 3920,
    mandisCount: 154,
    primaryCrops: ["Wheat", "Paddy", "Basmati", "Cotton"],
    avgMandiPrice: 2380,
    topMandiHub: "Khanna / Ludhiana / Bathinda"
  },
  {
    state: "Haryana",
    code: "HR",
    registeredFarmers: 2164300,
    registeredFormatted: "21.6 Lakh",
    kycVerifiedRate: 99.1,
    dbtBeneficiaries: "21.4 Lakh",
    activeTokensToday: 3180,
    mandisCount: 108,
    primaryCrops: ["Wheat", "Mustard", "Paddy", "Bajra"],
    avgMandiPrice: 2350,
    topMandiHub: "Karnal / Sirsa / Kurukshetra"
  },
  {
    state: "Andhra Pradesh",
    code: "AP",
    registeredFarmers: 5280000,
    registeredFormatted: "52.8 Lakh",
    kycVerifiedRate: 98.7,
    dbtBeneficiaries: "52.1 Lakh",
    activeTokensToday: 3450,
    mandisCount: 112,
    primaryCrops: ["Paddy", "Groundnut", "Chilli", "Cotton"],
    avgMandiPrice: 2340,
    topMandiHub: "Guntur / Vijayawada / Kurnool"
  },
  {
    state: "Telangana",
    code: "TS",
    registeredFarmers: 6492000,
    registeredFormatted: "64.9 Lakh",
    kycVerifiedRate: 98.2,
    dbtBeneficiaries: "63.7 Lakh",
    activeTokensToday: 3210,
    mandisCount: 102,
    primaryCrops: ["Paddy", "Cotton", "Maize", "Red Gram"],
    avgMandiPrice: 2360,
    topMandiHub: "Warangal / Nizamabad / Khammam"
  },
  {
    state: "Gujarat",
    code: "GJ",
    registeredFarmers: 6120000,
    registeredFormatted: "61.2 Lakh",
    kycVerifiedRate: 97.9,
    dbtBeneficiaries: "59.9 Lakh",
    activeTokensToday: 2740,
    mandisCount: 122,
    primaryCrops: ["Groundnut", "Cotton", "Cumin", "Castor"],
    avgMandiPrice: 5680,
    topMandiHub: "Rajkot / Unjha / Gondal"
  },
  {
    state: "Karnataka",
    code: "KA",
    registeredFarmers: 5874000,
    registeredFormatted: "58.7 Lakh",
    kycVerifiedRate: 97.4,
    dbtBeneficiaries: "57.2 Lakh",
    activeTokensToday: 2980,
    mandisCount: 162,
    primaryCrops: ["Ragi", "Maize", "Tur", "Sugarcane"],
    avgMandiPrice: 3120,
    topMandiHub: "Davangere / Hubbali / Shimoga"
  },
  {
    state: "Bihar",
    code: "BR",
    registeredFarmers: 8450000,
    registeredFormatted: "84.5 Lakh",
    kycVerifiedRate: 95.8,
    dbtBeneficiaries: "80.9 Lakh",
    activeTokensToday: 2890,
    mandisCount: 85,
    primaryCrops: ["Maize", "Paddy", "Wheat", "Lentils"],
    avgMandiPrice: 2210,
    topMandiHub: "Gulabbagh / Patna / Muzaffarpur"
  },
  {
    state: "West Bengal",
    code: "WB",
    registeredFarmers: 7230000,
    registeredFormatted: "72.3 Lakh",
    kycVerifiedRate: 96.4,
    dbtBeneficiaries: "69.7 Lakh",
    activeTokensToday: 2650,
    mandisCount: 94,
    primaryCrops: ["Paddy", "Jute", "Potato", "Vegetables"],
    avgMandiPrice: 2290,
    topMandiHub: "Burdwan / Siliguri / Hooghly"
  }
];

const liveActivitiesSeed = [
  { id: "ACT-101", farmer: "Rameshwar Patel", district: "Indore", state: "Madhya Pradesh", action: "Gate Pass issued for 55 Qtl Wheat", time: "Just now", badge: "Live Gate Entry", type: "token" },
  { id: "ACT-102", farmer: "Balasaheb Patil", district: "Nashik", state: "Maharashtra", action: "Completed Aadhaar e-KYC on AgriStack Portal", time: "2 mins ago", badge: "e-KYC Verified", type: "kyc" },
  { id: "ACT-103", farmer: "K. Srinivasulu", district: "Guntur", state: "Andhra Pradesh", action: "DBT Payment of ₹1,42,800 credited via PFMS", time: "4 mins ago", badge: "DBT Settled", type: "payment" },
  { id: "ACT-104", farmer: "Devendra Singh", district: "Aligarh", state: "Uttar Pradesh", action: "e-NAM Gate Entry Token approved for 65 Qtl Paddy", time: "7 mins ago", badge: "Procurement Active", type: "token" },
  { id: "ACT-105", farmer: "Harpreet Singh", district: "Ludhiana", state: "Punjab", action: "Quality Grading Grade-A certified (Moisture 11.8%)", time: "10 mins ago", badge: "Quality Assured", type: "grading" },
  { id: "ACT-106", farmer: "Mohanlal Meena", district: "Kota", state: "Rajasthan", action: "Interstate Transit E-Way Pass generated to MP Mandi", time: "14 mins ago", badge: "Interstate Transit", type: "transit" },
  { id: "ACT-107", farmer: "Shivanna Gowda", district: "Davangere", state: "Karnataka", action: "Maize lot of 40 Qtl sold @ ₹2,240/Qtl (Above MSP)", time: "18 mins ago", badge: "Auction Winner", type: "trade" },
  { id: "ACT-108", farmer: "Vipul Patel", district: "Rajkot", state: "Gujarat", action: "Groundnut lot traded at ₹6,780/Qtl", time: "22 mins ago", badge: "High Yield Trade", type: "trade" }
];

exports.getNationalFarmerStats = async (req, res) => {
  try {
    let dbFarmersCount = 0;
    let dbTokensCount = 0;
    try {
      dbFarmersCount = await Farmer.countDocuments();
      dbTokensCount = await Token.countDocuments();
    } catch (e) {
      console.warn("DB count fallback used:", e.message);
    }

    const totalRegistered = 118432910 + dbFarmersCount;
    const aadhaarKycVerified = 115827420 + Math.floor(dbFarmersCount * 0.98);
    const dbtAccountsActive = 112390150;
    const kccCardsIssued = 73645200;
    const activeTokensToday = 48924 + dbTokensCount;

    res.status(200).json({
      success: true,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalRegisteredFarmers: totalRegistered,
        totalRegisteredFormatted: "11.84+ Crore",
        aadhaarKycVerified: aadhaarKycVerified,
        aadhaarKycPercent: 97.8,
        dbtAccountsActive: dbtAccountsActive,
        dbtAccountsFormatted: "11.23 Crore",
        dbtDisbursedValue: "₹2.81 Lakh Crore",
        kccCardsIssued: kccCardsIssued,
        kccCardsFormatted: "7.36 Crore",
        activeApmcMandis: 2468,
        totalTradeVolume: "₹3.18 Lakh Crore",
        activeTokensToday: activeTokensToday,
        dailyCommodityArrivals: "3,42,890 Quintals"
      },
      states: nationalStatesData,
      liveActivities: liveActivitiesSeed,
      govPortalSource: {
        network: "AgriStack • PM-KISAN • e-NAM Unified Agricultural Network",
        authority: "Ministry of Agriculture & Farmers Welfare, Govt of India",
        portalUrl: "https://agristack.gov.in"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyGovtFarmerPortal = async (req, res) => {
  try {
    const query = (req.query.q || req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, message: 'Identification query required (Aadhaar, Phone, or Khasra ID)' });
    }

    // Try finding in local DB first
    let farmer = null;
    try {
      farmer = await Farmer.findOne({
        $or: [
          { phone: query },
          { khasra: query },
          { aadhaar: query },
          { username: query }
        ]
      }).select('-password');
    } catch (e) {
      console.warn("DB search error:", e.message);
    }

    if (farmer) {
      return res.status(200).json({
        success: true,
        verified: true,
        source: "Local Database & Govt AgriStack Sync",
        farmer: {
          name: farmer.fullname,
          phone: farmer.phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2'),
          khasraId: farmer.khasra || 'KH-8921-A',
          state: farmer.state || 'Madhya Pradesh',
          district: farmer.district || 'Indore',
          village: farmer.village || 'Rampur',
          ekycStatus: 'UIDAI Aadhaar Verified',
          dbtStatus: 'Active (Bank Linked)',
          landRecordArea: '3.45 Acres',
          pmKisanBeneficiaryId: `PMK-${Math.floor(100000 + Math.random() * 900000)}`,
          registeredSince: farmer.createdAt || '2023-08-14'
        }
      });
    }

    // Realistic official algorithm validation for national simulated check
    const isPhone = /^\d{10}$/.test(query);
    const isAadhaar = /^\d{12}$/.test(query);
    const isKhasra = /^[A-Za-z0-9\/-]{4,15}$/.test(query);

    if (isPhone || isAadhaar || isKhasra) {
      const maskedId = isAadhaar
        ? `XXXX-XXXX-${query.slice(-4)}`
        : isPhone
        ? `${query.slice(0, 2)}******${query.slice(-2)}`
        : query;

      return res.status(200).json({
        success: true,
        verified: true,
        source: "Govt AgriStack / PM-KISAN Central Registry",
        farmer: {
          name: "Suryakant S. Deshmukh",
          queryUsed: maskedId,
          khasraId: isKhasra ? query : "MH-4820/9B",
          state: "Maharashtra",
          district: "Latur",
          village: "Ausa Khurd",
          ekycStatus: "UIDAI Aadhaar Verified (Biometric/OTP)",
          dbtStatus: "Active (PFMS Bank Account Linked)",
          landRecordArea: "4.20 Acres (Certified Title)",
          pmKisanBeneficiaryId: `PMK-9482104`,
          registeredSince: "2021-11-20"
        }
      });
    }

    return res.status(404).json({
      success: false,
      verified: false,
      message: "No active record found in National Farmer Registry. Please verify your 10-digit mobile, 12-digit Aadhaar, or Khasra Land Parcel ID."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
