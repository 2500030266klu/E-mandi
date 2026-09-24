import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, ShieldCheck, Briefcase, Lock, AlertTriangle, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { traderLoginTranslations } from '../utils/translations';
import axios from 'axios';

const TraderLogin = () => {
  const [step, setStep] = useState(1);
  const [license, setLicense] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { language } = useSettings();
  const t = traderLoginTranslations[language] || traderLoginTranslations.en;

  const notRegisteredMsg = {
    en: "No registered trader found with this License ID & Phone. Please register your business first.",
    hi: "इस लाइसेंस आईडी और फ़ोन से कोई पंजीकृत व्यापारी नहीं मिला। कृपया पहले व्यवसाय पंजीकरण करें।",
    te: "ఈ లైసెన్స్ ఐడి & ఫోన్‌తో నమోదైన వ్యాపారి కనుగొనబడలేదు. దయచేసి ముందుగా వ్యాపారాన్ని నమోదు చేయండి.",
    ta: "இந்த உரிமம் & ஃபோனில் பதிவு செய்யப்பட்ட வணிகர் இல்லை. முதலில் வணிகத்தை பதிவு செய்யவும்.",
    mr: "या परवाना आयडी आणि फोनने नोंदणीकृत व्यापारी आढळला नाही. कृपया प्रथम व्यवसाय नोंदणी करा.",
    pa: "ਇਸ ਲਾਇਸੈਂਸ ਆਈਡੀ ਅਤੇ ਫ਼ੋਨ ਨਾਲ ਕੋਈ ਰਜਿਸਟਰਡ ਵਪਾਰੀ ਨਹੀਂ ਮਿਲਿਆ। ਪਹਿਲਾਂ ਵਪਾਰ ਰਜਿਸਟਰ ਕਰੋ।",
    hr: "इस लाइसेंस आईडी अर फोन तै कोई रजिस्टर्ड व्यापारी कोन्या मिल्या। पहल्यां व्यापार रजिस्टर करो।",
    bn: "এই লাইসেন্স আইডি ও ফোনে কোনো নিবন্ধিত ব্যবসায়ী পাওয়া যায়নি। আগে ব্যবসা নিবন্ধন করুন।",
    or: "ଏହି ଲାଇସେନ୍ସ ଆଇଡି ଓ ଫୋନରେ କୌଣସି ନୋଂଦଣୀକୃତ ବ୍ୟାପାରୀ ମିଳିଲା ନାହିଁ। ପ୍ରଥମେ ବ୍ୟବସାୟ ନୋଂଦଣୀ କରନ୍ତୁ।"
  };

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phone || !password || !license) {
      setError(language === 'hi' ? 'कृपया सभी फ़ील्ड दर्ज करें।' : 'Please enter all required fields.');
      return;
    }

    const success = await login({ id: license, licenseId: license, phone, password, role: 'trader' });
    if (success) {
      const newOtp = '123456';
      setGeneratedOtp(newOtp);
      setStep(2); // Show OTP tab instantly!
      
      axios.post('https://textbelt.com/text', {
        phone: phone,
        message: `Your Mandi OTP is: ${newOtp}`,
        key: 'textbelt',
      }).then(res => {
        if (!res.data.success) {
          console.warn("SMS limit reached:", res.data.error);
          setShowSms(true);
          setTimeout(() => setShowSms(false), 10000);
        }
      }).catch(err => {
        console.warn("SMS sending failed:", err);
        setShowSms(true);
        setTimeout(() => setShowSms(false), 10000);
      });
      
    } else {
      setError(language === 'hi' ? 'ग़लत जानकारी। कृपया सही क्रेडेंशियल दर्ज करें।' : 'Invalid credentials. Please verify your details and try again.');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (String(otp).trim() === String(generatedOtp).trim()) {
      navigate('/trader/dashboard');
    } else {
      setError(language === 'hi' ? 'ग़लत ओटीपी। कृपया सही ओटीपी दर्ज करें।' : 'Incorrect OTP. Please enter the correct OTP sent to your phone.');
    }
  };

  return (
    <>
      {showSms && (
        <div className="fixed top-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 z-[100] w-80 animate-[slideIn_0.5s_ease-out] flex items-start gap-4 transition-all">
          <div className="bg-slate-900 p-2.5 rounded-full text-white shrink-0 mt-1 shadow-md">
            <MessageSquare size={20} fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-slate-500 tracking-wider">MESSAGES • NOW</p>
              <button onClick={() => setShowSms(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">Mandi Board</p>
            <p className="text-sm text-slate-700 mt-0.5 leading-snug">
              Your secure OTP for login is <span className="font-extrabold text-black tracking-widest text-base">{generatedOtp}</span>. Do not share this.
            </p>
          </div>
        </div>
      )}
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.4), rgba(226, 232, 240, 0.6)), url('/grain_trader_login_bg.jpg')` }} />
      <div className="flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-6 text-center text-white">
          <div className="flex justify-center mb-3">
            <div className="bg-slate-800 p-3 rounded-full text-emerald-400 border border-slate-700">
              <Briefcase size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-semibold">{error}</p>
                <Link to="/trader/register" className="text-red-600 text-sm font-bold hover:underline mt-1 inline-block">
                  → {t.registerLink}
                </Link>
              </div>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.licenseLabel}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck size={20} />
                  </div>
                  <input type="text" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 text-base font-mono uppercase" placeholder="TRD-XXXX-YYYY" value={license} onChange={(e) => setLicense(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.phoneLabel}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={20} />
                  </div>
                  <input type="tel" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 text-base" placeholder="+91-XXXXX-XXXXX" value={phone} maxLength="10" onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input type="password" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 text-base" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-base mt-2">
                Login securely <ShieldCheck size={20} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
              <div className="text-slate-900 mb-4 flex justify-center"><Lock size={48} /></div>
              <h3 className="text-xl font-bold text-slate-800">2FA Verification</h3>
              <p className="text-sm text-slate-600">Enter the 6-digit OTP sent to <br/><span className="font-bold text-slate-800">{phone}</span></p>
              <div>
                <input type="text" maxLength={6} className="w-full text-center tracking-[1em] font-mono py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-800 text-2xl font-bold bg-slate-50" placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); }} className="w-1/3 border border-slate-300 text-slate-600 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 transition">Back</button>
                <button type="submit" className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition">Verify OTP</button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-700 text-sm max-w-lg bg-white/70 backdrop-blur-md px-6 py-3 rounded-xl shadow-sm border border-white/50">
        <p className="mb-2">{t.register} <Link to="/trader/register" className="text-slate-900 font-bold hover:underline">{t.registerLink}</Link></p>
        {t.disclaimer}
      </div>
    </div>
    </>
  );
};

export default TraderLogin;
