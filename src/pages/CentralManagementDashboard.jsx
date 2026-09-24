import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { Settings, BarChart2, TrendingUp, Save, Search, Users } from 'lucide-react';

const CentralManagementDashboard = () => {
  const { user } = useAuth();
  const { msps, quotas, transactions, adminList, updateMsp, updateQuotas } = useSystem();
  
  const [mspInputs, setMspInputs] = useState({ wheat: '', paddy: '', mustard: '' });
  const [quotaInputs, setQuotaInputs] = useState({ farmer: '', trader: '' });
  
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
    // Extract central values
    const cWheat = msps.find(m => m.level === 'Central' && m.crop === 'Wheat')?.price || '2275';
    const cPaddy = msps.find(m => m.level === 'Central' && m.crop === 'Paddy')?.price || '2183';
    const cMustard = msps.find(m => m.level === 'Central' && m.crop === 'Mustard')?.price || '5650';
    setMspInputs({ wheat: cWheat, paddy: cPaddy, mustard: cMustard });

    const qFarmer = quotas.find(q => q.level === 'Central' && q.target === 'Farmer')?.maxQtl || '200';
    const qTrader = quotas.find(q => q.level === 'Central' && q.target === 'Trader')?.maxQtl || '5000';
    setQuotaInputs({ farmer: qFarmer, trader: qTrader });
  }, [msps, quotas]);

  const handleSave = async () => {
    // Update central MSPs in global state
    const newMsps = msps.map(m => {
      if (m.level !== 'Central') return m;
      if (m.crop === 'Wheat') return { ...m, price: mspInputs.wheat };
      if (m.crop === 'Paddy') return { ...m, price: mspInputs.paddy };
      if (m.crop === 'Mustard') return { ...m, price: mspInputs.mustard };
      return m;
    });
    
    // Update central Quotas
    const newQuotas = quotas.map(q => {
      if (q.level !== 'Central') return q;
      if (q.target === 'Farmer') return { ...q, maxQtl: quotaInputs.farmer };
      if (q.target === 'Trader') return { ...q, maxQtl: quotaInputs.trader };
      return q;
    });

    await updateMsp(newMsps);
    await updateQuotas(newQuotas);
    alert('Settings saved globally!');
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url('/central_mgmt_bg.jpg')` }} />
      
      <div className="space-y-6 text-slate-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-blue-500/30 shadow-lg">
          <div>
            <h2 className="text-3xl font-bold text-white">National Central Management Command</h2>
            <p className="text-blue-200 mt-2">Welcome, {user?.name} | Authority: Central Government</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-200 border border-blue-500/50 hover:bg-slate-700'}`}
            >
              <Settings size={16} className="inline mr-1" /> Settings
            </button>
            <button 
              onClick={() => setActiveTab('search_transactions')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'search_transactions' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-200 border border-blue-500/50 hover:bg-slate-700'}`}
            >
              <Search size={16} className="inline mr-1" /> Transactions
            </button>
            <button 
              onClick={() => setActiveTab('state_admins')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'state_admins' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-200 border border-blue-500/50 hover:bg-slate-700'}`}
            >
              <Users size={16} className="inline mr-1" /> State Admins
            </button>
          </div>
        </div>

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-blue-500/30">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><TrendingUp className="text-blue-400" /> Set National MSP</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                  <span>Wheat (₹/Qtl)</span>
                  <input value={mspInputs.wheat} onChange={e => setMspInputs({...mspInputs, wheat: e.target.value})} className="bg-slate-700 p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                  <span>Paddy (₹/Qtl)</span>
                  <input value={mspInputs.paddy} onChange={e => setMspInputs({...mspInputs, paddy: e.target.value})} className="bg-slate-700 p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                  <span>Mustard (₹/Qtl)</span>
                  <input value={mspInputs.mustard} onChange={e => setMspInputs({...mspInputs, mustard: e.target.value})} className="bg-slate-700 p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-blue-500/30">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Settings className="text-blue-400" /> National Trade Quotas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                  <span>Max Sale per Farmer (Qtl)</span>
                  <input value={quotaInputs.farmer} onChange={e => setQuotaInputs({...quotaInputs, farmer: e.target.value})} className="bg-slate-700 p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                  <span>Max Purchase per Trader (Qtl)</span>
                  <input value={quotaInputs.trader} onChange={e => setQuotaInputs({...quotaInputs, trader: e.target.value})} className="bg-slate-700 p-1 px-3 rounded w-32 text-right outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold mt-4 shadow-lg hover:shadow-blue-500/50 transition-all">Broadcast New Directives</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search_transactions' && (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-blue-500/30 overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Search size={18} className="text-blue-400" /> National Transaction Search
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select 
                  value={searchType} 
                  onChange={(e) => { setSearchType(e.target.value); setSearchResult(null); setSearchEntity(''); }}
                  className="p-2 border border-slate-700 rounded-lg outline-none focus:border-blue-500 bg-slate-800 text-white"
                >
                  <option value="farmer">Farmer</option>
                  <option value="trader">Trader</option>
                </select>
                <input 
                  type="text" 
                  value={searchEntity} 
                  onChange={(e) => setSearchEntity(e.target.value)} 
                  placeholder={`Search by ${searchType === 'farmer' ? 'Farmer' : 'Trader'} Name...`}
                  className="flex-grow p-2 border border-slate-700 rounded-lg outline-none focus:border-blue-500 bg-slate-800 text-white"
                />
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Search
                </button>
              </div>

              {searchResult && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h4 className="font-bold text-xl text-white mb-2">Entity Name: {searchResult.name}</h4>
                  {searchResult.records.length > 0 ? (
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-left border-collapse bg-slate-900 shadow-sm rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-700 text-slate-300 text-xs uppercase tracking-wider">
                            <th className="p-3 font-semibold">{searchType === 'farmer' ? 'Paid By (Trader)' : 'Paid To (Farmer)'}</th>
                            <th className="p-3 font-semibold">Commodity</th>
                            <th className="p-3 font-semibold">Quantity (Qtl)</th>
                            <th className="p-3 font-semibold">Amount Paid</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700 text-sm">
                          {searchResult.records.map((record, idx) => (
                            <tr key={idx} className="hover:bg-slate-800 transition">
                              <td className="p-3 font-bold text-white">
                                {searchType === 'farmer' ? record.traderName : record.farmerName}
                              </td>
                              <td className="p-3 text-slate-300">{record.crop}</td>
                              <td className="p-3 text-slate-300">{record.quantity}</td>
                              <td className="p-3 font-bold text-blue-400">₹{Number(record.total).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic mt-2">No transaction records found for this {searchType}.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'state_admins' && (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg border border-blue-500/30 overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <h3 className="font-bold text-lg">State Authorities (National View)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Admin ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">State</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                  {adminList
                    .filter(a => a.role === 'State Admin')
                    .map((admin, i) => (
                    <tr key={i} className="hover:bg-slate-800 transition">
                      <td className="p-4 font-mono text-xs font-bold text-slate-400">{admin.id}</td>
                      <td className="p-4 font-bold text-white">{admin.name}</td>
                      <td className="p-4 font-medium text-slate-300">{admin.role}</td>
                      <td className="p-4 text-slate-300">{admin.state}</td>
                      <td className="p-4">
                        <span className="text-blue-400 font-bold bg-blue-900/50 px-2 py-1 rounded text-xs">
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

export default CentralManagementDashboard;
