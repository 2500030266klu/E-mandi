import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useSettings();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      
      const langMap = {
        'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN', 
        'ta': 'ta-IN', 'te': 'te-IN', 'pa': 'pa-IN', 
        'bn': 'bn-IN', 'or': 'or-IN', 'hr': 'hi-IN'
      };
      recog.lang = langMap[language] || 'en-IN';

      recog.onstart = () => {
        setIsListening(true);
        const listeningMsgs = {
          'en': 'Listening...', 'hi': 'सुन रहा हूँ...', 'te': 'వింటున్నాను...',
          'ta': 'கேட்கிறது...', 'mr': 'ऐकत आहे...', 'bn': 'শুনছি...'
        };
        setFeedback(listeningMsgs[language] || listeningMsgs['en']);
      };

      recog.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        handleCommand(result.trim().toLowerCase());
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        const errorMsgs = {
          'en': 'Error. Try again.', 'hi': 'त्रुटि हुई। फिर से प्रयास करें।',
          'te': 'లోపం. మళ్లీ ప్రయత్నించండి.'
        };
        setFeedback(errorMsgs[language] || errorMsgs['en']);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
        setFeedback('');
      };

      setRecognition(recog);
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, [language]); 

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMap = {
        'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN', 
        'ta': 'ta-IN', 'te': 'te-IN', 'pa': 'pa-IN', 
        'bn': 'bn-IN', 'or': 'or-IN', 'hr': 'hi-IN'
      };
      utterance.lang = langMap[language] || 'en-IN';
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes(utterance.lang)) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Utility to set React input values properly
  const setNativeValue = (element, value) => {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    
    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      valueSetter.call(element, value);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const handleCommand = (command) => {
    setFeedback(`Heard: "${command}"`);
    let matched = false;

    const t = {
      notUnderstood: { en: "I didn't understand.", hi: 'मैं समझ नहीं पाया।', te: 'నాకు అర్థం కాలేదు.' },
      scrolled: { en: 'Scrolled.', hi: 'स्क्रॉल किया।', te: 'స్క్రోల్ చేయబడింది.' },
    };
    const getMsg = (key) => t[key][language] || t[key]['en'];

    if (command.includes('scroll down') || command.includes('नीचे')) {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      speak(getMsg('scrolled'));
      matched = true;
    } else if (command.includes('scroll up') || command.includes('ऊपर')) {
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      speak(getMsg('scrolled'));
      matched = true;
    } else if (command.includes('farmer') || command.includes('किसान')) {
      navigate('/farmer/login');
      speak('Opening Farmer Portal');
      matched = true;
    } else if (command.includes('trader') || command.includes('treder') || command.includes('व्यापारी')) {
      navigate('/trader/login');
      speak('Opening Trader Portal');
      matched = true;
    } else if (command.includes('admin') || command.includes('एडमिन')) {
      navigate('/admin/login');
      speak('Opening Admin Portal');
      matched = true;
    } else if (command.includes('stop') || command.includes('quiet') || command.includes('चुप')) {
       window.speechSynthesis.cancel();
       setFeedback('Audio stopped.');
       matched = true;
    }

    if (!matched) {
      speak(getMsg('notUnderstood'));
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  if (!recognition) return null;

  return (
    <div className="relative flex items-center">
      {feedback && (
        <div className="absolute top-full right-0 mt-2 bg-white px-3 py-1.5 rounded shadow-lg text-xs font-medium text-gray-800 border border-gray-200 whitespace-nowrap z-50 animate-fade-in-up">
          {feedback}
        </div>
      )}
      <button
        onClick={toggleListen}
        className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center border border-white/20 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]'
        }`}
        aria-label="Voice AI Command"
        title="Voice AI Command"
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
