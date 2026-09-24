import React from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useSystem } from '../context/SystemContext';
import { mspTranslations } from '../utils/translations';

const MSPRates = () => {
  const { language } = useSettings();
  const t = mspTranslations[language] || mspTranslations.en;
  const { msps } = useSystem();

  const baseMspData = [
    { id: 1, commodity: 'Paddy (Common)', cropType: 'Kharif', price2023: 2183, price2024: 2300, increase: 117 },
    { id: 2, commodity: 'Paddy (Grade A)', cropType: 'Kharif', price2023: 2203, price2024: 2320, increase: 117 },
    { id: 3, commodity: 'Wheat', cropType: 'Rabi', price2023: 2125, price2024: 2275, increase: 150 },
    { id: 4, commodity: 'Barley', cropType: 'Rabi', price2023: 1735, price2024: 1850, increase: 115 },
    { id: 5, commodity: 'Gram', cropType: 'Rabi', price2023: 5335, price2024: 5440, increase: 105 },
    { id: 6, commodity: 'Lentil (Masur)', cropType: 'Rabi', price2023: 6000, price2024: 6425, increase: 425 },
    { id: 7, commodity: 'Rapeseed & Mustard', cropType: 'Rabi', price2023: 5450, price2024: 5650, increase: 200 },
    { id: 8, commodity: 'Safflower', cropType: 'Rabi', price2023: 5650, price2024: 5800, increase: 150 },
    { id: 9, commodity: 'Jowar (Hybrid)', cropType: 'Kharif', price2023: 3180, price2024: 3371, increase: 191 },
    { id: 10, commodity: 'Bajra', cropType: 'Kharif', price2023: 2500, price2024: 2625, increase: 125 },
  ];

  const mspData = baseMspData.map(item => {
    // Try to find matching live data from system_msp.csv via backend
    const backendMsp = msps?.find(m => item.commodity.toLowerCase().includes(m.crop?.toLowerCase()));
    if (backendMsp && backendMsp.price) {
      const newPrice = parseInt(backendMsp.price, 10);
      return {
        ...item,
        price2024: newPrice,
        increase: newPrice - item.price2023
      };
    }
    return item;
  });

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="bg-emerald-900 px-6 py-8 text-white">
        <Link to="/" className="inline-flex items-center text-emerald-200 hover:text-white mb-6 transition">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-800 rounded-lg">
            <TrendingUp size={28} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
            <p className="text-emerald-100/80 mt-1 text-sm md:text-base">{t.sub}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-4 font-semibold text-slate-700">{t.comm}</th>
              <th className="py-4 px-4 font-semibold text-slate-700">{t.type}</th>
              <th className="py-4 px-4 font-semibold text-slate-700">{t.p23}</th>
              <th className="py-4 px-4 font-semibold text-emerald-700 bg-emerald-50/50">{t.p24}</th>
              <th className="py-4 px-4 font-semibold text-slate-700">{t.inc}</th>
            </tr>
          </thead>
          <tbody>
            {mspData.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                <td className="py-4 px-4 font-medium text-slate-800">{item.commodity}</td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.cropType === 'Kharif' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.cropType}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-500">₹{item.price2023}</td>
                <td className="py-4 px-4 font-bold text-emerald-600 bg-emerald-50/30">₹{item.price2024}</td>
                <td className="py-4 px-4">
                  <span className="flex items-center text-emerald-500 text-sm font-semibold">
                    <TrendingUp size={14} className="mr-1" /> +₹{item.increase}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-3 border border-blue-100">
           <div className="shrink-0 mt-0.5 text-blue-500">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
           </div>
           <p><strong>Note:</strong> {t.note}</p>
        </div>
      </div>
    </div>
  );
};

export default MSPRates;
