import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, Mic, MicOff, Send, X, Volume2, VolumeX, 
  ExternalLink, ArrowRight, Bot, User, Check, RefreshCw,
  Compass, ShieldCheck, ChevronDown, ChevronUp, Layers, HelpCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { useSettings } from '../context/SettingsContext';

const GeminiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'gemini',
      text: `🌾 **Namaste! I am Gemini Agri-AI, your official multilingual agricultural assistant.**\n\nI can help you with:\n• **Official MSP 2024-25**: Instant rates for Wheat, Paddy, Mustard, Cotton & more\n• **Direct Navigation**: "Open Farmer Portal", "Trader Login", or "District Admin"\n• **Govt Schemes**: PM-KISAN, PMFBY Crop Insurance, Kisan Credit Card (KCC)\n• **Mandi Services**: Gate pass slots, e-NWR warehouse trade, bidding guide\n\nSpeak or type in **English**, **हिन्दी (Hindi)**, or **తెలుగు (Telugu)**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: null
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [currentLang, setCurrentLang] = useState('en'); // 'en', 'hi', 'te'
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language: siteLanguage } = useSettings();

  // Sync with global site language on mount or change
  useEffect(() => {
    if (siteLanguage === 'hi' || siteLanguage === 'te' || siteLanguage === 'en') {
      setCurrentLang(siteLanguage);
    }
  }, [siteLanguage]);

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Text-to-Speech Vocalizer
  const speakText = useCallback((text, langCode = currentLang) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for clear vocalization
      const cleanText = text
        .replace(/[*#_`]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langLocaleMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'te': 'te-IN'
      };
      utterance.lang = langLocaleMap[langCode] || 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(utterance.lang.toLowerCase())) || voices[0];
      if (matchedVoice) utterance.voice = matchedVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }, [speechEnabled, currentLang]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;

    const langCodeMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'te': 'te-IN'
    };
    recog.lang = langCodeMap[currentLang] || 'en-IN';

    recog.onstart = () => {
      setIsListening(true);
      setLiveTranscript('');
    };

    recog.onresult = (event) => {
      let interim = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setLiveTranscript(finalTranscript || interim);

      if (finalTranscript) {
        setIsListening(false);
        handleSendQuery(finalTranscript.trim());
      }
    };

    recog.onerror = (event) => {
      console.warn('Speech Recognition error:', event.error);
      setIsListening(false);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recog;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLang]);

  // Toggle Voice Recognition
  const toggleListening = (e) => {
    e?.stopPropagation();
    if (!voiceSupported) {
      alert("Voice input is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (!isOpen) setIsOpen(true);
        recognitionRef.current?.start();
      } catch (err) {
        console.warn("Speech recognition start issue:", err);
      }
    }
  };

  // Execute Website Autonomous Action
  const executeAction = (action, target) => {
    if (!action) return;
    if (action === 'NAVIGATE' && target) {
      navigate(target);
    } else if (action === 'SCROLL_DOWN') {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    } else if (action === 'SCROLL_UP') {
      window.scrollBy({ top: -window.innerHeight * 0.75, behavior: 'smooth' });
    } else if (action === 'READ_PAGE') {
      const pageText = document.querySelector('main')?.innerText || document.body.innerText;
      const snippet = pageText.slice(0, 300);
      speakText(`Reading page content: ${snippet}`);
    }
  };

  // Main Query Handler (Calls Backend /api/gemini/chat)
  const handleSendQuery = async (queryText = inputMessage) => {
    const textToSend = (queryText || '').trim();
    if (!textToSend || isLoading) return;

    // 1. Add User Message
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 2. Call Backend Gemini API Endpoint
      const response = await axios.post(`${API_BASE_URL}/api/gemini/chat`, {
        message: textToSend,
        language: currentLang,
        currentPath: location.pathname
      });

      const data = response.data;
      const replyText = data.reply || "I am ready to help you with MSP rates, mandis, or navigation.";
      const detectedLanguage = data.detectedLanguage || currentLang;

      // 3. Add Gemini Message
      const geminiMsg = {
        id: 'gemini-' + Date.now(),
        sender: 'gemini',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action !== 'NONE' ? {
          type: data.action,
          target: data.target,
          label: data.actionLabel || 'Go to Section'
        } : null
      };

      setMessages(prev => [...prev, geminiMsg]);

      // 4. Speak response aloud if speech enabled
      speakText(replyText, detectedLanguage);

      // 5. Automatically trigger action if direct command
      if (data.action && data.action !== 'NONE') {
        setTimeout(() => {
          executeAction(data.action, data.target);
        }, 1200);
      }

    } catch (err) {
      console.error("Gemini API query error:", err);
      const fallbackMsg = {
        id: 'gemini-err-' + Date.now(),
        sender: 'gemini',
        text: "I couldn't reach the central server right now, but you can explore **MSP Rates** (`/msp-rates`), **Farmer Portal** (`/farmer/login`), or **Trader Console** (`/trader/login`) directly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: { type: 'NAVIGATE', target: '/msp-rates', label: 'View MSP Rates' }
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setLiveTranscript('');
    }
  };

  // Pre-configured Quick Action Chips
  const quickChips = [
    { label: "🌾 Wheat & Paddy MSP 2024-25", query: "What is the official MSP for Wheat and Paddy for 2024-25?" },
    { label: "🎫 Book Mandi Slot (Token)", query: "How can I book a Mandi Gate Pass token?" },
    { label: "👨‍🌾 Open Farmer Portal", query: "Open Farmer Portal" },
    { label: "⚖️ Trader Bidding Console", query: "Go to Trader Portal" },
    { label: "🏛️ PM-KISAN 17th Installment", query: "Tell me about PM-KISAN Samman Nidhi scheme" },
    { label: "📜 e-NWR Warehouse Trade", query: "What is e-NWR electronic warehouse receipt trading?" }
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FANCY DESIGNABLE CORNER BADGE (Always Visible Floating) */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 select-none">
        
        {/* Glow Aura Rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 blur-lg opacity-70 animate-pulse -z-10 scale-110"></div>

        {/* Outer Pill Container */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(79,70,229,0.45)] hover:shadow-[0_12px_40px_rgba(147,51,234,0.6)] ${
            isOpen 
              ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-indigo-400/60' 
              : 'bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white hover:scale-105'
          }`}
          title="Click to talk with Gemini Agri-AI"
        >
          {/* Animated Gemini Sparkle Emblem */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 border border-white/40 shadow-inner">
            <Sparkles size={18} className="text-amber-300 animate-spin-slow" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          </div>

          {/* Badge Label & Status */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 font-extrabold tracking-wide text-sm text-white drop-shadow-sm">
              <span>Gemini AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-300/30">
                Agri-v1.5
              </span>
            </div>
            <span className="text-[11px] text-indigo-100 font-medium opacity-90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {isListening ? 'Listening...' : 'Voice & Chat Assistant'}
            </span>
          </div>

          {/* Integrated Quick Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-300 ml-1 border ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-white/15 hover:bg-white/30 text-white border-white/30 hover:scale-110'
            }`}
            title={isListening ? "Listening... Click to stop" : "Speak voice command in English, Hindi, or Telugu"}
            aria-label="Toggle Voice Command"
          >
            {isListening ? (
              <div className="flex items-center gap-0.5 px-0.5">
                <span className="w-1 h-3.5 bg-white rounded-full animate-bounce"></span>
                <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </div>
            ) : (
              <Mic size={16} />
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. EXPANDED GEMINI AI INTERACTIVE MODAL CONSOLE           */}
      {/* ======================================================== */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[460px] md:w-[480px] h-[640px] max-h-[82vh] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-slate-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header Banner */}
          <div className="relative p-4 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border-b border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-purple-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles size={20} className="text-amber-300 animate-spin-slow" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  Gemini Agri-AI Assistant
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                    Online
                  </span>
                </h3>
                <p className="text-xs text-indigo-200">Official Multilingual e-Mandi Intelligence</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5">
              {/* Audio Vocalizer Toggle */}
              <button
                onClick={() => {
                  setSpeechEnabled(!speechEnabled);
                  if (speechEnabled) window.speechSynthesis.cancel();
                }}
                className={`p-1.5 rounded-lg border transition ${
                  speechEnabled ? 'bg-indigo-600/40 border-indigo-400/50 text-indigo-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title={speechEnabled ? "Voice Output Active (Click to Mute)" : "Voice Output Muted (Click to Unmute)"}
              >
                {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                title="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Language Switcher Bar */}
          <div className="px-4 py-2 bg-slate-950/70 border-b border-indigo-950 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              Language / भाषा / భాష:
            </span>
            <div className="flex gap-1">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'te', label: 'తెలుగు' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLang(lang.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                    currentLang === lang.code 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Listening Banner with Equalizer */}
          {isListening && (
            <div className="p-3.5 bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border-b border-rose-500/40 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                  <Mic size={16} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-200">Listening to your voice...</p>
                  <p className="text-xs text-slate-300 italic truncate max-w-[240px]">
                    {liveTranscript || "Speak in English, Hindi, or Telugu..."}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleListening}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Stop
              </button>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'gemini' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center text-slate-950 shrink-0 mt-0.5 shadow-sm">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 rounded-tl-none shadow-sm'
                }`}>
                  {/* Message Content with Markdown rendering */}
                  <div className="whitespace-pre-wrap space-y-1">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('•') || line.startsWith('-')) {
                        return (
                          <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5">
                            <span className="text-indigo-400 font-bold shrink-0">•</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.slice(1).trim()) }}></span>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}></p>
                      );
                    })}
                  </div>

                  {/* Interactive Action Card / Button if attached */}
                  {msg.action && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs text-indigo-300 font-medium">Suggested Action:</span>
                      <button
                        onClick={() => executeAction(msg.action.type, msg.action.target)}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                      >
                        {msg.action.label} <ArrowRight size={13} />
                      </button>
                    </div>
                  )}

                  <span className="block text-[10px] text-slate-400 text-right mt-1 opacity-70">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center text-slate-950 shrink-0">
                  <Bot size={15} />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/70 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-indigo-300 text-xs">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Gemini Agri-AI is consulting agricultural models...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-2">
            {quickChips.map((chip, index) => (
              <button
                key={index}
                onClick={() => handleSendQuery(chip.query)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-400/50 text-[11px] font-medium text-slate-300 hover:text-indigo-200 transition"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="p-3 bg-slate-950 border-t border-indigo-950 flex items-center gap-2"
          >
            {/* Mic Toggle Inside Bar */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition ${
                isListening 
                  ? 'bg-rose-600 border-rose-400 text-white animate-pulse' 
                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-indigo-300 hover:text-white'
              }`}
              title="Speak voice command"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Input Field */}
            <input 
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                currentLang === 'hi' 
                  ? 'जेमिनी से पूछें अथवा बोलें (उदा. गेहूं का सरकारी भाव)...' 
                  : currentLang === 'te' 
                  ? 'జెమిని AI ని అడగండి లేదా మాట్లాడండి...' 
                  : 'Ask Gemini AI or speak (e.g. "Wheat MSP", "Open Farmer Portal")...'
              }
              className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              disabled={isLoading}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition shadow-sm"
              title="Send Message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// Simple inline helper for bold and rupee highlights
function formatInlineMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/(₹[0-9,]+(\/[a-zA-Z]+)?)/g, '<span class="px-1 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono font-bold">$1</span>');
}

export default GeminiAssistant;
