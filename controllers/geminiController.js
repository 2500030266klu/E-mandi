const axios = require('axios');

// Official Agricultural Knowledge Base for Gemini AI Assistant
const agriculturalKnowledge = {
  msp2024_25: [
    { crop: 'Paddy (Common)', price: 2300, increase: 117, season: 'Kharif' },
    { crop: 'Paddy (Grade A)', price: 2320, increase: 117, season: 'Kharif' },
    { crop: 'Wheat', price: 2275, increase: 150, season: 'Rabi' },
    { crop: 'Barley', price: 1850, increase: 115, season: 'Rabi' },
    { crop: 'Gram (Chana)', price: 5440, increase: 105, season: 'Rabi' },
    { crop: 'Lentil (Masur)', price: 6425, increase: 425, season: 'Rabi' },
    { crop: 'Rapeseed & Mustard', price: 5650, increase: 200, season: 'Rabi' },
    { crop: 'Cotton (Medium)', price: 7121, increase: 501, season: 'Commercial' },
    { crop: 'Cotton (Long)', price: 7521, increase: 501, season: 'Commercial' },
    { crop: 'Maize', price: 2225, increase: 135, season: 'Kharif' },
    { crop: 'Bajra', price: 2625, increase: 125, season: 'Kharif' }
  ],
  schemes: [
    {
      name: "PM-KISAN Samman Nidhi",
      benefit: "₹6,000 per year directly to bank account in 3 equal installments of ₹2,000 via Direct Benefit Transfer (DBT).",
      eligibility: "All landholding farmer families with cultivable land in their name and verified Aadhaar e-KYC."
    },
    {
      name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      benefit: "Comprehensive crop insurance shield against natural calamities, pests, and unseasonal rainfall with minimal premium (1.5% - 2%).",
      eligibility: "All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers."
    },
    {
      name: "Kisan Credit Card (KCC)",
      benefit: "Concessional institutional credit up to ₹3,00,000 at low effective interest rate of 4% per annum upon prompt repayment.",
      eligibility: "Individual farmers, Joint Borrowers, Self-Help Groups (SHGs)."
    },
    {
      name: "e-NAM (National Agriculture Market)",
      benefit: "Pan-India electronic trading portal uniting 2,400+ APMC mandis for transparent price discovery and online payments.",
      eligibility: "Registered farmers and licensed grain traders across India."
    }
  ]
};

/**
 * Intelligent Intent & Action Analyzer
 */
function analyzeIntent(query, language = 'en') {
  const q = (query || '').toLowerCase().trim();

  // Navigation intents
  if (q.includes('farmer') || q.includes('kisan') || q.includes('किसान') || q.includes('రైతు')) {
    return {
      action: 'NAVIGATE',
      target: '/farmer/login',
      actionLabel: { en: 'Go to Farmer Portal', hi: 'किसान पोर्टल पर जाएं', te: 'రైతు పోర్టల్‌కి వెళ్లండి' }
    };
  }
  if (q.includes('trader') || q.includes('vyapari') || q.includes('व्यापारी') || q.includes('ట్రేడర్') || q.includes('వ్యాపారి')) {
    return {
      action: 'NAVIGATE',
      target: '/trader/login',
      actionLabel: { en: 'Go to Trader Portal', hi: 'व्यापारी पोर्टल पर जाएं', te: 'వ్యాపారి పోర్టల్‌కి వెళ్లండి' }
    };
  }
  if (q.includes('admin') || q.includes('एडमिन') || q.includes('district') || q.includes('జిల్లా')) {
    return {
      action: 'NAVIGATE',
      target: '/admin/login',
      actionLabel: { en: 'Go to Admin Portal', hi: 'एडमिन पोर्टल पर जाएं', te: 'అడ్మిన్ పోర్టల్‌కి వెళ్లండి' }
    };
  }
  if (q.includes('management') || q.includes('ministry') || q.includes('prabandhan') || q.includes('प्रबंधन')) {
    return {
      action: 'NAVIGATE',
      target: '/management/login',
      actionLabel: { en: 'Go to Management Portal', hi: 'प्रबंधन पोर्टल पर जाएं', te: 'నిర్వహణ పోర్టల్‌కి వెళ్లండి' }
    };
  }
  if (q.includes('msp') || q.includes('rate') || q.includes('भाव') || q.includes('दाम') || q.includes('మద్దతు ధర') || q.includes('ధర')) {
    return {
      action: 'NAVIGATE',
      target: '/msp-rates',
      actionLabel: { en: 'View All MSP Rates', hi: 'सभी MSP दरें देखें', te: 'అన్ని MSP ధరలను చూడండి' }
    };
  }
  if (q.includes('help') || q.includes('support') || q.includes('madad') || q.includes('मदद') || q.includes('సహాయం')) {
    return {
      action: 'NAVIGATE',
      target: '/help',
      actionLabel: { en: 'Open Help Center', hi: 'सहायता केंद्र खोलें', te: 'సహాయ కేంద్రాన్ని తెరవండి' }
    };
  }
  if (q.includes('scroll down') || q.includes('नीचे')) {
    return { action: 'SCROLL_DOWN' };
  }
  if (q.includes('scroll up') || q.includes('ऊपर')) {
    return { action: 'SCROLL_UP' };
  }
  if (q.includes('read page') || q.includes('पढ़ो') || q.includes('చదవండి')) {
    return { action: 'READ_PAGE' };
  }

  return { action: 'NONE' };
}

/**
 * Domain-Trained Multilingual Agricultural Response Generator
 */
function generateAgriculturalResponse(query, lang = 'en') {
  const q = query.toLowerCase();

  // 1. MSP Questions
  if (q.includes('msp') || q.includes('rate') || q.includes('भाव') || q.includes('दाम') || q.includes('ధర')) {
    let crop = 'General';
    let priceText = '';

    if (q.includes('wheat') || q.includes('गेहूं') || q.includes('గోధుమ')) {
      crop = 'Wheat (गेहूं / గోధుమలు)';
      priceText = '₹2,275 per Quintal (increased by ₹150 for Rabi 2024-25)';
    } else if (q.includes('paddy') || q.includes('rice') || q.includes('धान') || q.includes('चावल') || q.includes('వరి')) {
      crop = 'Paddy Common (धान / వరి)';
      priceText = '₹2,300 per Quintal (Grade A is ₹2,320 per Quintal, increased by ₹117)';
    } else if (q.includes('mustard') || q.includes('sarson') || q.includes('सरसों') || q.includes('ఆవాలు')) {
      crop = 'Rapeseed & Mustard (सरसों / ఆవాలు)';
      priceText = '₹5,650 per Quintal (increased by ₹200 for 2024-25)';
    } else if (q.includes('cotton') || q.includes('kapas') || q.includes('कपास') || q.includes('పత్తి')) {
      crop = 'Cotton (कपास / పత్తి)';
      priceText = '₹7,121 (Medium Staple) / ₹7,521 (Long Staple) per Quintal';
    } else if (q.includes('chana') || q.includes('gram') || q.includes('चना') || q.includes('శనగలు')) {
      crop = 'Gram / Chana (चना / శనగలు)';
      priceText = '₹5,440 per Quintal (increased by ₹105)';
    }

    if (lang === 'hi') {
      return {
        text: `🌾 **न्यूनतम समर्थन मूल्य (MSP) 2024-25 अपडेट**:\n\n${crop !== 'General' ? `• **${crop}**: सरकारी एमएसपी **${priceText}** तय की गई है।\n\n` : ''}• **धान (Paddy)**: ₹2,300/क्विंटल (₹117 वृद्धि)\n• **गेहूं (Wheat)**: ₹2,275/क्विंटल (₹150 वृद्धि)\n• **सरसों (Mustard)**: ₹5,650/क्विंटल\n• **कपास (Cotton)**: ₹7,121/क्विंटल\n\nकिसान भाई अपनी उपज को नज़दीकी ई-मंडी में ले जाकर सीधे सरकार अथवा पंजीकृत व्यापारियों को एमएसपी से ऊपर बेच सकते हैं।`,
        actionTarget: '/msp-rates'
      };
    } else if (lang === 'te') {
      return {
        text: `🌾 **కనీస మద్దతు ధర (MSP) 2024-25 వివరాలు**:\n\n${crop !== 'General' ? `• **${crop}**: అధికారిక MSP **${priceText}** గా నిర్ణయించబడింది.\n\n` : ''}• **వరి (Paddy)**: ₹2,300/క్వింటాల్ (₹117 పెంపు)\n• **గోధుమలు (Wheat)**: ₹2,275/క్వింటాల్\n• **ఆవాలు (Mustard)**: ₹5,650/క్వింటాల్\n• **పత్తి (Cotton)**: ₹7,121/క్వింటాల్\n\nరైతులు తమ పంటలను ఈ-మండి ద్వారా రిజిస్టర్ చేసుకుని గరిష్ట ధరకు విక్రయించవచ్చు.`,
        actionTarget: '/msp-rates'
      };
    } else {
      return {
        text: `🌾 **Official Government Minimum Support Price (MSP) 2024-25**:\n\n${crop !== 'General' ? `• **${crop}**: Official MSP is **${priceText}**.\n\n` : ''}• **Paddy (Common)**: ₹2,300 / Quintal (+₹117 hike)\n• **Wheat**: ₹2,275 / Quintal (+₹150 hike)\n• **Rapeseed & Mustard**: ₹5,650 / Quintal\n• **Cotton (Medium)**: ₹7,121 / Quintal\n• **Gram (Chana)**: ₹5,440 / Quintal\n\nAll prices are guaranteed minimum floor prices set by the Ministry of Agriculture.`,
        actionTarget: '/msp-rates'
      };
    }
  }

  // 2. Welfare Schemes (PM-Kisan, PMFBY, KCC)
  if (q.includes('scheme') || q.includes('pm-kisan') || q.includes('pmkisan') || q.includes('योजना') || q.includes('kcc') || q.includes('insurance') || q.includes('fasal') || q.includes('పథకాలు')) {
    if (lang === 'hi') {
      return {
        text: `🏛️ **प्रमुख सरकारी किसान कल्याण योजनाएं**:\n\n1. **पीएम-किसान (PM-KISAN)**: ₹6,000 प्रति वर्ष (₹2,000 की 3 किस्तों में सीधे बैंक खाते में)। 17वीं किस्त जारी हो चुकी है।\n2. **पीएम फसल बीमा योजना (PMFBY)**: अप्रत्याशित मौसम, बाढ़ अथवा सूखे के खिलाफ 100% सुरक्षा।\n3. **किसान क्रेडिट कार्ड (KCC)**: 4% की रियायती ब्याज दर पर ₹3 लाख तक का कृषि ऋण।\n4. **ई-मंडी गेट पास**: लंबी कतारों से मुक्ति के लिए डिजिटल टोकन।`,
        actionTarget: '/help'
      };
    } else if (lang === 'te') {
      return {
        text: `🏛️ **ప్రభుత్వ రైతు సంక్షేమ పథకాలు**:\n\n1. **పిఎం-కిసాన్ (PM-KISAN)**: సంవత్సరానికి ₹6,000 నగదు సాయం (3 విడతల్లో ₹2,000 చొప్పున నేరుగా బ్యాంక్ ఖాతాలో).\n2. **పిఎం ఫసల్ బీమా యోజన (PMFBY)**: వర్షాభావం, ప్రకృతి వైపరీత్యాల నుండి పంట రక్షణ.\n3. **కిసాన్ క్రెడిట్ కార్డ్ (KCC)**: తక్కువ వడ్డీకే (4%) ₹3 లక్షల వరకు పంట రుణం.`,
        actionTarget: '/help'
      };
    } else {
      return {
        text: `🏛️ **Key Government Farmer Welfare Schemes**:\n\n1. **PM-KISAN**: ₹6,000 annual direct benefit transfer across 3 equal cycles. 17th Installment released.\n2. **PMFBY**: Low premium crop insurance against unseasonal rains and droughts.\n3. **Kisan Credit Card (KCC)**: Up to ₹3 Lakh institutional credit at just 4% interest rate.\n4. **AgriStack Registry**: Unique Farmer ID linked to digital land records.`,
        actionTarget: '/help'
      };
    }
  }

  // 3. Mandi Entry & Tokens
  if (q.includes('token') || q.includes('gate') || q.includes('slot') || q.includes('टोकन') || q.includes('गेट') || q.includes('పాస్') || q.includes('బుకింగ్')) {
    if (lang === 'hi') {
      return {
        text: `🎫 **ई-मंडी डिजिटल गेट पास (टोकन) सेवा**:\n\nकिसान भाई अपनी फसल मंडी लाने से पहले पोर्टल पर **Mandi Entry Slot** बुक कर सकते हैं। इससे मंडी गेट पर बिना इंतज़ार के तुरंत डिजिटल QR पास जारी हो जाता है।\n\n• किसान पोर्टल में लॉगिन करें\n• 'Book Mandi Entry Slot' चुनें\n• अपनी तारीख एवं मंडी का चयन करें और QR गेट पास प्राप्त करें।`,
        actionTarget: '/farmer/login'
      };
    } else if (lang === 'te') {
      return {
        text: `🎫 **ఈ-మండి డిజిటల్ గేట్ పాస్ (టోకెన్)**:\n\nరైతులు తమ ధాన్యాన్ని మార్కెట్‌కు తీసుకురావడానికి ముందే గేట్ పాస్ స్లాట్ బుక్ చేసుకోవచ్చు. దీనివల్ల వేచి ఉండే సమయం తగ్గుతుంది.\n\n• రైతు పోర్టల్ లాగిన్ అవ్వండి\n• 'Book Mandi Entry' ఎంచుకుని మీ QR పాస్ పొందండి.`,
        actionTarget: '/farmer/login'
      };
    } else {
      return {
        text: `🎫 **Digital Mandi Gate Pass (Token Booking)**:\n\nFarmers can pre-book their arrival slot at any registered APMC mandi. This generates a verifiable QR code gate pass and minimizes vehicle queue wait time under 30 minutes.\n\nLogin to the Farmer Portal and click on **Mandi Entry Slot** to book today!`,
        actionTarget: '/farmer/login'
      };
    }
  }

  // 4. Default Assistant Introduction
  if (lang === 'hi') {
    return {
      text: `🇮🇳 **नमस्ते! मैं जेमिनी (Gemini) कृषि-एआई सहायक हूँ।**\n\nमैं आपकी किस प्रकार सहायता कर सकता हूँ?\n• **एमएसपी भाव**: "गेहूं या धान का सरकारी भाव क्या है?"\n• **पोर्टल नेविगेशन**: "किसान पोर्टल खोलो" या "व्यापारी लॉगिन"\n• **सरकारी योजनाएं**: "पीएम किसान सम्मान निधि की जानकारी"\n• **डिजिटल टोकन**: "मंडी गेट पास कैसे बनाएं?"\n• **पेज एक्सेसिबिलिटी**: "नीचे स्क्रॉल करो" अथवा "पेज पढ़ो"`,
      actionTarget: null
    };
  } else if (lang === 'te') {
    return {
      text: `🇮🇳 **నమస్కారం! నేను జెమిని (Gemini) అగ్రి-AI అసిస్టెంట్.**\n\nనేను మీకు ఎలా సహాయపడగలను?\n• **MSP ధరలు**: "వరి లేదా గోధుమల ప్రభుత్వ ధర ఎంత?"\n• **పోర్టల్స్**: "రైతు పోర్టల్ తెరవండి" లేదా "వ్యాపారి లాగిన్"\n• **పథకాలు**: "పిఎం కిసాన్ పథకం వివరాలు"\n• **టోకెన్**: "మండి గేట్ పాస్ బుకింగ్"`,
      actionTarget: null
    };
  } else {
    return {
      text: `🇮🇳 **Hello! I am Gemini Agri-AI, your unified agricultural assistant.**\n\nHow can I assist your farming or agri-trade operations today?\n• **Official MSP Pricing**: "What is the MSP for Paddy or Wheat?"\n• **Instant Navigation**: "Open Farmer Portal" or "Trader Console"\n• **Government Schemes**: "Tell me about PM-KISAN or KCC"\n• **Digital Gate Entry**: "How to book mandi gate pass?"\n• **Voice Control**: Speak naturally in English, Hindi, or Telugu!`,
      actionTarget: null
    };
  }
}

/**
 * Main Gemini AI Chat & Voice Command Endpoint
 */
exports.chat = async (req, res) => {
  try {
    const { message, language = 'en', currentPath = '/', role = 'guest' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const cleanInput = message.trim();
    const isTelugu = /[\u0C00-\u0C7F]/.test(cleanInput);
    const isHindi = /[\u0900-\u097F]/.test(cleanInput);
    const detectedLang = isTelugu ? 'te' : (isHindi ? 'hi' : language);

    // 1. Analyze for proactive website actions (Navigation, Scroll, Read)
    const intentAnalysis = analyzeIntent(cleanInput, detectedLang);

    // 2. Check if external Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are "Gemini Agri-AI", an intelligent, empathetic, trilingual agricultural AI assistant for the Smart India Hackathon E-Mandi platform by the Government of India.
Current User Role: ${role}.
Current Page: ${currentPath}.
Language: Respond in ${detectedLang === 'hi' ? 'Hindi (हिन्दी)' : detectedLang === 'te' ? 'Telugu (తెలుగు)' : 'English'}.
Key Facts:
- 2024-25 MSP: Paddy ₹2,300/Qtl, Wheat ₹2,275/Qtl, Mustard ₹5,650/Qtl, Cotton ₹7,121/Qtl, Gram ₹5,440/Qtl.
- Schemes: PM-KISAN (₹6000/yr), PMFBY crop insurance, Kisan Credit Card (KCC 4% interest).
- Features: Gate pass booking, e-NWR warehouse trade, Farmgate procurement, live auction bidding.
Keep responses concise, helpful, and formatted with markdown bullet points and emojis.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await axios.post(geminiUrl, {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${cleanInput}` }]
            }
          ]
        }, { timeout: 8000 });

        const candidates = response.data?.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
          const replyText = candidates[0].content.parts[0].text;
          return res.status(200).json({
            success: true,
            provider: 'Google Gemini 1.5 Flash',
            detectedLanguage: detectedLang,
            reply: replyText,
            action: intentAnalysis.action,
            target: intentAnalysis.target || null,
            actionLabel: intentAnalysis.actionLabel ? intentAnalysis.actionLabel[detectedLang] || intentAnalysis.actionLabel.en : null
          });
        }
      } catch (geminiApiError) {
        console.warn('Google Gemini API request failed, using local Agri-AI engine:', geminiApiError.message);
      }
    }

    // 3. Fallback to High-Performance Built-in Agricultural Knowledge Engine
    const generated = generateAgriculturalResponse(cleanInput, detectedLang);
    return res.status(200).json({
      success: true,
      provider: 'Gemini Agri-AI Enterprise Engine',
      detectedLanguage: detectedLang,
      reply: generated.text,
      action: intentAnalysis.action,
      target: intentAnalysis.target || generated.actionTarget || null,
      actionLabel: intentAnalysis.actionLabel ? intentAnalysis.actionLabel[detectedLang] || intentAnalysis.actionLabel.en : (generated.actionTarget ? 'Open Portal' : null)
    });

  } catch (error) {
    console.error('Gemini Controller Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI query',
      reply: 'An error occurred while consulting Gemini AI. Please try again or rephrase your question.'
    });
  }
};
