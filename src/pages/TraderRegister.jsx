import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, ShieldCheck, CreditCard, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { traderRegisterTranslations } from '../utils/translations';
import axios from 'axios';

const TraderRegister = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [otpState, setOtpState] = useState({ sent: false, verified: false });
  const [formData, setFormData] = useState({
    businessName: '', licenseId: '', phone: '', gstin: '', bankGateway: 'upi', password: '', confirmPassword: '', aadhaar: '', otp: ''
  });
  const { register } = useAuth();
  const { language } = useSettings();
  const t = traderRegisterTranslations[language] || traderRegisterTranslations.en;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{12}$/.test(formData.aadhaar)) {
      return setError('Aadhaar number must be exactly 12 digits.');
    }
    if (!otpState.verified) {
      return setError('Please verify your Aadhaar with OTP first.');
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      return setError('Phone number must be exactly 10 digits.');
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) {
      return setError('Invalid GSTIN format.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    const result = await register({ ...formData, role: 'trader', name: formData.businessName, id: formData.licenseId });
    if (result.success) {
      navigate('/trader/login');
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'businessName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phone' || name === 'aadhaar' || name === 'otp') {
      value = value.replace(/\D/g, '');
    }
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.4), rgba(226, 232, 240, 0.6)), url('/grain_trader_login_bg.jpg')` }} />
      <div className="flex flex-col items-center justify-center py-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
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
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 md:col-span-2">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Building size={18} /> {t.businessDetails}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.nameLabel}</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.licenseLabel}</label>
                    <input type="text" name="licenseId" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none uppercase font-mono" placeholder="TRD-XXXX-YYYY" />
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
                      <input type="text" name="aadhaar" value={formData.aadhaar} maxLength="12" onChange={handleChange} disabled={otpState.verified} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" placeholder="12-digit Aadhaar" />
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
                        }} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg whitespace-nowrap">
                          {otpState.sent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                  </div>
                  {otpState.sent && !otpState.verified && (
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Enter OTP</label>
                      <div className="flex gap-2">
                        <input type="text" name="otp" value={formData.otp} maxLength="6" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" placeholder="Enter OTP" />
                        <button type="button" onClick={() => {
                          if (formData.otp === otpState.generatedOtp) {
                            setOtpState({ ...otpState, verified: true });
                            setError('');
                          } else {
                            setError('Invalid OTP.');
                          }
                        }} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg whitespace-nowrap">
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
                  <ShieldCheck size={18} /> {t.taxTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.gstinLabel}</label>
                    <input type="text" name="gstin" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none uppercase font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">{t.phoneLabel}</label>
                    <input type="tel" name="phone" value={formData.phone} maxLength="10" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2 mt-2">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <CreditCard size={18} /> {t.gatewayTitle}
                </h3>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">{t.gatewayLabel}</label>
                  <select name="bankGateway" onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                    <option value="upi">{t.upi}</option>
                    <option value="rtgs">{t.rtgs}</option>
                  </select>
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
                    <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Confirm Password</label>
                    <input type="password" name="confirmPassword" onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2 text-base">
                {t.submit} <ShieldCheck size={18} />
              </button>
            </div>
            
            <p className="text-center text-sm text-slate-700 mt-4 bg-white/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 inline-block">
              {t.loginPrompt} <Link to="/trader/login" className="text-slate-900 font-bold hover:underline">{t.loginLink}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default TraderRegister;
