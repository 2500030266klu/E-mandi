import { Globe, LogOut, User, Menu, X, Home as HomeIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings, LANGUAGES } from '../context/SettingsContext';
import VoiceAssistant from './VoiceAssistant';

const headerTranslations = {
  en: { dept: "Government of India | Department of Agriculture & Farmers Welfare", title: "Kisan-Vyapar e-Portal", subtitle: "National Agricultural Procurement & Trade System", farmer: "Farmer Portal", trader: "Trader Portal", admin: "Department Admin", logout: "Log Out" },
  hi: { dept: "भारत सरकार | कृषि एवं किसान कल्याण विभाग", title: "किसान-व्यापार ई-पोर्टल", subtitle: "राष्ट्रीय कृषि खरीद एवं व्यापार प्रणाली", farmer: "किसान पोर्टल", trader: "व्यापारी पोर्टल", admin: "विभाग एडमिन", logout: "लॉग आउट" },
  te: { dept: "భారత ప్రభుత్వం | వ్యవసాయ & రైతు సంక్షేమ విభాగం", title: "కిసాన్-వ్యాపార్ ఈ-పోర్టల్", subtitle: "జాతీయ వ్యవసాయ సేకరణ & వాణిజ్య వ్యవస్థ", farmer: "రైతు పోర్టల్", trader: "వ్యాపారి పోర్టల్", admin: "విభాగ నిర్వాహకుడు", logout: "లాగ్ అవుట్" },
  ta: { dept: "இந்திய அரசு | வேளாண் & விவசாயிகள் நலத் துறை", title: "கிசான்-வியாபார் ஈ-போர்ட்டல்", subtitle: "தேசிய வேளாண் கொள்முதல் & வர்த்தக அமைப்பு", farmer: "விவசாயி போர்ட்டல்", trader: "வணிகர் போர்ட்டல்", admin: "துறை நிர்வாகி", logout: "வெளியேறு" },
  mr: { dept: "भारत सरकार | कृषी आणि शेतकरी कल्याण विभाग", title: "किसान-व्यापार ई-पोर्टल", subtitle: "राष्ट्रीय कृषी खरेदी आणि व्यापार प्रणाली", farmer: "शेतकरी पोर्टल", trader: "व्यापारी पोर्टल", admin: "विभाग प्रशासक", logout: "लॉग आउट" },
  pa: { dept: "ਭਾਰਤ ਸਰਕਾਰ | ਖੇਤੀਬਾੜੀ ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ ਵਿਭਾਗ", title: "ਕਿਸਾਨ-ਵਪਾਰ ਈ-ਪੋਰਟਲ", subtitle: "ਰਾਸ਼ਟਰੀ ਖੇਤੀ ਖਰੀਦ ਅਤੇ ਵਪਾਰ ਪ੍ਰਣਾਲੀ", farmer: "ਕਿਸਾਨ ਪੋਰਟਲ", trader: "ਵਪਾਰੀ ਪੋਰਟਲ", admin: "ਵਿਭਾਗ ਪ੍ਰਸ਼ਾਸਕ", logout: "ਲੌਗ ਆਊਟ" },
  hr: { dept: "भारत सरकार | खेती अर किसान भलाई विभाग", title: "किसान-व्यापार ई-पोर्टल", subtitle: "राष्ट्रीय खेती खरीद अर व्यापार तंत्र", farmer: "किसान पोर्टल", trader: "व्यापारी पोर्टल", admin: "विभाग एडमिन", logout: "लॉग आउट" },
  bn: { dept: "ভারত সরকার | কৃষি ও কৃষক কল্যাণ বিভাগ", title: "কিষাণ-ব্যাপার ই-পোর্টাল", subtitle: "জাতীয় কৃষি সংগ্রহ ও বাণিজ্য ব্যবস্থা", farmer: "কৃষক পোর্টাল", trader: "ব্যবসায়ী পোর্টাল", admin: "বিভাগ প্রশাসক", logout: "লগ আউট" },
  or: { dept: "ଭାରତ ସରକାର | କୃଷି ଏବଂ କୃଷକ କଲ୍ୟାଣ ବିଭାଗ", title: "କିସାନ-ବ୍ୟାପାର ଇ-ପୋର୍ଟାଲ", subtitle: "ଜାତୀୟ କୃଷି କ୍ରୟ ଏବଂ ବାଣିଜ୍ୟ ବ୍ୟବସ୍ଥା", farmer: "କୃଷକ ପୋର୍ଟାଲ", trader: "ବ୍ୟାପାରୀ ପୋର୍ଟାଲ", admin: "ବିভাগ ପ୍ରଶାସକ", logout: "ଲଗ ଆଉଟ" }
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { fontSize, changeFontSize, language, changeLanguage } = useSettings();
  
  const t = headerTranslations[language] || headerTranslations.en;
  const isFarmer = location.pathname.includes('/farmer') || (user && user.role === 'farmer');

  const getDashboardLink = (role) => {
    switch(role) {
      case 'farmer': return '/farmer/dashboard';
      case 'trader': return '/trader/dashboard';
      case 'district_admin': return '/admin/district-dashboard';
      case 'auction_admin': return '/admin/auction-dashboard';
      case 'central_admin': return '/management/central-dashboard';
      case 'state_admin': return '/management/state-dashboard';
      default: return '/';
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };
  
  return (
    <header className="bg-govPrimary text-white shadow-md relative z-50">
      {/* Top utility bar */}
      <div className="bg-govTertiary text-[10px] sm:text-xs px-2 sm:px-4 py-1 flex flex-col sm:flex-row justify-between items-center text-white gap-1 sm:gap-0">
        <div className="text-center sm:text-left truncate w-full sm:w-auto">{t.dept}</div>
        <div className="flex gap-3 sm:gap-4 items-center">
          <div className="flex items-center gap-1">
            <Globe size={14} />
            <select 
              value={language} 
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-govPrimary text-white text-[10px] sm:text-xs border border-white/20 rounded px-1 sm:px-2 py-0.5 outline-none cursor-pointer hover:bg-govSecondary transition"
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <button onClick={() => changeFontSize('small')} className={`hover:underline px-1 ${fontSize === 'small' ? 'font-bold text-white' : ''}`}>A-</button>
            <button onClick={() => changeFontSize('normal')} className={`hover:underline px-1 ${fontSize === 'normal' ? 'font-bold text-white' : ''}`}>A</button>
            <button onClick={() => changeFontSize('large')} className={`hover:underline px-1 ${fontSize === 'large' ? 'font-bold text-white' : ''}`}>A+</button>
          </div>
          <div className="flex items-center ml-1 sm:ml-2 border-l border-white/20 pl-2 sm:pl-3">
            <VoiceAssistant />
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="w-full px-6 sm:px-8 py-3 sm:py-4 flex justify-between items-center border-b-[3px] border-govSecondary">
        <Link to="/" className="flex items-center gap-3 sm:gap-4 hover:opacity-90 transition">
          <div className="w-10 h-14 sm:w-12 sm:h-16 bg-white rounded-sm flex items-center justify-center text-govPrimary font-bold border border-govBorder shadow-sm text-sm sm:text-base shrink-0">
            GOI
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide leading-tight">{t.title}</h1>
            <p className="text-xs sm:text-sm text-govBackground/80 hidden sm:block">{t.subtitle}</p>
          </div>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {user ? (
            <div className="flex items-center gap-6">
              <Link to={getDashboardLink(user.role)} className="text-govBackground hover:text-white transition font-medium pb-1">Dashboard</Link>
              <Link to="/help" className="text-govBackground hover:text-white transition font-medium pb-1">Help</Link>
              <span className="text-govSecondary font-medium flex items-center gap-2">
                <User size={18} /> <span className="truncate max-w-[150px]">{user.name || 'User'}</span>
              </span>
              <a href="#" onClick={handleLogout} className="text-govBackground hover:text-white transition font-medium flex items-center gap-1">
                <LogOut size={18} /> {t.logout}
              </a>
            </div>
          ) : (location.pathname === '/' || location.pathname === '/help') ? (
            <>
              <Link to="/" className={`hover:text-emerald-400 transition font-medium pb-1 ${location.pathname === '/' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-emerald-200'}`}>Home</Link>
              <Link to="/farmer/login" className={`hover:text-emerald-400 transition font-medium pb-1 ${isFarmer && location.pathname !== '/' ? 'border-b-2 border-emerald-500 text-emerald-400' : ''}`}>{t.farmer}</Link>
              <Link to="/trader/login" className={`hover:text-emerald-400 transition font-medium pb-1 ${!isFarmer && location.pathname.includes('/trader') ? 'border-b-2 border-emerald-500 text-emerald-400' : ''}`}>{t.trader}</Link>
              <Link to="/admin/login" className={`hover:text-emerald-400 transition font-medium pb-1 ${location.pathname.includes('/admin') ? 'border-b-2 border-emerald-500 text-emerald-400' : ''}`}>{t.admin}</Link>
              <Link to="/management/login" className={`hover:text-blue-400 transition font-medium pb-1 ${location.pathname.includes('/management') ? 'border-b-2 border-blue-500 text-blue-400' : ''}`}>Management</Link>
              <Link to="/help" className={`hover:text-emerald-400 transition font-medium pb-1 ${location.pathname.includes('/help') ? 'border-b-2 border-emerald-500 text-emerald-400' : ''}`}>Help</Link>
            </>
          ) : (
            <Link to="/" className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm border border-emerald-500">
              <HomeIcon size={18} /> Back to Home
            </Link>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-xl py-2 flex flex-col">
          {user ? (
            <>
              <div className="px-6 py-3 border-b border-slate-700">
                <span className="text-emerald-400 font-medium flex items-center gap-2">
                  <User size={18} /> {user.name || 'User'}
                </span>
              </div>
              <Link to={getDashboardLink(user.role)} onClick={() => setMobileMenuOpen(false)} className="px-6 py-4 text-white hover:bg-slate-700 flex items-center gap-2 border-b border-slate-700">
                 Dashboard
              </Link>
              <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="px-6 py-4 text-white hover:bg-slate-700 flex items-center gap-2 border-b border-slate-700">
                 Help
              </Link>
              <a href="#" onClick={handleLogout} className="px-6 py-4 text-white hover:bg-slate-700 flex items-center gap-2">
                <LogOut size={18} /> {t.logout}
              </a>
            </>
          ) : (location.pathname === '/' || location.pathname === '/help') ? (
            <>
              <Link to="/farmer/login" onClick={() => setMobileMenuOpen(false)} className={`px-6 py-4 border-b border-slate-700 block hover:bg-slate-700 ${isFarmer ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-white'}`}>
                {t.farmer}
              </Link>
              <Link to="/trader/login" onClick={() => setMobileMenuOpen(false)} className={`px-6 py-4 border-b border-slate-700 block hover:bg-slate-700 ${!isFarmer && location.pathname.includes('/trader') ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-white'}`}>
                {t.trader}
              </Link>
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className={`px-6 py-4 border-b border-slate-700 block hover:bg-slate-700 ${location.pathname.includes('/admin') ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-white'}`}>
                {t.admin}
              </Link>
              <Link to="/management/login" onClick={() => setMobileMenuOpen(false)} className={`px-6 py-4 border-b border-slate-700 block hover:bg-slate-700 ${location.pathname.includes('/management') ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-white'}`}>
                Management
              </Link>
              <Link to="/help" onClick={() => setMobileMenuOpen(false)} className={`px-6 py-4 block hover:bg-slate-700 ${location.pathname.includes('/help') ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-white'}`}>
                Help
              </Link>
            </>
          ) : (
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-6 py-4 text-white hover:bg-slate-700 flex items-center gap-2 font-medium">
              <HomeIcon size={18} /> Back to Home
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
