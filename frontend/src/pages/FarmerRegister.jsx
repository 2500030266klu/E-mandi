import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, User, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { farmerRegisterTranslations } from '../utils/translations';
import axios from 'axios';

const FarmerRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [otpState, setOtpState] = useState({ sent: false, verified: false });
  const [formData, setFormData] = useState({
    name: '', phone: '', khasra: '', district: '', village: '', ifsc: '', accountNumber: '', password: '', confirmPassword: '', aadhaar: '', otp: ''
  });
  const { register } = useAuth();
  const { language } = useSettings();
  const t = farmerRegisterTranslations[language] || farmerRegisterTranslations.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!/^\d{12}$/.test(formData.aadhaar)) {
      return setError('Aadhaar number must be exactly 12 digits.');
    }
    if (!otpState.verified) {
      return setError('Please verify your Aadhaar with OTP first.');
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      return setError('Phone number must be exactly 10 digits.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
      return setError('Invalid IFSC code format.');
    }
    if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
      return setError('Account number must be between 9 and 18 digits.');
    }

    const { name, phone, khasra, district, village, ifsc, accountNumber, password } = formData;
    const result = await register({
      role: 'farmer',
      name,
      phone,
      khasra,
      district,
      village,
      ifsc,
      accountNumber,
      password
    });
    
    if (result.success) {
      navigate('/farmer/login');
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Input masking
    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
    } else if (name === 'phone' || name === 'accountNumber' || name === 'aadhaar' || name === 'otp') {
      value = value.replace(/\D/g, ''); // Only numbers
    }
    
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.3), rgba(226, 232, 240, 0.5)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop')` }} />
      <div className="flex flex-col items-center justify-center py-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
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
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 md:col-span-2">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <User size={18} /> {t.personalDetails}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.nameLabel}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.phoneLabel}</label>
                    <input type="tel" name="phone" value={formData.phone} maxLength="10" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Aadhaar Verification Section */}
              <div className="space-y-3 md:col-span-2 mt-2">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <ShieldCheck size={18} /> Aadhaar Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Aadhaar Number</label>
                    <div className="flex gap-2">
                      <input type="text" name="aadhaar" value={formData.aadhaar} maxLength="12" onChange={handleChange} disabled={otpState.verified} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="12-digit Aadhaar" />
                      {!otpState.verified && (
                        <button type="button" onClick={() => {
                          if (formData.aadhaar.length === 12 && formData.phone.length === 10) {
                            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            setOtpState({ ...otpState, sent: true, generatedOtp: newOtp });
                            setError('');
                            
                            axios.post('https://textbelt.com/text', {
                              phone: formData.phone,
                              message: `Your Mandi Aadhaar verification OTP is: ${newOtp}`,
                              key: 'textbelt',
                            }).catch(e => console.warn(e));
                            
                            alert(`OTP sent to your registered mobile number! (Mock OTP: ${newOtp})`);
                          } else {
                            setError('Enter a valid 12-digit Aadhaar number and 10-digit Phone number first.');
                          }
                        }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg whitespace-nowrap">
                          {otpState.sent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                  </div>
                  {otpState.sent && !otpState.verified && (
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Enter OTP</label>
                      <div className="flex gap-2">
                        <input type="text" name="otp" value={formData.otp} maxLength="6" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter OTP" />
                        <button type="button" onClick={() => {
                          if (formData.otp === otpState.generatedOtp) {
                            setOtpState({ ...otpState, verified: true });
                            setError('');
                          } else {
                            setError('Invalid OTP.');
                          }
                        }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg whitespace-nowrap">
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                  {otpState.verified && (
                    <div className="flex items-center text-emerald-600 font-semibold mt-6">
                      <ShieldCheck size={20} className="mr-2" /> Aadhaar Verified Successfully
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 md:col-span-2 mt-2">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <MapPin size={18} /> {t.landDetails}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.khasraLabel}</label>
                    <input type="text" name="khasra" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono" placeholder="e.g. UP-1234" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.districtLabel}</label>
                    <input type="text" name="district" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.villageLabel}</label>
                    <input type="text" name="village" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2 mt-2">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <CreditCard size={18} /> {t.bankTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.accountLabel}</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} maxLength="18" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.ifscLabel}</label>
                    <input type="text" name="ifsc" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono" placeholder="e.g. SBIN0001234" />
                  </div>
                </div>
              </div>
              
              {/* Credentials Section added */}
              <div className="space-y-3 md:col-span-2 mt-2">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <ShieldCheck size={18} /> Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Password</label>
                    <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Confirm Password</label>
                    <input type="password" name="confirmPassword" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-base">
                {t.submit} <ShieldCheck size={18} />
              </button>
            </div>
            
            <p className="text-center text-sm text-slate-700 mt-4 bg-white/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 inline-block">
              {t.loginPrompt} <Link to="/farmer/login" className="text-emerald-600 font-bold hover:underline">{t.loginLink}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default FarmerRegister;
