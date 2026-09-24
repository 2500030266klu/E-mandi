import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Sun, CloudRain, CloudLightning, Loader2, MapPin } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const WeatherWidget = () => {
  const { language } = useSettings();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Default to New Delhi coordinates
    let lat = 28.6139;
    let lon = 77.2090;

    const fetchWeather = async (latitude, longitude) => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setWeatherData(data.current);
      } catch (err) {
        setError('Unable to load weather data');
      } finally {
        setLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation blocked or failed. Using default location.");
          fetchWeather(lat, lon);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(lat, lon);
    }
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" size={64} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-white drop-shadow-md" size={64} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-200 drop-shadow-md" size={64} />;
    if (code >= 71 && code <= 77) return <Cloud className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" size={64} />;
    if (code >= 80 && code <= 82) return <CloudRain className="text-blue-300 drop-shadow-md" size={64} />;
    if (code >= 95) return <CloudLightning className="text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]" size={64} />;
    return <Sun className="text-yellow-300" size={64} />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return language === 'hi' ? 'साफ़ आसमान' : 'Clear Sky';
    if (code >= 1 && code <= 3) return language === 'hi' ? 'आंशिक बादल' : 'Partly Cloudy';
    if (code >= 51 && code <= 67) return language === 'hi' ? 'बारिश' : 'Rain';
    if (code >= 95) return language === 'hi' ? 'तूफान' : 'Thunderstorm';
    return language === 'hi' ? 'मौसम' : 'Weather';
  };

  const widgetTitle = language === 'hi' ? 'कृषि मौसम' : 'Live Agri-Weather';
  const loadingText = language === 'hi' ? 'मौसम लोड हो रहा है...' : 'Loading Weather...';
  const humidityText = language === 'hi' ? 'नमी' : 'Humidity';
  const windText = language === 'hi' ? 'हवा' : 'Wind';

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className="animate-spin text-white/80 mb-3" size={40} />
        <p className="text-blue-100 font-medium tracking-wide">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-100 rounded-2xl shadow-md p-8 text-slate-500 border border-slate-200 text-center min-h-[220px] flex flex-col items-center justify-center">
        <Cloud className="mb-3 opacity-40" size={40} />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  const isDay = weatherData?.is_day === 1;
  const bgGradient = isDay 
    ? "from-sky-400 via-blue-500 to-indigo-600" 
    : "from-slate-800 via-indigo-900 to-slate-900";

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden transition-all duration-500`}>
      {/* Dynamic Background Effects */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl mix-blend-screen"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="font-bold text-white/90 flex items-center gap-2 text-sm uppercase tracking-widest">
          <MapPin size={16} className="text-white/70" /> {widgetTitle}
          <span className="relative flex h-2.5 w-2.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </h3>
      </div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-start tracking-tighter">
            <span className="text-6xl font-black">{Math.round(weatherData?.temperature_2m)}</span>
            <span className="text-3xl font-bold text-white/70 mt-1">°C</span>
          </div>
          <p className="text-lg text-white/90 mt-1 font-semibold capitalize tracking-wide">{getWeatherDescription(weatherData?.weather_code)}</p>
        </div>
        <div className="transform scale-110 drop-shadow-2xl">
          {getWeatherIcon(weatherData?.weather_code)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-3 backdrop-blur-md border border-white/10">
          <div className="bg-white/20 p-2 rounded-lg">
            <Droplets className="text-blue-100" size={18} />
          </div>
          <div>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">{humidityText}</p>
            <p className="font-bold text-base">{weatherData?.relative_humidity_2m}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-3 backdrop-blur-md border border-white/10">
          <div className="bg-white/20 p-2 rounded-lg">
            <Wind className="text-blue-100" size={18} />
          </div>
          <div>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">{windText}</p>
            <p className="font-bold text-base">{weatherData?.wind_speed_10m} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
