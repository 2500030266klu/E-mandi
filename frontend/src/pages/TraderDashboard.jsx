import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Scale, FileText, CheckCircle, CreditCard, Download, Filter, IndianRupee, ArrowRight, ShieldCheck, User, Image as ImageIcon, Map as MapIcon, Globe, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSystem } from '../context/SystemContext';
import { traderDashboardTranslations } from '../utils/translations';
import { downloadReceipt } from '../utils/receiptGenerator';
import { API_BASE_URL } from '../utils/apiConfig';

const TraderDashboard = () => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyStep, setBuyStep] = useState(1);
  
  // Transaction State
  const [buyQty, setBuyQty] = useState(45.5);
  const [buyCrop, setBuyCrop] = useState('Wheat');
  const [completedTxn, setCompletedTxn] = useState(null);
  
  // Interstate Trade State
  const [isInterstateMode, setIsInterstateMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedFarmer, setSearchedFarmer] = useState(null);
  const [searchError, setSearchError] = useState('');

  const { user } = useAuth();
  const { language } = useSettings();
  const { msps, quotas, transactions, addTransaction } = useSystem();
  const t = traderDashboardTranslations[language] || traderDashboardTranslations.en;

  // Get effective MSP (State overrides Central)
  const getMsp = (cropName) => {
    const sMsp = msps.find(m => m.level === 'State' && m.crop === cropName)?.price;
    const cMsp = msps.find(m => m.level === 'Central' && m.crop === cropName)?.price;
    return Number(sMsp || cMsp || 2200);
  };

  const cropPrice = getMsp(buyCrop);
  const totalCost = buyQty * cropPrice;

  const handleConfirmPay = async () => {
    if (!searchedFarmer) return;
    
    const tx = {
      farmerName: searchedFarmer.name,
      traderName: user?.name || 'AgriTrade Co.',
      crop: buyCrop,
      quantity: buyQty,
      price: cropPrice,
      total: totalCost,
      district: user?.district || 'Gorakhpur'
    };
    
    // addTransaction will send it to the backend and push it to transactions.csv
    await addTransaction(tx);
    // Note: since addTransaction fetches after, the new txn will be in `transactions` array, 
    // but we can just use a local state for the receipt download
    setCompletedTxn({ ...tx, id: `TXN-${Math.floor(Math.random()*10000)}` });
    setBuyStep(3);
  };

  const handleSearchFarmer = async () => {
    setSearchError('');
    setSearchedFarmer(null);
    if (!searchQuery.trim()) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/authservice/getallusers/1/1000`, {
        headers: { Token: user?.jwt || "dummy" }
      });
      const allUsers = response.data.users || response.data.content || [];
      const farmer = allUsers.find(u => 
        (u.role === 'farmer' || u.role === 1) && 
        (u.khasra === searchQuery.toUpperCase() || u.phone === searchQuery)
      );

      if (farmer) {
        setSearchedFarmer(farmer);
      } else {
        setSearchError('Farmer not found. Please check the Khasra ID or Phone Number.');
      }
    } catch (err) {
      setSearchError('Failed to fetch data from server.');
    }
  };

  const resetModal = () => {
    setShowBuyModal(false);
    setBuyStep(1);
    setSearchQuery('');
    setSearchedFarmer(null);
    setSearchError('');
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.4), rgba(226, 232, 240, 0.6)), url('/grain_trader_dashboard_bg.jpg')` }} />
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.consoleTitle} — {user?.name || 'AgriTrade Co.'}</h2>
          <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
            <ShieldCheck size={16} className="text-emerald-600"/> {t.license}: {user?.id || 'TRD-7829-X'}
          </p>
        </div>
        <button 
          onClick={() => { resetModal(); setShowBuyModal(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition flex items-center gap-2"
        >
          <Scale size={20} /> {t.newProcurement}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold mb-1">{t.todayPurchases}</p>
          <h4 className="text-2xl font-bold text-slate-800">1,250 Qtl</h4>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold mb-1">{t.totalDbt}</p>
          <h4 className="text-2xl font-bold text-slate-800">₹28.4 Lakhs</h4>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold mb-1">{t.pendingSettlements}</p>
          <h4 className="text-2xl font-bold text-amber-600">2 {t.actionsReqd}</h4>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold mb-1">{t.inventoryCapacity}</p>
          <h4 className="text-2xl font-bold text-slate-800">68% <span className="text-sm font-normal text-slate-500">{t.filled}</span></h4>
        </div>
      </div>

      {/* Live e-NAM Auctions Board with AI Assaying & Interstate */}
      <section className="bg-emerald-900 rounded-xl shadow-lg border border-emerald-800 p-6 text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-emerald-800/50 pb-4">
          <h3 className="text-xl font-bold text-emerald-50 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> Live e-Bidding Board
          </h3>
          
          <div className="flex items-center gap-3 bg-emerald-950/50 p-1.5 rounded-lg border border-emerald-800">
            <button 
              onClick={() => setIsInterstateMode(false)}
              className={`px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-2 transition-colors ${!isInterstateMode ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:text-white'}`}
            >
              <MapIcon size={14} /> Local (District)
            </button>
            <button 
              onClick={() => setIsInterstateMode(true)}
              className={`px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-2 transition-colors ${isInterstateMode ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'text-emerald-300 hover:text-white'}`}
            >
              <Globe size={14} /> Interstate Trade
            </button>
          </div>
        </div>
        
        {isInterstateMode && (
          <div className="bg-indigo-900/40 border border-indigo-500/50 p-3 rounded-lg mb-6 flex items-center gap-3 animate-in slide-in-from-top-2">
            <Globe className="text-indigo-400 shrink-0" size={20} />
            <p className="text-sm text-indigo-100">
              <strong className="text-white">Interstate Mode Active.</strong> You are now viewing high-quality lots from across India. Bidding is backed by e-NAM's verified AI Assaying and integrated logistics network.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lot 1 */}
          <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700/50 flex flex-col justify-between group hover:border-emerald-500 transition-colors">
            <div>
              <div className="flex gap-4 mb-3">
                {/* AI Image View */}
                <div className="w-24 h-24 rounded-lg overflow-hidden relative shrink-0 border-2 border-emerald-700">
                  <img src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200&auto=format&fit=crop" alt="Wheat Lot" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 flex justify-center items-center gap-1 text-[10px] text-white">
                    <ImageIcon size={10} /> AI Verified
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Lot #4928</span>
                      <h4 className="text-lg font-bold mt-1 leading-tight">Wheat (Grade A)</h4>
                      <p className="text-emerald-300 text-xs mt-0.5">{isInterstateMode ? '📍 Mandi: Karnal, HR' : `📍 Mandi: ${user?.district || 'Gorakhpur'}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-emerald-200 uppercase">High Bid</p>
                      <p className="text-xl font-bold text-white">₹2,310</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-xs bg-emerald-900/80 p-1.5 rounded mt-2">
                    <span className="text-emerald-50 font-medium">Qty: <span className="text-white font-bold">45.5 Qtl</span></span> 
                    <span className="text-emerald-50 font-medium">Moist: <span className="text-amber-300 font-bold">11.8%</span></span> 
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={() => alert("Bidding simulated. Bid placed successfully! You are the highest bidder.")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2">
               Place Bid (+₹10)
            </button>
          </div>

          {/* Lot 2 */}
          <div className="bg-emerald-800/50 p-4 rounded-xl border border-emerald-700/50 flex flex-col justify-between group hover:border-emerald-500 transition-colors">
            <div>
              <div className="flex gap-4 mb-3">
                {/* AI Image View */}
                <div className="w-24 h-24 rounded-lg overflow-hidden relative shrink-0 border-2 border-emerald-700">
                  <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop" alt="Paddy Lot" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 flex justify-center items-center gap-1 text-[10px] text-white">
                    <CheckCircle2 size={10} className="text-emerald-400" /> Farmgate FPO
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Lot #4931</span>
                      <h4 className="text-lg font-bold mt-1 leading-tight">Paddy (Common)</h4>
                      <p className="text-emerald-300 text-xs mt-0.5">{isInterstateMode ? '📍 FPO: Ludhiana, PB' : `📍 FPO: ${user?.district || 'Gorakhpur'} Rural`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-emerald-200 uppercase">High Bid</p>
                      <p className="text-xl font-bold text-white">₹2,190</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-xs bg-emerald-900/80 p-1.5 rounded mt-2">
                    <span className="text-emerald-50 font-medium">Qty: <span className="text-white font-bold">120 Qtl</span></span> 
                    <span className="text-emerald-50 font-medium">Moist: <span className="text-amber-300 font-bold">14.2%</span></span> 
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={() => alert("Bidding simulated. Bid placed successfully! You are the highest bidder.")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2">
               Place Bid (+₹10)
            </button>
          </div>
        </div>
      </section>

      {/* Purchase Ledger */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-slate-500" /> {t.ledgerTitle}
          </h3>
          <div className="flex gap-2">
            <div className="relative">
              <input type="text" placeholder={t.searchPlaceholder} className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
            <button className="p-2 border border-slate-300 rounded-md hover:bg-slate-100 text-slate-600">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">{t.txnId}</th>
                <th className="p-4 font-semibold">{t.farmerKhasra}</th>
                <th className="p-4 font-semibold">{t.commodity}</th>
                <th className="p-4 font-semibold">{t.qty}</th>
                <th className="p-4 font-semibold">{t.amount}</th>
                <th className="p-4 font-semibold">{t.status}</th>
                <th className="p-4 font-semibold">{t.action}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {transactions.slice().reverse().map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono text-xs text-slate-600">{tx.id || `TXN-${idx}`}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{tx.farmerName}</p>
                  </td>
                  <td className="p-4">{tx.crop}</td>
                  <td className="p-4 font-medium">{tx.quantity}</td>
                  <td className="p-4 font-bold text-slate-800">₹{Number(tx.total).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">{t.settledDbt}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => downloadReceipt({ txnId: tx.id || `TXN-${idx}`, date: new Date().toLocaleDateString(), farmerName: tx.farmerName, farmerId: '-', buyer: tx.traderName, commodity: tx.crop, qty: tx.quantity, rate: tx.price, amount: tx.total, status: 'settled', language })} className="text-slate-600 hover:text-emerald-700 transition" title="View e-Bill">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Buy Grain Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Scale size={20} className="text-emerald-400" /> {t.modalTitle}
              </h3>
              <button onClick={resetModal} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              {buyStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.searchFarmer}</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-mono uppercase" placeholder="Enter Khasra ID or Phone..." />
                        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                      </div>
                      <button onClick={handleSearchFarmer} className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-700 transition">{t.fetch}</button>
                    </div>
                    {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
                  </div>

                  {searchedFarmer && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-start gap-4">
                    <User className="text-slate-400 mt-1" size={24} />
                    <div>
                      <p className="font-bold text-slate-800">{searchedFarmer.name}</p>
                      <p className="text-sm text-slate-600">ID: {searchedFarmer.id || searchedFarmer.khasra} | Phone: {searchedFarmer.phone}</p>
                      <p className="text-sm text-slate-600">Khasra: {searchedFarmer.khasra}</p>
                      <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">{t.verifiedKyc}</span>
                    </div>
                  </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t.selectCommodity}</label>
                      <select className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                        <option value="Wheat">Wheat (Grade A) - ₹{getMsp('Wheat')}/Qtl</option>
                        <option value="Paddy">Paddy (Common) - ₹{getMsp('Paddy')}/Qtl</option>
                        <option value="Mustard">Mustard - ₹{getMsp('Mustard')}/Qtl</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t.weighbridge}</label>
                      <input type="number" value={buyQty} onChange={(e) => setBuyQty(parseFloat(e.target.value) || 0)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-bold text-lg" />
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-emerald-800 font-semibold">{t.totalCost}</p>
                      <p className="text-xs text-emerald-600">{buyQty} Qtl × ₹{cropPrice}</p>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              )}

              {buyStep === 2 && (
                <div className="space-y-6 text-center py-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CreditCard size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">{t.checkoutTitle}</h4>
                  <p className="text-slate-600">
                    <span className="font-bold text-slate-900">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> {t.payTo} {searchedFarmer?.name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <button className="border-2 border-emerald-500 bg-emerald-50 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-emerald-100 transition">
                      <IndianRupee size={28} className="text-emerald-700" />
                      <span className="font-bold text-emerald-800">{t.rtgs}</span>
                    </button>
                    <button className="border-2 border-slate-200 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-slate-300 transition">
                      <CreditCard size={28} className="text-slate-700" />
                      <span className="font-bold text-slate-700">{t.upi}</span>
                    </button>
                  </div>
                </div>
              )}

              {buyStep === 3 && (
                <div className="space-y-6 text-center py-4">
                  <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800">{t.paymentSuccess}</h4>
                  <p className="text-slate-600">{t.dbtTriggered}</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left max-w-sm mx-auto mt-6">
                    <div className="flex justify-between border-b border-slate-200 pb-2 mb-2">
                      <span className="text-slate-500 text-sm">{t.txnIdLabel}</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">{completedTxn?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">{t.amountPaid}</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{completedTxn?.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={resetModal}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-100"
              >
                {buyStep === 3 ? t.close : t.cancel}
              </button>
              
              {buyStep === 1 && (
                <button 
                  onClick={() => setBuyStep(2)} 
                  disabled={!searchedFarmer}
                  className={`px-6 py-2 text-white rounded-lg font-bold flex items-center gap-2 ${!searchedFarmer ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {t.proceedPayment} <ArrowRight size={18} />
                </button>
              )}
              
              {buyStep === 2 && (
                <button onClick={handleConfirmPay} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
                  {t.confirmPay} ₹{totalCost.toLocaleString()}
                </button>
              )}
              
              {buyStep === 3 && completedTxn && (
                <button onClick={() => { 
                  downloadReceipt({ 
                    txnId: completedTxn.id, 
                    date: new Date().toLocaleDateString(), 
                    farmerName: completedTxn.farmerName, 
                    farmerId: searchedFarmer?.id || searchedFarmer?.khasra, 
                    buyer: completedTxn.traderName, 
                    commodity: completedTxn.crop, 
                    qty: completedTxn.quantity, 
                    rate: completedTxn.price, 
                    amount: completedTxn.total, 
                    status: 'settled', 
                    language 
                  }); 
                  resetModal(); 
                }} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2">
                  <Download size={18} /> {t.downloadReceipt}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default TraderDashboard;
