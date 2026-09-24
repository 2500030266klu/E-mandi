import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { Settings, BarChart2, TrendingUp, Save, Search, Users } from 'lucide-react';

const StateManagementDashboard = () => {
  const { user } = useAuth();
  const { msps, quotas, transactions, adminList, updateMsp, updateQuotas } = useSystem();
  
  const [mspInputs, setMspInputs] = useState({ wheat: '', paddy: '', mustard: '' });
  const [quotaInputs, setQuotaInputs] = useState({ districtFarmerMaxQtl: '', districtTraderMaxQtl: '' });
  
  const [activeTab, setActiveTab] = useState('settings');
  const [searchEntity, setSearchEntity] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchType, setSearchType] = useState('farmer');

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

  useEffect(() => {
    // Extract state values
    const sWheat = msps.find(m => m.level === 'State' && m.crop === 'Wheat')?.price || '2275';
    const sPaddy = msps.find(m => m.level === 'State' && m.crop === 'Paddy')?.price || '2183';
    const sMustard = msps.find(m => m.level === 'State' && m.crop === 'Mustard')?.price || '5650';
    setMspInputs({ wheat: sWheat, paddy: sPaddy, mustard: sMustard });

    const qFarmer = quotas.find(q => q.level === 'State' && q.target === 'Farmer')?.maxQtl || '200';
    const qTrader = quotas.find(q => q.level === 'State' && q.target === 'Trader')?.maxQtl || '4500';
    setQuotaInputs({ districtFarmerMaxQtl: qFarmer, districtTraderMaxQtl: qTrader });
  }, [msps, quotas]);

  const handleSave = async () => {
    // Update state MSPs in global state
    const newMsps = msps.map(m => {
      if (m.level !== 'State') return m;
      if (m.crop === 'Wheat') return { ...m, price: mspInputs.wheat };
      if (m.crop === 'Paddy') return { ...m, price: mspInputs.paddy };
      if (m.crop === 'Mustard') return { ...m, price: mspInputs.mustard };
      return m;
    });
    
    // Update state Quotas
    const newQuotas = quotas.map(q => {
      if (q.level !== 'State') return q;
      if (q.target === 'Farmer') return { ...q, maxQtl: quotaInputs.districtFarmerMaxQtl };
      if (q.target === 'Trader') return { ...q, maxQtl: quotaInputs.districtTraderMaxQtl };
      return q;
    });

    await updateMsp(newMsps);
    await updateQuotas(newQuotas);
    alert('State constraints updated globally!');
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.6), rgba(226, 232, 240, 0.8)), url('/state_mgmt_bg.jpg')` }} />
      
      <div className="space-y-6 text-slate-800">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-blue-500/30 shadow-lg">
          <div>
            <h2 className="text-3xl font-bold text-blue-900">State Agriculture Command</h2>
            <p className="text-slate-600 mt-2">Welcome, {user?.name} | Jurisdiction: {user?.jurisdiction || 'Punjab'}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Settings size={16} className="inline mr-1" /> Settings
            </button>
            <button 
              onClick={() => setActiveTab('search_transactions')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'search_transactions' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Search size={16} className="inline mr-1" /> Transactions
            </button>
            <button 
              onClick={() => setActiveTab('district_admins')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'district_admins' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Users size={16} className="inline mr-1" /> Local Admins
            </button>
          </div>
        </div>

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-blue-500/30 shadow-lg">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><TrendingUp className="text-blue-600" /> State Level MSP</h3>
              <p className="text-xs text-slate-500 mb-4">*Cannot exceed Central MSP guidelines</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-100 p-3 rounded">
                  <span className="font-semibold">Wheat (₹/Qtl)</span>
                  <input value={mspInputs.wheat} onChange={e => setMspInputs({...mspInputs, wheat: e.target.value})} className="bg-white border p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex justify-between items-center bg-slate-100 p-3 rounded">
                  <span className="font-semibold">Paddy (₹/Qtl)</span>
                  <input value={mspInputs.paddy} onChange={e => setMspInputs({...mspInputs, paddy: e.target.value})} className="bg-white border p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex justify-between items-center bg-slate-100 p-3 rounded">
                  <span className="font-semibold">Mustard (₹/Qtl)</span>
                  <input value={mspInputs.mustard} onChange={e => setMspInputs({...mspInputs, mustard: e.target.value})} className="bg-white border p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-blue-500/30 shadow-lg">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Settings className="text-blue-600" /> District Trade Limits</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-100 p-3 rounded">
                  <span className="font-semibold">Max Sale per Farmer (Qtl)</span>
                  <input value={quotaInputs.districtFarmerMaxQtl} onChange={e => setQuotaInputs({...quotaInputs, districtFarmerMaxQtl: e.target.value})} className="bg-white border p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex justify-between items-center bg-slate-100 p-3 rounded">
                  <span className="font-semibold">Max Purchase per Trader (Qtl)</span>
                  <input value={quotaInputs.districtTraderMaxQtl} onChange={e => setQuotaInputs({...quotaInputs, districtTraderMaxQtl: e.target.value})} className="bg-white border p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold mt-4 shadow-md transition">Apply Limits to Districts</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search_transactions' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-500/30 overflow-hidden flex flex-col">
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Search size={18} className="text-blue-300" /> State-wide Transaction Search
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select 
                  value={searchType} 
                  onChange={(e) => { setSearchType(e.target.value); setSearchResult(null); setSearchEntity(''); }}
                  className="p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  <option value="farmer">Farmer</option>
                  <option value="trader">Trader</option>
                </select>
                <input 
                  type="text" 
                  value={searchEntity} 
                  onChange={(e) => setSearchEntity(e.target.value)} 
                  placeholder={`Search by ${searchType === 'farmer' ? 'Farmer' : 'Trader'} Name...`}
                  className="flex-grow p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
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
                              <td className="p-3 font-bold text-blue-700">₹{Number(record.total).toLocaleString()}</td>
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
        )}

        {activeTab === 'district_admins' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-500/30 overflow-hidden">
            <div className="bg-blue-900 p-4 text-white flex items-center gap-2">
              <Users size={18} className="text-blue-300" />
              <h3 className="font-bold text-lg">District Authorities in State</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Admin ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">District</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {adminList
                    .filter(a => a.role === 'District Admin' || a.role === 'Auction Authority')
                    .map((admin, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-xs font-bold text-slate-500">{admin.id}</td>
                      <td className="p-4 font-bold text-slate-800">{admin.name}</td>
                      <td className="p-4 font-medium text-slate-700">{admin.role}</td>
                      <td className="p-4">{admin.district}</td>
                      <td className="p-4">
                        <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded text-xs">
                          {admin.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StateManagementDashboard;
