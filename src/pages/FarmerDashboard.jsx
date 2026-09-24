import { User, CheckCircle2, TrendingUp, Download, IndianRupee, MessageSquare, ArrowRight, ShieldCheck, Scale, AlertCircle, MapPin, Microscope, Truck, Warehouse, Camera, HeartPulse, LandPlot, HandCoins, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSystem } from '../context/SystemContext';
import { farmerDashboardTranslations } from '../utils/translations';
import { downloadReceipt } from '../utils/receiptGenerator';
import WeatherWidget from '../components/WeatherWidget';
import { useState, useEffect } from 'react';
import { getCurrentLocation, reverseGeocode } from '../utils/geolocation';
import { mandiData } from '../utils/mandiData';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const { tokens, addToken, msps, transactions } = useSystem();
  const { language } = useSettings();
  const t = farmerDashboardTranslations[language] || farmerDashboardTranslations.en;
  const navigate = useNavigate();

  // Mock static data for fallback since real API is not fully wired for these
  const [activeTab, setActiveTab] = useState('overview');

  // We are going to calculate some mock stats for the farmer dashboard
  const userTokens = tokens.filter(t => t.farmerName === user?.name);
  const pendingTokens = userTokens.filter(t => t.status === 'pending');
  const approvedTokens = userTokens.filter(t => t.status === 'approved');
  
  // Real or mock recent transactions
  let recentTx = [];
  if (user && user.role === 'farmer') {
    recentTx = [
      {
        id: 'TXN-8924',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        crop: 'Wheat',
        quantity: '45.50 Qtl',
        traderName: 'AgriCorp Traders',
        price: 2275,
        total: 103512.50,
        farmerName: user?.name || 'Farmer',
      },
      {
        id: 'TXN-7120',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        crop: 'Paddy',
        quantity: '60.00 Qtl',
        traderName: 'National Grains Ltd',
        price: 2183,
        total: 130980,
        farmerName: user?.name || 'Farmer',
      }
    ];
  }

  const myTxns = (transactions && transactions.length > 0)
    ? transactions.filter(t => !user?.name || t.farmerName === user?.name)
    : recentTx;

  // Mandi Entry State
  const [mandiList, setMandiList] = useState(mandiData);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [slotStatus, setSlotStatus] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Advanced e-NAM Features
  const [activeTradeMode, setActiveTradeMode] = useState('mandi'); // mandi, farmgate, enwr

  useEffect(() => {
    // mandiList is statically loaded now from utils
  }, []);

  const availableStates = [...new Set(mandiList.map(m => m.State))];
  const availableDistricts = [...new Set(mandiList.filter(m => m.State === selectedState).map(m => m.District))];
  const availableMandis = mandiList.filter(m => m.District === selectedDistrict).map(m => m.MandiName);

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const coords = await getCurrentLocation();
      const locationData = await reverseGeocode(coords.lat, coords.lon);
      
      // Match the detected state/district with our mock dataset
      const matchedState = availableStates.find(s => s.toLowerCase() === locationData.state.toLowerCase()) || 'Uttar Pradesh';
      setSelectedState(matchedState);
      
      // We need to wait a tick for state to update district options, or just set it directly
      const stateDistricts = mandiList.filter(m => m.State === matchedState).map(m => m.District);
      const matchedDistrict = stateDistricts.find(d => d.toLowerCase() === locationData.district.toLowerCase()) || (stateDistricts[0] || '');
      setSelectedDistrict(matchedDistrict);
      
      if (!locationData.success) {
        setLocationError('Using simulated default location (API limit).');
      }
    } catch (err) {
      console.error(err);
      setLocationError('Location access denied or failed.');
    } finally {
      setIsLocating(false);
    }
  };

  const checkAvailability = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedMandi) return;
    setCheckingAvailability(true);
    setSlotStatus(null);
    setTimeout(() => {
      // Simulate check
      setSlotStatus('available');
      setCheckingAvailability(false);
    }, 1000);
  };

  const confirmBooking = () => {
    addToken({
      farmerName: user?.name || 'Ramesh Kumar',
      state: selectedState,
      district: selectedDistrict,
      mandi: selectedMandi,
      date: selectedDate
    });
    alert('Token application submitted to State/Auction Authority for approval.');
    setSlotStatus(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.3), rgba(226, 232, 240, 0.5)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop')` }} />
      <div className="space-y-6">
      
      {/* Profile & Quota Summary */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-700 border border-emerald-200">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user?.name || 'Ramesh Kumar'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                <ShieldCheck size={12} /> ID: {user?.khasra || 'UP-4592-88'}
              </span>
              <span className="text-slate-500 text-sm">| {t.village}: {user?.village || 'Sonipat'}, {user?.district || 'Haryana'}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/3 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-slate-700">{t.quotaTitle}</span>
            <span className="text-emerald-700 font-bold">120 / 300 Qtl</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-right">{t.remaining}: 180 Quintals</p>
        </div>
      </section>

      {/* Advanced Trade Modes (e-NAM Features) */}
      <section className="bg-emerald-900 rounded-xl shadow-lg border border-emerald-800 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-emerald-800/50 pb-4">
            <button 
              onClick={() => setActiveTradeMode('mandi')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${activeTradeMode === 'mandi' ? 'bg-emerald-500 text-emerald-950' : 'bg-emerald-800/50 text-emerald-200 hover:bg-emerald-700/50'}`}
            >
              <Truck size={18} /> Mandi Entry
            </button>
            <button 
              onClick={() => setActiveTradeMode('farmgate')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${activeTradeMode === 'farmgate' ? 'bg-emerald-500 text-emerald-950' : 'bg-emerald-800/50 text-emerald-200 hover:bg-emerald-700/50'}`}
            >
              <Camera size={18} /> Farmgate Trade
            </button>
            <button 
              onClick={() => setActiveTradeMode('enwr')}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${activeTradeMode === 'enwr' ? 'bg-emerald-500 text-emerald-950' : 'bg-emerald-800/50 text-emerald-200 hover:bg-emerald-700/50'}`}
            >
              <Warehouse size={18} /> e-NWR Vault
            </button>
          </div>

          {activeTradeMode === 'mandi' && (
            <div className="flex flex-col md:flex-row gap-8 items-center animate-in fade-in">
              <div className="flex-1 space-y-4 md:text-left">
                <h3 className="text-2xl font-bold text-emerald-50">Book Mandi Entry Slot</h3>
                <p className="text-emerald-200 text-sm max-w-md">
                  Select your desired date and Mandi location to check slot availability. Once confirmed, a secure Gate Pass (QR Code) will be generated.
                </p>
                <form onSubmit={checkAvailability} className="bg-emerald-800/40 p-4 rounded-xl border border-emerald-700/50 space-y-3 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-emerald-200 mb-1">Select State</label>
                      <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-3 py-2 bg-emerald-900/50 border border-emerald-700/50 rounded-lg text-emerald-50 text-sm outline-none focus:border-emerald-400">
                        {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-emerald-200 mb-1">Select District</label>
                      <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full px-3 py-2 bg-emerald-900/50 border border-emerald-700/50 rounded-lg text-emerald-50 text-sm outline-none focus:border-emerald-400">
                        {mandiList.filter(m => m.State === selectedState).map(m => m.District).filter((v,i,a) => a.indexOf(v)===i).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-emerald-200 mb-1">Select Mandi</label>
                      <select value={selectedMandi} onChange={(e) => setSelectedMandi(e.target.value)} className="w-full px-3 py-2 bg-emerald-900/50 border border-emerald-700/50 rounded-lg text-emerald-50 text-sm outline-none focus:border-emerald-400" required>
                        <option value="">-- Choose Mandi --</option>
                        {mandiList.filter(m => m.District === selectedDistrict).map(m => (
                          <option key={m.MandiName} value={m.MandiName}>{m.MandiName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-emerald-200 mb-1">Expected Date of Arrival</label>
                      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required className="w-full px-3 py-2 bg-emerald-900/50 border border-emerald-700/50 rounded-lg text-emerald-50 text-sm outline-none focus:border-emerald-400 [color-scheme:dark]" />
                    </div>
                  </div>
                  
                  {slotStatus === 'available' ? (
                    <div className="pt-2">
                      <div className="bg-emerald-900/80 border border-emerald-500/50 p-3 rounded-lg flex items-start gap-2 mb-3">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-emerald-50 font-bold">Slots Available!</p>
                          <p className="text-emerald-200 text-xs">Estimated wait time: &lt; 30 mins</p>
                        </div>
                      </div>
                      <button type="button" onClick={confirmBooking} className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2 rounded-lg transition-colors">
                        Generate Gate Pass
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button type="submit" disabled={checkingAvailability} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        {checkingAvailability ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                        {checkingAvailability ? 'Checking...' : 'Check Availability'}
                      </button>
                    </div>
                  )}
                </form>
                {/* Farmer Tokens Section */}
                <div className="mt-8 bg-emerald-800/40 p-4 rounded-xl border border-emerald-700/50">
                  <h4 className="text-lg font-bold text-emerald-100 mb-4 border-b border-emerald-700/50 pb-2">My Tokens</h4>
                  {tokens.filter(t => t.farmerName === (user?.name || 'Ramesh Kumar')).length === 0 ? (
                    <p className="text-sm text-emerald-200/60 italic">No tokens applied yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {tokens.filter(t => t.farmerName === (user?.name || 'Ramesh Kumar')).map(tkn => (
                        <div key={tkn.id} className="bg-emerald-900/50 p-3 rounded-lg border border-emerald-700/30 flex justify-between items-center">
                          <div>
                            <p className="text-emerald-100 font-bold text-sm">Mandi: {tkn.mandi}, {tkn.district}</p>
                            <p className="text-emerald-200 text-xs">Date: {tkn.date} | ID: {tkn.id}</p>
                          </div>
                          <div>
                            {tkn.status === 'pending' ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Pending Auth</span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={12} /> Approved Gate Pass</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              

            </div>
          )}

          {activeTradeMode === 'farmgate' && (
            <div className="animate-in fade-in">
              <h3 className="text-2xl font-bold text-emerald-50 mb-2">Farmgate FPO Trading</h3>
              <p className="text-emerald-200 text-sm max-w-2xl mb-6">Bypass the Mandi entirely. Upload high-resolution images of your crop directly from your farm or FPO collection center. Our AI Assaying engine will generate a verified report for traders to bid on instantly.</p>
              
              <div className="border-2 border-dashed border-emerald-500/50 rounded-xl p-8 text-center bg-emerald-800/30">
                <Camera size={48} className="mx-auto text-emerald-400 mb-4" />
                <h4 className="font-bold text-lg text-white mb-2">Upload Crop Imagery</h4>
                <p className="text-sm text-emerald-200 mb-6">Supported formats: JPG, PNG, MP4 (360° video)</p>
                <button onClick={() => alert("Simulated: Opening camera... AI Assaying in progress.")} className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2">
                  <Camera size={18} /> Open Camera / Gallery
                </button>
              </div>
            </div>
          )}

          {activeTradeMode === 'enwr' && (
            <div className="animate-in fade-in">
              <h3 className="text-2xl font-bold text-emerald-50 mb-2">e-NWR Vault (Warehouse Receipts)</h3>
              <p className="text-emerald-200 text-sm max-w-2xl mb-6">Don't distress sell. Store your produce in WDRA-accredited warehouses and receive Electronic Negotiable Warehouse Receipts (e-NWR). Trade them online or pledge them for bank loans.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active Receipt</span>
                    <span className="text-xs text-emerald-300 font-mono">NWR-9982-A</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">Wheat (Grade A)</h4>
                  <p className="text-emerald-200 text-sm mb-4">Stored at: CWC Warehouse, Sonipat</p>
                  <div className="flex justify-between items-center bg-emerald-900/50 p-2 rounded">
                    <span className="text-sm text-emerald-100">120.00 Qtl</span>
                    <button onClick={() => alert("Simulated: Pledging receipt to bank for micro-loan.")} className="text-xs bg-emerald-500 text-emerald-950 font-bold px-3 py-1.5 rounded hover:bg-emerald-400 transition">Pledge for Loan</button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-emerald-800/30 min-h-[150px]">
                  <Warehouse size={32} className="text-emerald-400 mb-2" />
                  <h4 className="font-bold text-white mb-2">Deposit to Warehouse</h4>
                  <button onClick={() => alert("Simulated: Opening nearby WDRA warehouse list.")} className="text-xs bg-slate-800 text-white font-bold px-4 py-2 rounded hover:bg-slate-700 transition">Find Nearby Warehouse</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Transaction Card */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" /> {t.activeConsignment}
              </h3>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t.inProgress}</span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">{t.crop}</p>
                  <p className="font-bold text-slate-800 text-lg">{t.wheat}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">{t.quantity}</p>
                  <p className="font-bold text-slate-800 text-lg">45.50 Qtl</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">{t.baseRate}</p>
                  <p className="font-bold text-emerald-700 text-lg">₹2,275 / Qtl</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">{t.estTotal}</p>
                  <p className="font-bold text-slate-800 text-lg">₹1,03,512</p>
                </div>
              </div>
            </div>

            {/* Quality Assaying Report (e-NAM feature) */}
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h4 className="text-blue-900 font-bold flex items-center gap-2 mb-1">
                  <Microscope size={18} className="text-blue-600" /> Quality Assaying Report
                </h4>
                <p className="text-xs text-blue-700 max-w-md">Live test results verified by Mandi Lab. This ensures transparent, quality-based bidding by traders nationwide.</p>
              </div>
              <div className="flex gap-4 bg-white p-2 rounded-md shadow-sm border border-blue-100/50">
                <div className="text-center px-2 border-r border-slate-100">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Moisture</p>
                  <p className="font-bold text-slate-800">11.8%</p>
                </div>
                <div className="text-center px-2 border-r border-slate-100">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Foreign Matter</p>
                  <p className="font-bold text-slate-800">0.5%</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Grade</p>
                  <p className="font-bold text-emerald-600">A+</p>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 md:-translate-x-1/2 md:hidden"></div>
              
              <div className="flex flex-col md:flex-row justify-between relative">
                
                {/* Step 1 */}
                <div className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 mb-6 md:mb-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="md:text-center">
                    <p className="font-bold text-slate-800 text-sm">{t.registered}</p>
                    <p className="text-xs text-slate-500">Oct 12, 09:30 AM</p>
                  </div>
                </div>

                <div className="hidden md:block absolute top-4 left-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" style={{width: 'calc(100% - 2rem)', left: '1rem'}}>
                  <div className="h-full bg-emerald-500 w-1/2 transition-all duration-1000"></div>
                </div>

                {/* Step 2 */}
                <div className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 mb-6 md:mb-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 ring-4 ring-emerald-50">
                    <Scale size={16} />
                  </div>
                  <div className="md:text-center">
                    <p className="font-bold text-slate-800 text-sm">{t.weighbridge}</p>
                    <p className="text-xs text-slate-500">Oct 12, 11:45 AM</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center border-2 border-white">
                    <IndianRupee size={16} />
                  </div>
                  <div className="md:text-center">
                    <p className="font-bold text-slate-500 text-sm">{t.paymentPending}</p>
                    <p className="text-xs text-slate-400">{t.awaitingSettlement}</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-800">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-blue-600 shrink-0" />
                <p><strong>{t.smsAlert1} +91-XXXXX-9823</strong> {t.smsAlert2} 45.50 Qtl.</p>
              </div>
              <button onClick={() => alert("Logistics module opening... Requesting trucks to your Khasra location.")} className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors flex items-center justify-center gap-2 text-xs">
                <Truck size={14} /> Request Logistics
              </button>
            </div>
          </section>

          {/* Transaction History */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{t.ledger}</h3>
              <button className="text-emerald-600 text-sm font-semibold hover:underline flex items-center gap-1">
                {t.viewAll} <ArrowRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">{t.date}</th>
                    <th className="p-4 font-semibold">{t.crop}</th>
                    <th className="p-4 font-semibold">{t.quantity}</th>
                    <th className="p-4 font-semibold">{t.buyer}</th>
                    <th className="p-4 font-semibold">{t.amount}</th>
                    <th className="p-4 font-semibold">{t.receipt}</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {myTxns.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-800">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="p-4 font-medium text-slate-800">{tx.crop}</td>
                      <td className="p-4 text-slate-600">{tx.quantity}</td>
                      <td className="p-4 text-slate-600">{tx.traderName}</td>
                      <td className="p-4 font-bold text-slate-800">₹{Number(tx.total).toLocaleString()}</td>
                      <td className="p-4">
                        <button onClick={() => downloadReceipt({ txnId: tx.id || `TXN-${idx}`, date: new Date(tx.date).toLocaleDateString(), farmerName: tx.farmerName, farmerId: user?.khasra, buyer: tx.traderName, commodity: tx.crop, qty: tx.quantity, rate: tx.price, amount: tx.total, status: 'settled', language })} className="text-emerald-600 hover:text-emerald-800 transition" title="Download Receipt">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {myTxns.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WeatherWidget />

          <div className="bg-emerald-900 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <TrendingUp size={64} />
            </div>
            <h3 className="text-emerald-100 font-semibold mb-1 relative z-10">{t.tickerTitle}</h3>
            <p className="text-xs text-emerald-200 mb-6 relative z-10">{t.tickerSub}</p>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                <span className="font-medium">{t.wheat}</span>
                <span className="font-bold text-xl">₹2,275 <span className="text-emerald-400 text-xs">▲ +₹150</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                <span className="font-medium">{t.paddy}</span>
                <span className="font-bold text-xl">₹2,183</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-medium">{t.mustard}</span>
                <span className="font-bold text-xl">₹5,650</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" /> {t.advisories}
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <p>{t.adv1}</p>
              </li>
              <li className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <p>{t.adv2}</p>
              </li>
            </ul>
          </div>

          {/* Platform of Platforms (PoP) Hub */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <LandPlot size={80} />
            </div>
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 relative z-10">
              Platform of Platforms (PoP)
            </h3>
            <p className="text-xs text-indigo-700 mb-4 relative z-10">Access partner services directly from the ecosystem.</p>
            
            <div className="space-y-3 relative z-10">
              <button onClick={() => alert('Simulated: Opening PMFBY Crop Insurance portal')} className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-sm transition group">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <HeartPulse size={16} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-slate-800">Crop Insurance</p>
                    <p className="text-[10px] text-slate-500">Apply or check claim status</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button onClick={() => alert('Simulated: Opening KCC Micro-loans partner portal')} className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-sm transition group">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <HandCoins size={16} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-slate-800">Micro-Loans</p>
                    <p className="text-[10px] text-slate-500">Instant KCC top-up</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button onClick={() => alert('Simulated: Opening Soil Health Card portal')} className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-sm transition group">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-md text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <LandPlot size={16} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-slate-800">Soil Testing</p>
                    <p className="text-[10px] text-slate-500">Book lab test via PoP</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default FarmerDashboard;
