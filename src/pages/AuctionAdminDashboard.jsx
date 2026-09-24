import { useState } from 'react';
import { Gavel, Users, CheckCircle, Search, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useSystem } from '../context/SystemContext';
import { auctionAdminTranslations } from '../utils/translations';

const AuctionAdminDashboard = () => {
  const { user } = useAuth();
  const { language } = useSettings();
  const { transactions, tokens, updateTokenStatus } = useSystem();
  const t = auctionAdminTranslations[language] || auctionAdminTranslations.en;

  const [activeTab, setActiveTab] = useState('farmer_sales');
  
  // Transaction search state
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

  // Mock Data for Farmer Sales (What farmers sold)
  const farmerSales = [
    { id: 'FMR-1022', name: 'Ramesh Kumar', crop: 'Wheat', qty: 45.50, price: '₹1,03,512', buyer: 'Global Agri Corp' },
    { id: 'FMR-3944', name: 'Suresh Singh', crop: 'Paddy', qty: 120.00, price: '₹2,61,960', buyer: 'Singh Traders' },
    { id: 'FMR-8811', name: 'Anil Sharma', crop: 'Mustard', qty: 25.00, price: '₹1,41,250', buyer: 'AgriLogistics Pvt' }
  ];

  // Mock Data for Traders wanting to sell in auction to the Govt
  const [auctions, setAuctions] = useState([
    { id: 'AUC-991', trader: 'Global Agri Corp', crop: 'Wheat', qty: 1000, askPrice: '₹2,275/Qtl', status: 'pending' },
    { id: 'AUC-992', trader: 'Singh Traders', crop: 'Paddy', qty: 500, askPrice: '₹2,183/Qtl', status: 'pending' }
  ]);

  const authorizeAuction = (id) => {
    setAuctions(auctions.map(a => a.id === id ? { ...a, status: 'authorized' } : a));
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.4), rgba(226, 232, 240, 0.6)), url('/auction_admin_bg.jpg')` }} />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-white/70 backdrop-blur-md p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Gavel className="text-emerald-600" /> {t.title}
            </h2>
            <p className="text-slate-600 mt-1">
              Auth ID: <strong className="text-slate-800">{user?.id || 'AUTH-9092'}</strong> | Role: Procurement/Auction Authority
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('farmer_sales')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'farmer_sales' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Users size={16} className="inline mr-1" /> {t.farmerSales}
            </button>
            <button 
              onClick={() => setActiveTab('auctions')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'auctions' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Gavel size={16} className="inline mr-1" /> {t.authorizeAuction}
            </button>
            <button 
              onClick={() => setActiveTab('search_transactions')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'search_transactions' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <Search size={16} className="inline mr-1" /> Find Transactions
            </button>
            <button 
              onClick={() => setActiveTab('token_requests')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === 'token_requests' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              <CheckCircle size={16} className="inline mr-1" /> Token Requests
            </button>
          </div>
        </div>

        {activeTab === 'farmer_sales' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText size={18} className="text-emerald-400" /> {t.farmerSales}
              </h3>
              <div className="relative">
                <input type="text" placeholder="Search farmer..." className="text-sm py-1.5 pl-8 pr-3 rounded bg-slate-800 border-none text-white outline-none focus:ring-1 focus:ring-emerald-400 placeholder-slate-400" />
                <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">{t.farmer}</th>
                    <th className="p-4 font-semibold">Crop</th>
                    <th className="p-4 font-semibold">{t.qty} (Qtl)</th>
                    <th className="p-4 font-semibold">Total Price</th>
                    <th className="p-4 font-semibold">Bought By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {farmerSales.map((sale, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{sale.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{sale.id}</p>
                      </td>
                      <td className="p-4">{sale.crop}</td>
                      <td className="p-4 font-medium">{sale.qty}</td>
                      <td className="p-4 font-bold text-slate-800">{sale.price}</td>
                      <td className="p-4 text-emerald-700 font-semibold">{sale.buyer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'auctions' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center gap-2">
              <Gavel size={18} className="text-emerald-400" />
              <h3 className="font-bold text-lg">{t.buyFromTrader}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Auction ID</th>
                    <th className="p-4 font-semibold">Trader</th>
                    <th className="p-4 font-semibold">Crop / Qty</th>
                    <th className="p-4 font-semibold">Ask Price</th>
                    <th className="p-4 font-semibold">{t.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {auctions.map((auction, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-xs font-bold text-slate-500">{auction.id}</td>
                      <td className="p-4 font-bold text-slate-800">{auction.trader}</td>
                      <td className="p-4">
                        <span className="block">{auction.crop}</span>
                        <span className="text-xs text-slate-500">{auction.qty} Qtl</span>
                      </td>
                      <td className="p-4 font-bold text-emerald-700">{auction.askPrice}</td>
                      <td className="p-4">
                        {auction.status === 'pending' ? (
                          <button 
                            onClick={() => authorizeAuction(auction.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-xs shadow transition flex items-center gap-1"
                          >
                            <CheckCircle size={14} /> {t.authorize}
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                            <CheckCircle size={14} /> Authorized
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'token_requests' && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" />
              <h3 className="font-bold text-lg">Farmer Token Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Token ID</th>
                    <th className="p-4 font-semibold">Farmer</th>
                    <th className="p-4 font-semibold">Location</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">{t.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {tokens.map((token, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-xs font-bold text-slate-500">{token.id}</td>
                      <td className="p-4 font-bold text-slate-800">{token.farmerName}</td>
                      <td className="p-4">
                        <span className="block">{token.mandi}</span>
                        <span className="text-xs text-slate-500">{token.district}, {token.state}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{token.date}</td>
                      <td className="p-4">
                        {token.status === 'pending' ? (
                          <button 
                            onClick={() => updateTokenStatus(token.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-xs shadow transition flex items-center gap-1"
                          >
                            <CheckCircle size={14} /> Approve Token
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                            <CheckCircle size={14} /> Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tokens.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 italic">No token requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'search_transactions' && (
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
        )}

      </div>
    </>
  );
};

export default AuctionAdminDashboard;
