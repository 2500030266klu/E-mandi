import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, TrendingUp, Users, Sprout, Building, LogIn, ChevronRight, Briefcase, BarChart3, Activity } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';
import NationalFarmerStats from '../components/NationalFarmerStats';
import { useSettings } from '../context/SettingsContext';
import { homeTranslations } from '../utils/translations';

const Home = () => {
  const { language } = useSettings();
  const t = homeTranslations[language] || homeTranslations.en;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full">
      
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden py-20 px-6 sm:px-12 lg:px-24">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[80%] rounded-full bg-emerald-500 blur-3xl"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-teal-400 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 w-full text-center md:text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-600/50 text-emerald-200 text-sm font-semibold mb-6 backdrop-blur-md">
                <Leaf size={16} /> {t.empower}
             </div>
             <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                {t.future} <span className="text-emerald-400">{t.agritrade}</span><br/> {t.ishere}
             </h1>
             <p className="text-lg md:text-xl text-emerald-100/90 mb-10 max-w-xl leading-relaxed font-medium">
                {t.desc}
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#portal" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center gap-2">
                   {t.getStarted} <ArrowRight size={20} />
                </a>
                <a href="#national-stats" className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2">
                   <Activity size={20} className="text-emerald-400" /> Live Farmer Stats (11.8Cr+)
                </a>
             </div>
          </div>

          {/* Government Initiatives & Updates */}
          <div className="md:w-1/2 w-full flex flex-col gap-4">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col justify-center transition duration-300">
                <div className="flex items-center gap-3 mb-2">
                   <TrendingUp className="text-emerald-400" size={24} />
                   <h3 className="text-xl font-bold">{t.latestMsp}</h3>
                </div>
                <p className="text-emerald-100/90 text-sm mb-3">{t.mspDesc}</p>
                <Link to="/msp-rates" className="text-emerald-400 text-sm font-semibold flex items-center hover:underline w-fit">{t.viewAllMsp} <ChevronRight size={16} className="ml-1" /></Link>
             </div>
             
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col justify-center transition duration-300">
                <div className="flex items-center gap-3 mb-4">
                   <ShieldCheck className="text-emerald-400" size={24} />
                   <h3 className="text-xl font-bold">{t.welfare}</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-2 items-start text-sm text-emerald-100/90"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div><p>{t.pmkisan}</p></li>
                  <li className="flex gap-2 items-start text-sm text-emerald-100/90"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div><p>{t.pmfby}</p></li>
                  <li className="flex gap-2 items-start text-sm text-emerald-100/90"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div><p>{t.kcc}</p></li>
                </ul>
             </div>

             <div className="transition duration-300">
                <WeatherWidget />
             </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="portal" className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex justify-center items-center p-3 bg-emerald-100 rounded-2xl mb-6">
            <Users size={32} className="text-emerald-700" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">{t.accessPortal}</h2>
          <p className="text-slate-600 text-lg md:text-xl">{t.selectRole}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Farmer Card */}
          <Link to="/farmer/login" className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg border border-slate-200 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 transition-transform duration-300">
              <Sprout size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{t.farmers}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">Sell your produce directly to a wider network of buyers at better prices. Access market trends and digital payments.</p>
            <div className="flex items-center text-emerald-600 font-semibold text-sm">
              {t.enterPortal} <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>

          {/* Trader Card */}
          <Link to="/trader/login" className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg border border-slate-200 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 transition-transform duration-300">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{t.traders}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">Source high-quality agricultural commodities directly from farmers across the country with unified licensing.</p>
            <div className="flex items-center text-blue-600 font-semibold text-sm">
              {t.enterPortal} <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>

          {/* Admin Card */}
          <Link to="/admin/login" className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg border border-slate-200 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 transition-transform duration-300">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{t.admins}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">Manage mandi operations, oversee local auctions, and ensure smooth trading and compliance at the district level.</p>
            <div className="flex items-center text-purple-600 font-semibold text-sm">
              {t.enterPortal} <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>

          {/* Management Card */}
          <Link to="/management/login" className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg border border-slate-200 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 mb-6 transition-transform duration-300">
              <Briefcase size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{t.management}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">High-level oversight for State and Central authorities to monitor macro-trends, policies, and system-wide health.</p>
            <div className="flex items-center text-slate-700 font-semibold text-sm">
              {t.enterPortal} <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Live National Farmer Statistics & Govt Portal Section */}
      <NationalFarmerStats />

      {/* Features Section */}
      <section id="features" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Revolutionizing Agricultural Trade</h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              We provide a transparent, efficient, and robust digital ecosystem that eliminates unnecessary intermediaries and empowers the primary stakeholders of the agricultural economy.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-slate-800">Direct Market Access</h4>
                  <p className="text-slate-500 mt-1">Connecting farmers directly with buyers across the nation, expanding reach beyond local mandis.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-slate-800">Secure & Instant Payments</h4>
                  <p className="text-slate-500 mt-1">Integrated digital payment solutions ensuring fast, secure, and transparent settlements.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-slate-800">Real-time Analytics</h4>
                  <p className="text-slate-500 mt-1">Live price discovery and market trends to help you make informed trading decisions.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
               {/* Decorative placeholder */}
               <div className="bg-slate-100 w-full h-[400px] flex items-center justify-center flex-col p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 to-blue-50/50 mix-blend-multiply"></div>
                  <BarChart3 size={80} className="text-emerald-300 mb-6 opacity-80" />
                  <h3 className="text-2xl font-bold text-slate-700 relative z-10">Advanced Dashboard Previews</h3>
                  <p className="text-slate-500 mt-2 relative z-10">Sign in to experience the full suite of tools.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 mt-auto w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-emerald-500 font-bold border border-emerald-600/50 text-xs">
                GOI
              </div>
              <span className="text-white font-bold text-lg">Kisan-Vyapar e-Portal</span>
            </div>
            <p className="text-sm">National Agricultural Procurement & Trade System</p>
          </div>
          <div className="text-sm text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} Government of India. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link to="#" className="hover:text-emerald-400 transition">Privacy Policy</Link>
              <Link to="#" className="hover:text-emerald-400 transition">Terms of Service</Link>
              <Link to="/help" className="hover:text-emerald-400 transition">Help Center</Link>
              <Link to="/help" className="hover:text-emerald-400 transition">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
