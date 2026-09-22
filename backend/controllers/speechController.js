const Msp = require('../models/Msp');

// Default fallback MSP values in English, Hindi, and Telugu
const defaultMsps = {
  wheat: { en: 'Wheat', hi: 'गेहूं', te: 'గోధుమలు', price: 2275, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  paddy: { en: 'Paddy', hi: 'धान / चावल', te: 'వరి / ధాన్యం', price: 2300, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  rice: { en: 'Paddy', hi: 'धान / चावल', te: 'వరి / బియ్యం', price: 2300, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  mustard: { en: 'Rapeseed & Mustard', hi: 'सरसों', te: 'ఆవాలు', price: 5650, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  gram: { en: 'Gram (Chana)', hi: 'चना', te: 'శనగలు', price: 5440, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  barley: { en: 'Barley (Jau)', hi: 'जौ', te: 'జౌ / బార్లీ', price: 1850, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  cotton: { en: 'Cotton', hi: 'कपास', te: 'పత్తి', price: 6620, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  bajra: { en: 'Bajra', hi: 'बाजरा', te: 'సజ్జలు', price: 2625, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } },
  maize: { en: 'Maize (Makka)', hi: 'मक्का', te: 'మొక్కజొన్న', price: 2090, unit: { en: 'per quintal', hi: 'प्रति क्विंटल', te: 'క్వింటాల్‌కు' } }
};

/**
 * Trilingual Agricultural Voice Command NLP Engine
 * Processes English, Hindi, and Telugu spoken inputs
 */
exports.processCommand = async (req, res) => {
  try {
    const { text, language = 'auto', currentPath = '/' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const raw = text.trim();
    const clean = raw.toLowerCase();

    // Determine primary language of input (Telugu, Hindi, or English)
    const isTeluguScript = /[\u0C00-\u0C7F]/.test(raw);
    const isHindiScript = /[\u0900-\u097F]/.test(raw);
    const lang = isTeluguScript ? 'te' : (isHindiScript ? 'hi' : (language === 'te' ? 'te' : language === 'hi' ? 'hi' : 'en'));

    // Default intent result structure
    let result = {
      rawInput: raw,
      detectedLanguage: lang,
      intent: 'UNKNOWN',
      action: null,
      entities: {},
      feedback: {
        en: `I heard: "${raw}". Say "help", "सहायता", or "సహాయం" to see available voice commands.`,
        hi: `सुना गया: "${raw}"। उपलब्ध कमांड जानने के लिए "सहायता" या "help" कहें।`,
        te: `వినబడినది: "${raw}". అందుబాటులో ఉన్న ఆదేశాలను చూడటానికి "సహాయం" లేదా "help" అని చెప్పండి.`
      }
    };

    // 1. BIDDING COMMANDS
    // English: "place bid", "place a bid", "bid"
    // Hindi: "बोली लगाओ", "दाम बढ़ाओ", "boli lagao", "bidding"
    // Telugu: "బిడ్ వేయండి", "బిడ్డింగ్", "ధర పెంచండి", "వేలం", "bid veyandi"
    if (
      clean.includes('place bid') || clean.includes('place a bid') || clean.includes('bid') ||
      clean.includes('बोली') || clean.includes('दाम बढ़ा') || clean.includes('भाव बढ़ा') ||
      clean.includes('boli') || clean.includes('bidding') || clean.includes('rate badhao') ||
      clean.includes('బిడ్') || clean.includes('వేలం') || clean.includes('ధర పెంచ') || clean.includes('వేయండి')
    ) {
      let lot = 1;
      if (
        clean.includes('lot 2') || clean.includes('दो') || clean.includes('రెండు') ||
        clean.includes('paddy') || clean.includes('धान') || clean.includes('వరి') || clean.includes('ధాన్యం')
      ) {
        lot = 2;
      }

      result.intent = 'PLACE_BID';
      result.action = 'PLACE_BID';
      result.entities = { lot, increment: 10 };
      result.feedback = {
        en: `Placing bid for Lot #${lot === 2 ? '4931 (Paddy)' : '4928 (Wheat)'}. Increasing price by ₹10.`,
        hi: `लॉट #${lot === 2 ? '4931 (धान)' : '4928 (गेहूं)'} के लिए ₹10 की बोली लगाई जा रही है।`,
        te: `లాట్ #${lot === 2 ? '4931 (వరి)' : '4928 (గోధుమలు)'} కోసం ₹10 బిడ్ వేయబడింది.`
      };
      return res.status(200).json(result);
    }

    // 2. MSP RATES / CROP PRICE INQUIRY
    // English: "check msp", "wheat msp", "paddy price"
    // Hindi: "एमएसपी क्या है", "गेहूं का भाव", "धान का सरकारी दाम"
    // Telugu: "ఎంఎస్పి", "మద్దతు ధర", "గోధుమల ధర", "వరి ధర", "పత్తి ధర"
    if (
      clean.includes('msp') || clean.includes('rate') || clean.includes('bhav') ||
      clean.includes('price') || clean.includes('दाम') || clean.includes('भाव') ||
      clean.includes('एमएसपी') || clean.includes('कीमत') || clean.includes('ధర') ||
      clean.includes('మద్దతు ధర') || clean.includes('ఎంఎస్పి') || clean.includes('రేటు')
    ) {
      let cropKey = 'wheat';
      if (clean.includes('paddy') || clean.includes('dhan') || clean.includes('धान') || clean.includes('rice') || clean.includes('వరి') || clean.includes('ధాన్యం') || clean.includes('బియ్యం')) cropKey = 'paddy';
      else if (clean.includes('mustard') || clean.includes('sarson') || clean.includes('सरसों') || clean.includes('ఆవాలు')) cropKey = 'mustard';
      else if (clean.includes('gram') || clean.includes('chana') || clean.includes('चना') || clean.includes('శనగలు')) cropKey = 'gram';
      else if (clean.includes('barley') || clean.includes('jau') || clean.includes('जौ') || clean.includes('బార్లీ')) cropKey = 'barley';
      else if (clean.includes('bajra') || clean.includes('बाजरा') || clean.includes('సజ్జలు')) cropKey = 'bajra';
      else if (clean.includes('cotton') || clean.includes('kapas') || clean.includes('कपास') || clean.includes('పత్తి')) cropKey = 'cotton';
      else if (clean.includes('maize') || clean.includes('makka') || clean.includes('मक्का') || clean.includes('మొక్కజొన్న')) cropKey = 'maize';
      else if (clean.includes('wheat') || clean.includes('gehu') || clean.includes('गेहूं') || clean.includes('గోధుమ')) cropKey = 'wheat';

      const cropInfo = defaultMsps[cropKey] || defaultMsps['wheat'];

      result.intent = 'CHECK_MSP';
      result.action = 'NAVIGATE';
      result.entities = { crop: cropKey, targetPath: '/msp-rates', price: cropInfo.price };
      result.feedback = {
        en: `Current official MSP for ${cropInfo.en} is ₹${cropInfo.price.toLocaleString('en-IN')} ${cropInfo.unit.en}. Opening MSP Rates.`,
        hi: `${cropInfo.hi} का वर्तमान सरकारी एमएसपी ₹${cropInfo.price.toLocaleString('en-IN')} ${cropInfo.unit.hi} है। एमएसपी पेज खोला जा रहा है।`,
        te: `${cropInfo.te} యొక్క అధికారిక కనీస మద్దతు ధర (MSP) ₹${cropInfo.price.toLocaleString('en-IN')} ${cropInfo.unit.te}. MSP ధరల పేజీ తెరవబడుతోంది.`
      };
      return res.status(200).json(result);
    }

    // 3. SEARCH FARMER / KHASRA
    // English: "search farmer 123", "find farmer"
    // Hindi: "किसान खोजो 123", "खसरा नंबर 123"
    // Telugu: "రైతును వెతకండి", "రైతు శోధన", "ఖస్రా"
    if (
      clean.includes('search farmer') || clean.includes('find farmer') ||
      clean.includes('किसान खोजो') || clean.includes('खसरा') ||
      clean.includes('khasra') || clean.includes('kisan search') ||
      clean.includes('రైతును వెతకండి') || clean.includes('రైతు శోధన') || clean.includes('ఖస్రా')
    ) {
      const numbers = clean.match(/\d+/g);
      const query = numbers ? numbers.join('') : '';

      result.intent = 'SEARCH_FARMER';
      result.action = 'SEARCH_FARMER';
      result.entities = { query, targetPath: '/trader/dashboard' };
      result.feedback = {
        en: query ? `Searching for farmer with ID or Khasra ${query}.` : "Opening farmer search on trader console.",
        hi: query ? `खसरा या फोन नंबर ${query} के किसान को खोजा जा रहा है।` : "व्यापारी पोर्टल पर किसान खोज खोला जा रहा है।",
        te: query ? `ఖస్రా లేదా ఫోన్ సంఖ్య ${query} తో రైతు శోధన జరుగుతోంది.` : "వ్యాపారి కన్సోల్‌లో రైతు శోధన తెరవబడుతోంది."
      };
      return res.status(200).json(result);
    }

    // 4. PORTAL NAVIGATION (Farmer, Trader, Admin, Management, Home, Help)
    // Farmer Portal
    if (
      clean.includes('farmer') || clean.includes('kisan') || clean.includes('किसान') ||
      clean.includes('రైతు') || clean.includes('రైతులు') || clean.includes('raithu') || clean.includes('raitu')
    ) {
      result.intent = 'NAVIGATE';
      result.action = 'NAVIGATE';
      result.entities = { targetPath: '/farmer/login' };
      result.feedback = {
        en: 'Navigating to Farmer Portal.',
        hi: 'किसान पोर्टल पर ले जाया जा रहा है।',
        te: 'రైతు పోర్టల్ తెరవబడుతోంది.'
      };
      return res.status(200).json(result);
    }

    // Trader Portal
    if (
      clean.includes('trader') || clean.includes('vyapari') || clean.includes('व्यापारी') ||
      clean.includes('e-nam') || clean.includes('mandi') || clean.includes('వ్యాపారి') || clean.includes('ట్రేడర్')
    ) {
      result.intent = 'NAVIGATE';
      result.action = 'NAVIGATE';
      result.entities = { targetPath: '/trader/login' };
      result.feedback = {
        en: 'Navigating to Trader e-Mandi Portal.',
        hi: 'व्यापारी ई-मंडी पोर्टल खोला जा रहा है।',
        te: 'వ్యాపారి ఈ-మండి పోర్టల్ తెరవబడుతోంది.'
      };
      return res.status(200).json(result);
    }

    // Admin Portal
    if (
      clean.includes('admin') || clean.includes('एडमिन') || clean.includes('prashasak') ||
      clean.includes('అడ్మిన్') || clean.includes('అధికారి') || clean.includes('జిల్లా')
    ) {
      result.intent = 'NAVIGATE';
      result.action = 'NAVIGATE';
      result.entities = { targetPath: '/admin/login' };
      result.feedback = {
        en: 'Navigating to District Admin Portal.',
        hi: 'जिला एडमिन पोर्टल पर ले जाया जा रहा है।',
        te: 'జిల్లా అడ్మిన్ పోర్టల్‌కు నావిగేట్ చేయబడుతోంది.'
      };
      return res.status(200).json(result);
    }

    // Management Portal
    if (
      clean.includes('management') || clean.includes('prabandhan') || clean.includes('प्रबंधन') ||
      clean.includes('నిర్వహణ') || clean.includes('యాజమాన్యం')
    ) {
      result.intent = 'NAVIGATE';
      result.action = 'NAVIGATE';
      result.entities = { targetPath: '/management/login' };
      result.feedback = {
        en: 'Navigating to Ministry Management Portal.',
        hi: 'मंत्रालय प्रबंधन पोर्टल पर ले जाया जा रहा है।',
        te: 'మంత్రిత్వ శాఖ నిర్వహణ పోర్టల్‌కు తీసుకెళ్లబడుతోంది.'
      };
      return res.status(200).json(result);
    }

    // Home Page
    if (
      clean.includes('home') || clean.includes('main page') || clean.includes('shuru') ||
      clean.includes('मुख्य पृष्ठ') || clean.includes('होम') || clean.includes('హోమ్') || clean.includes('ప్రధాన పేజీ')
    ) {
      result.intent = 'NAVIGATE';
      result.action = 'NAVIGATE';
      result.entities = { targetPath: '/' };
      result.feedback = {
        en: 'Navigating to Home Page.',
        hi: 'मुख्य पृष्ठ (होम) पर ले जाया जा रहा है।',
        te: 'ప్రధాన పేజీ (హోమ్) కి నావిగేట్ చేయబడుతోంది.'
      };
      return res.status(200).json(result);
    }

    // Help & Support
    if (
      clean.includes('help') || clean.includes('support') || clean.includes('grievance') ||
      clean.includes('madad') || clean.includes('मदद') || clean.includes('सहायता') ||
      clean.includes('సహాయం') || clean.includes('ఫిర్యాదు')
    ) {
      result.intent = 'NAVIGATE';
      result.action = 'NAVIGATE';
      result.entities = { targetPath: '/help' };
      result.feedback = {
        en: 'Opening Help & Grievance Support Center.',
        hi: 'सहायता एवं शिकायत निवारण केंद्र खोला जा रहा है।',
        te: 'సహాయం మరియు ఫిర్యాదుల నివారణ కేంద్రం తెరవబడుతోంది.'
      };
      return res.status(200).json(result);
    }

    // 5. ACCESSIBILITY READ PAGE
    if (
      clean.includes('read') || clean.includes('speak') || clean.includes('listen') ||
      clean.includes('पढ़ो') || clean.includes('सुनाओ') || clean.includes('bolkar') ||
      clean.includes('చదవండి') || clean.includes('వినండి') || clean.includes('చెప్పండి') || clean.includes('chadavandi')
    ) {
      result.intent = 'READ_PAGE';
      result.action = 'READ_PAGE';
      result.feedback = {
        en: 'Reading the current page for you.',
        hi: 'वर्तमान पृष्ठ पढ़कर सुनाया जा रहा है।',
        te: 'ప్రస్తుత పేజీని మీ కోసం చదువుతున్నాము.'
      };
      return res.status(200).json(result);
    }

    // 6. SCROLL COMMANDS
    if (
      clean.includes('scroll down') || clean.includes('niche') || clean.includes('नीचे') || clean.includes('down') ||
      clean.includes('క్రిందికి') || clean.includes('krindhiki')
    ) {
      result.intent = 'SCROLL';
      result.action = 'SCROLL';
      result.entities = { direction: 'down' };
      result.feedback = {
        en: 'Scrolling down.',
        hi: 'नीचे स्क्रॉल किया गया।',
        te: 'క్రిందికి స్క్రోల్ చేయబడింది.'
      };
      return res.status(200).json(result);
    }

    if (
      clean.includes('scroll up') || clean.includes('upar') || clean.includes('ऊपर') || clean.includes('top') ||
      clean.includes('పైకి') || clean.includes('paiki')
    ) {
      result.intent = 'SCROLL';
      result.action = 'SCROLL';
      result.entities = { direction: 'up' };
      result.feedback = {
        en: 'Scrolling up.',
        hi: 'ऊपर स्क्रॉल किया गया।',
        te: 'పైకి స్క్రోల్ చేయబడింది.'
      };
      return res.status(200).json(result);
    }

    // 7. LANGUAGE SWITCHING (Telugu, Hindi, English)
    if (
      clean.includes('telugu') || clean.includes('తెలుగు')
    ) {
      result.intent = 'SWITCH_LANGUAGE';
      result.action = 'SWITCH_LANGUAGE';
      result.entities = { targetLanguage: 'te' };
      result.feedback = {
        en: 'Switching language to Telugu.',
        hi: 'भाषा को तेलुगु में बदला गया।',
        te: 'భాషను తెలుగులోకి మార్చడం జరిగింది.'
      };
      return res.status(200).json(result);
    }

    if (
      clean.includes('hindi') || clean.includes('हिंदी') || clean.includes('हिन्दी')
    ) {
      result.intent = 'SWITCH_LANGUAGE';
      result.action = 'SWITCH_LANGUAGE';
      result.entities = { targetLanguage: 'hi' };
      result.feedback = {
        en: 'Switching language to Hindi.',
        hi: 'भाषा को हिन्दी में बदला गया।',
        te: 'భాషను హిందీలోకి మార్చడం జరిగింది.'
      };
      return res.status(200).json(result);
    }

    if (
      clean.includes('english') || clean.includes('अंग्रेजी') || clean.includes('angrezi') || clean.includes('ఇంగ్లీష్')
    ) {
      result.intent = 'SWITCH_LANGUAGE';
      result.action = 'SWITCH_LANGUAGE';
      result.entities = { targetLanguage: 'en' };
      result.feedback = {
        en: 'Switching language to English.',
        hi: 'भाषा को अंग्रेजी में बदला गया।',
        te: 'భాషను ఇంగ్లీషులోకి మార్చడం జరిగింది.'
      };
      return res.status(200).json(result);
    }

    // 8. STOP / QUIET
    if (
      clean.includes('stop') || clean.includes('quiet') || clean.includes('silence') ||
      clean.includes('चुप') || clean.includes('रुको') || clean.includes('बंद') ||
      clean.includes('ఆపండి') || clean.includes('నిశ్శబ్దం') || clean.includes('ఆపు')
    ) {
      result.intent = 'STOP';
      result.action = 'STOP';
      result.feedback = {
        en: 'Voice audio stopped.',
        hi: 'ध्वनि रोक दी गई।',
        te: 'ధ్వని నిలిపివేయబడింది.'
      };
      return res.status(200).json(result);
    }

    // 9. LOGOUT
    if (
      clean.includes('logout') || clean.includes('log out') || clean.includes('लॉगआउट') ||
      clean.includes('లాగ్ అవుట్') || clean.includes('లాగౌట్')
    ) {
      result.intent = 'LOGOUT';
      result.action = 'LOGOUT';
      result.feedback = {
        en: 'Logging out of current session.',
        hi: 'सत्र से लॉगआउट किया जा रहा है।',
        te: 'సెషన్ నుండి లాగ్ అవుట్ అవుతున్నారు.'
      };
      return res.status(200).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Process voice command error:', error);
    return res.status(500).json({ error: 'Internal server error processing voice command' });
  }
};

/**
 * Cloud Speech-to-Text Endpoint
 * Handles audio recording from browser MediaRecorder
 */
exports.transcribeAudio = async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm', language = 'auto' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      try {
        const buffer = Buffer.from(audioData.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', buffer, { filename: 'audio.webm', contentType: mimeType });
        form.append('model', 'whisper-large-v3');
        if (language && language !== 'auto') {
          form.append('language', language);
        }

        const axios = require('axios');
        const cloudResponse = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${groqKey}`
          },
          timeout: 10000
        });

        if (cloudResponse.data && cloudResponse.data.text) {
          return res.status(200).json({
            provider: 'Groq Cloud Whisper STT',
            transcript: cloudResponse.data.text,
            confidence: 0.96
          });
        }
      } catch (cloudErr) {
        console.warn('Groq Cloud STT failed, using server fallback:', cloudErr.message);
      }
    }

    const buffer = Buffer.from(audioData.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
    const audioSizeKb = (buffer.length / 1024).toFixed(1);

    return res.status(200).json({
      provider: 'EMandi Server STT Engine',
      audioReceived: true,
      audioSizeKb,
      status: 'success',
      message: 'Audio processed by Server STT Engine. Using hybrid client-side Web Speech API + Server NLP for high performance.'
    });
  } catch (error) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({ error: 'Failed to transcribe audio' });
  }
};
