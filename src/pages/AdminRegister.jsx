import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Building, Gavel } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import axios from 'axios';

const AdminRegister = () => {
  const [role, setRole] = useState('district_admin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [govId, setGovId] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!aadhaarVerified) {
      return setError('Please verify your Aadhaar number using OTP before registering.');
    }
    if (!govId.match(/^EMP-\d{4}$/i)) {
      return setError('Gov ID must be in format EMP-XXXX (e.g. EMP-1234)');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    // In a real app, Gov ID would be verified against a government database
    const success = await register({
      role,
      name,
      phone,
      id: govId,
      district,
      state,
      password,
    });
    
    if (success) {
      navigate('/admin/login');
    } else {
      setError('Registration failed.');
    }
  };

  const sendOtp = () => {
    if (aadhaar.length !== 12 || phone.length !== 10) {
      setError('Please enter a valid 12-digit Aadhaar number and 10-digit Phone number first');
      return;
    }
    setError('');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    
    axios.post('https://textbelt.com/text', {
      phone: phone,
      message: `Your Mandi Aadhaar verification OTP is: ${newOtp}`,
      key: 'textbelt',
    }).catch(e => console.warn(e));
    
    alert(`OTP sent to Aadhaar linked mobile number! (Mock: ${newOtp})`);
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setAadhaarVerified(true);
      setOtpSent(false);
      setError('');
    } else {
      setError('Invalid OTP');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url('/admin_login_bg.jpg')` }} />
      <div className="flex flex-col items-center justify-center py-6 min-h-[80vh]">
        
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-wide flex items-center justify-center gap-3">
            <Shield size={36} className="text-emerald-400" />
            Department Admin Registration
          </h2>
          <p className="text-slate-300 font-medium tracking-widest uppercase text-sm">
            Authorized Personnel Enrollment
          </p>
        </div>

        <div className="w-full max-w-xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative">
          
          <div className="bg-slate-900/50 p-6 border-b border-white/10 text-center">
            <p className="text-slate-200 font-semibold mb-4 text-sm">Select Your Department Role</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setRole('district_admin')}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition ${role === 'district_admin' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <Building size={24} />
                <span className="text-xs font-bold uppercase">District Agriculture Head</span>
              </button>
              <button 
                onClick={() => setRole('auction_admin')}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition ${role === 'auction_admin' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <Gavel size={24} />
                <span className="text-xs font-bold uppercase">Procurement/Auction Authority</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500" 
                  placeholder="Officer Name" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500" 
                  placeholder="10-digit number" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">Unique Gov ID</label>
                <input 
                  type="text" 
                  required
                  value={govId}
                  onChange={(e) => setGovId(e.target.value)}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 font-mono" 
                  placeholder="e.g. EMP-9981" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-200 mb-1">Aadhaar Number (12 Digits)</label>
                {!aadhaarVerified ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength="12"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 font-mono tracking-widest" 
                      placeholder="XXXX XXXX XXXX" 
                    />
                    <button 
                      type="button"
                      onClick={sendOtp}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 rounded-lg shadow-lg transition"
                    >
                      Get OTP
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-900/30 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold flex items-center justify-between">
                    <span className="font-mono tracking-widest">XXXX XXXX {aadhaar.slice(-4)}</span>
                    <span className="text-sm">✓ Verified</span>
                  </div>
                )}
              </div>

              {otpSent && !aadhaarVerified && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-200 mb-1">Enter OTP</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 font-mono tracking-widest" 
                      placeholder="XXXXXX" 
                    />
                    <button 
                      type="button"
                      onClick={verifyOtp}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-lg shadow-lg transition"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">Assigned State</label>
                <input 
                  type="text" 
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 mb-4" 
                  placeholder="e.g. Uttar Pradesh" 
                />
              </div>

              {role === 'district_admin' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">Assigned District</label>
                  <input 
                    type="text" 
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500" 
                    placeholder="e.g. Gorakhpur" 
                  />
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-200 mb-1">Create Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500" 
                  placeholder="••••••••" 
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-slate-200 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group mt-4">
              Register & Access Console <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="text-center mt-4">
              <span className="text-slate-400">Already registered? </span>
              <Link to="/admin/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
                Login here
              </Link>
            </div>
          </form>

          <div className="bg-black/30 p-4 text-center">
            <p className="text-slate-400 text-xs font-mono">
              Notice: Providing false Government ID credentials is a punishable offense.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminRegister;
