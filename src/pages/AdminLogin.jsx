import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, ArrowRight, Building, Gavel, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { adminLoginTranslations } from '../utils/translations';
import axios from 'axios';

const AdminLogin = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('district_admin');
  const [id, setId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language } = useSettings();
  
  const t = adminLoginTranslations[language] || adminLoginTranslations.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!id || !password) {
      setError('Please enter both ID and password');
      return;
    }
    
    const success = await login({ role, id, password });
    
    if (success) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setStep(2);
      
      axios.post('https://textbelt.com/text', {
        phone: phone || '9999999999',
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
      setError('Login failed. Please verify your credentials.');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (String(otp).trim() === String(generatedOtp).trim()) {
      if (role === 'district_admin') {
        navigate('/admin/district-dashboard');
      } else {
        navigate('/admin/auction-dashboard');
      }
    } else {
      setError('Incorrect OTP. Please enter the correct OTP sent to your registered device.');
    }
  };

  return (
    <>
      {showSms && (
        <div className="fixed top-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 z-[100] w-80 animate-[slideIn_0.5s_ease-out] flex items-start gap-4 transition-all">
          <div className="bg-blue-600 p-2.5 rounded-full text-white shrink-0 mt-1 shadow-md">
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
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url(${role === 'district_admin' ? '/district_admin_bg.jpg' : '/auction_admin_bg.jpg'})` }} />
      <div className="flex flex-col items-center justify-center py-6 min-h-[80vh]">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-wide flex items-center justify-center gap-3">
            <Shield size={36} className="text-emerald-400" />
            {t.title}
          </h2>
          <p className="text-slate-300 font-medium tracking-widest uppercase text-sm">
            {t.subtitle}
          </p>
        </div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative">
          
          <div className="bg-slate-900/50 p-6 border-b border-white/10 text-center">
            <p className="text-slate-200 font-semibold mb-4 text-sm">{t.roleLabel}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setRole('district_admin')}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition ${role === 'district_admin' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <Building size={24} />
                <span className="text-xs font-bold uppercase">{t.districtHead}</span>
              </button>
              <button 
                onClick={() => setRole('auction_admin')}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition ${role === 'auction_admin' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <Gavel size={24} />
                <span className="text-xs font-bold uppercase">{t.auctionAuth}</span>
              </button>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center font-medium backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">{t.idLabel}</label>
                <input 
                  type="text" 
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 font-mono" 
                  placeholder="EMP-XXXXX" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">Registered Phone</label>
                <input 
                  type="tel" 
                  value={phone}
                  maxLength="10"
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500" 
                  placeholder="10-digit number" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">{t.passwordLabel}</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500" 
                    placeholder="••••••••" 
                  />
                  <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group mt-4">
                Access Terminal <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="text-center mt-4">
                <span className="text-slate-400">First time? </span>
                <Link to="/admin/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
                  Register as Admin
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="p-8 space-y-5 text-center">
              <div className="text-emerald-400 mb-4 flex justify-center"><Shield size={48} /></div>
              <h3 className="text-xl font-bold text-slate-200">2FA Verification</h3>
              <p className="text-sm text-slate-400">Enter the 6-digit OTP sent to <br/><span className="font-bold text-slate-200">{id}</span></p>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center font-medium backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div>
                <input type="text" maxLength={6} className="w-full text-center tracking-[1em] font-mono py-4 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-white text-2xl font-bold bg-slate-900/50" placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); }} className="w-1/3 border border-slate-600 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition">Back</button>
                <button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition">Verify OTP</button>
              </div>
            </form>
          )}

          <div className="bg-black/30 p-4 text-center">
            <p className="text-slate-400 text-xs font-mono">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
