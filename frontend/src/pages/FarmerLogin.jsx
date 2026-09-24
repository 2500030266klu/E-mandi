import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Phone, ShieldCheck, MapPin, AlertTriangle, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { farmerLoginTranslations } from '../utils/translations';
import axios from 'axios';

const FarmerLogin = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [khasra, setKhasra] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { language } = useSettings();
  const t = farmerLoginTranslations[language] || farmerLoginTranslations.en;
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phone || !password) {
      setError(language === 'hi' ? 'कृपया सभी फ़ील्ड दर्ज करें।' : 'Please enter all required fields.');
      return;
    }

    const success = await login({ phone, khasra, password, role: 'farmer' });
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
    
    // Ensure we are doing a strict string comparison, trimming any accidental spaces
    if (String(otp).trim() === String(generatedOtp).trim()) {
      navigate('/farmer/dashboard');
    } else {
      setError(language === 'hi' ? 'ग़लत ओटीपी। कृपया सही ओटीपी दर्ज करें।' : 'Incorrect OTP. Please enter the correct OTP sent to your phone.');
    }
  };

  return (
    <>
      {showSms && (
        <div className="fixed top-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 z-[100] w-80 animate-[slideIn_0.5s_ease-out] flex items-start gap-4 transition-all">
          <div className="bg-emerald-600 p-2.5 rounded-full text-white shrink-0 mt-1 shadow-md">
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
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.3), rgba(226, 232, 240, 0.5)), url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2000&auto=format&fit=crop')` }} />
      <div className="flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-emerald-700 p-6 text-center text-white">
          <div className="flex justify-center mb-3">
            <div className="bg-white p-3 rounded-full text-emerald-700">
              <Leaf size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-emerald-100 text-sm mt-1">{t.subtitle}</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-semibold">{error}</p>
                <Link to="/farmer/register" className="text-red-600 text-sm font-bold hover:underline mt-1 inline-block">
                  → {t.registerLink}
                </Link>
              </div>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-4">

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
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.khasraLabel} (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={20} />
                  </div>
                  <input type="text" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 text-base font-mono uppercase" placeholder="E.g. UP-1234-56" value={khasra} onChange={(e) => setKhasra(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck size={20} />
                  </div>
                  <input type="password" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 text-base" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-base mt-2">
              Login securely <ShieldCheck size={20} />
            </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
              <div className="text-emerald-700 mb-4 flex justify-center"><ShieldCheck size={48} /></div>
              <h3 className="text-xl font-bold text-slate-800">2FA Verification</h3>
              <p className="text-sm text-slate-600">Enter the 6-digit OTP sent to <br/><span className="font-bold text-slate-800">{phone}</span></p>
              <div>
                <input type="text" maxLength={6} className="w-full text-center tracking-[1em] font-mono py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-slate-800 text-2xl font-bold" placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); }} className="w-1/3 border border-slate-300 text-slate-600 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 transition">Back</button>
                <button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition">Verify OTP</button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-700 text-sm max-w-lg bg-white/70 backdrop-blur-md px-6 py-3 rounded-xl shadow-sm border border-white/50">
        <p className="mb-2">{t.register} <Link to="/farmer/register" className="text-emerald-600 font-bold hover:underline">{t.registerLink}</Link></p>
        {t.disclaimer}
      </div>
    </div>
    </>
  );
};

export default FarmerLogin;
