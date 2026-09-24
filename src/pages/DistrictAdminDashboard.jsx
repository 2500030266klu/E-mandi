import { useState } from 'react';
import { Settings, BarChart2, TrendingUp, Save, Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSystem } from '../context/SystemContext';
import { districtAdminTranslations } from '../utils/translations';

const DistrictAdminDashboard = () => {
  const { user } = useAuth();
  const { language } = useSettings();
  const { transactions } = useSystem();
  const t = districtAdminTranslations[language] || districtAdminTranslations.en;

  const [msp, setMsp] = useState({
    wheat: '2275',
    paddy: '2183',
    mustard: '5650'
  });

  const [saved, setSaved] = useState(false);
  const [searchEntity, setSearchEntity] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchType, setSearchType] = useState('farmer');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSearch = () => {
    if (!searchEntity.trim()) return;
    
    let matches = [];
    if (searchType === 'farmer') {
      matches = transactions.filter(t => t.farmerName.toLowerCase().includes(searchEntity.toLowerCase()));
    } else {
      matches = transactions.filter(t => t.traderName.toLowerCase().includes(searchEntity.toLowerCase()));
    }
    
    if (matches.length > 0) {
      setSearchResult({
        name: searchType === 'farmer' ? matches[0].farmerName : matches[0].traderName,
        records: matches
      });
    } else {
      setSearchResult({ name: searchEntity, records: [] });
    }
  };



  // Mock data for traders in the district
  const districtProcurements = [
    { id: 'TRD-102', name: 'Global Agri Corp', commodity: 'Wheat', qty: 4500, price: '₹1,02,37,500' },
    { id: 'TRD-451', name: 'Singh Traders', commodity: 'Paddy', qty: 2100, price: '₹45,84,300' },
    { id: 'TRD-088', name: 'AgriLogistics Pvt', commodity: 'Mustard', qty: 850, price: '₹48,02,500' }
  ];

  // Mock data for auction controllers
  const auctionControllers = [
    { id: 'AUC-101', name: 'Ramesh Kumar', mandi: 'Azadpur Mandi', activeAuctions: 12, status: 'Online' },
    { id: 'AUC-102', name: 'Suresh Singh', mandi: 'Narela Mandi', activeAuctions: 5, status: 'Online' },
    { id: 'AUC-103', name: 'Priya Sharma', mandi: 'Ghazipur Mandi', activeAuctions: 0, status: 'Offline' }
  ];

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.4), rgba(226, 232, 240, 0.6)), url('/district_admin_bg.jpg')` }} />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-white/70 backdrop-blur-md p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="text-emerald-600" /> {t.title}
            </h2>
            <p className="text-slate-600 mt-1">
              District: <strong className="text-slate-800">{user?.district || 'New Delhi'}</strong> | Role: District Agriculture Head
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MSP Settings */}
          <div className="lg:col-span-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h3 className="font-bold text-lg">{t.setMsp}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">{t.currentMsp}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Wheat (Grade A)</label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-slate-300 border-r-0 px-3 py-2 rounded-l-lg text-slate-600">₹</span>
                    <input 
                      type="number" 
                      value={msp.wheat} 
                      onChange={e => setMsp({...msp, wheat: e.target.value})}
                      className="w-24 p-2 border border-slate-300 rounded-r-lg outline-none focus:border-emerald-500 font-bold" 
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Paddy (Common)</label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-slate-300 border-r-0 px-3 py-2 rounded-l-lg text-slate-600">₹</span>
                    <input 
                      type="number" 
                      value={msp.paddy} 
                      onChange={e => setMsp({...msp, paddy: e.target.value})}
                      className="w-24 p-2 border border-slate-300 rounded-r-lg outline-none focus:border-emerald-500 font-bold" 
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Mustard Seed</label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 border border-slate-300 border-r-0 px-3 py-2 rounded-l-lg text-slate-600">₹</span>
                    <input 
                      type="number" 
                      value={msp.mustard} 
                      onChange={e => setMsp({...msp, mustard: e.target.value})}
                      className="w-24 p-2 border border-slate-300 rounded-r-lg outline-none focus:border-emerald-500 font-bold" 
                    />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleSave}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition flex justify-center items-center gap-2"
              >
                {saved ? <span className="flex items-center gap-2">Saved!</span> : <><Save size={18} /> {t.update}</>}
              </button>
            </div>
          </div>



          {/* Ledger */}
          <div className="lg:col-span-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BarChart2 size={18} className="text-emerald-400" /> {t.ledger}
              </h3>
            </div>
            
            <div className="flex-grow overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">{t.trader}</th>
                    <th className="p-4 font-semibold">{t.commodity}</th>
                    <th className="p-4 font-semibold">{t.amount} (Qtl)</th>
                    <th className="p-4 font-semibold">Total Value</th>
                    <th className="p-4 font-semibold">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {districtProcurements.map((procurement, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{procurement.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{procurement.id}</p>
                      </td>
                      <td className="p-4">{procurement.commodity}</td>
                      <td className="p-4 font-medium">{procurement.qty}</td>
                      <td className="p-4 font-bold text-emerald-700">{procurement.price}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">Procured</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Entity Transaction Search */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Search size={18} className="text-emerald-400" /> Transaction Search (Farmer / Trader)
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <select 
                value={searchType} 
                onChange={(e) => { setSearchType(e.target.value); setSearchResult(null); setSearchEntity(''); }}
                className="p-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
              >
                <option value="farmer">Farmer</option>
                <option value="trader">Trader</option>
              </select>
              <input 
                type="text" 
                value={searchEntity} 
                onChange={(e) => setSearchEntity(e.target.value)} 
                placeholder={`Search by ${searchType === 'farmer' ? 'Farmer' : 'Trader'} Name...`}
                className="flex-grow p-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
              />
              <button 
                onClick={handleSearch}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Search
              </button>
            </div>

            {searchResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-xl text-slate-800 mb-2">Entity Name: {searchResult.name}</h4>
                {searchResult.records.length > 0 ? (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-slate-200 text-slate-700 text-xs uppercase tracking-wider">
                          <th className="p-3 font-semibold">{searchType === 'farmer' ? 'Paid By (Trader)' : 'Paid To (Farmer)'}</th>
                          <th className="p-3 font-semibold">Commodity</th>
                          <th className="p-3 font-semibold">Quantity (Qtl)</th>
                          <th className="p-3 font-semibold">Amount Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {searchResult.records.map((record, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-bold text-slate-800">
                              {searchType === 'farmer' ? record.traderName : record.farmerName}
                            </td>
                            <td className="p-3">{record.crop}</td>
                            <td className="p-3">{record.quantity}</td>
                            <td className="p-3 font-bold text-emerald-700">₹{Number(record.total).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 italic mt-2">No transaction records found for this {searchType}.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Auction Controllers Monitoring */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users size={18} className="text-emerald-400" /> Monitor Auction Controllers
            </h3>
          </div>
          <div className="flex-grow overflow-auto">
            <table className="w-full text-left border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Controller Name & ID</th>
                  <th className="p-4 font-semibold">Mandi Location</th>
                  <th className="p-4 font-semibold">Active Auctions</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {auctionControllers.map((controller, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{controller.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{controller.id}</p>
                    </td>
                    <td className="p-4 text-slate-700">{controller.mandi}</td>
                    <td className="p-4 font-medium text-slate-700">{controller.activeAuctions}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${controller.status === 'Online' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {controller.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default DistrictAdminDashboard;
