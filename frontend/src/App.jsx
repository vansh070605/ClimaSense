import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  CloudRain, Thermometer, Wind, AlertTriangle, TrendingUp, TrendingDown,
  MapPin, ChevronRight, Info, Globe, Menu, X, Search,
  Database, Cpu, Radio, Layers, Cloud, Sun, Droplets, ArrowRight,
  Satellite, Navigation, Shield, Loader2, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
import { QRCodeSVG } from 'qrcode.react';
import predictions from './data/predictions.json';

// Simulated Real-Time Data Hook
const useSimulation = (initialValue, isActive = true, jitterFactor = 0.5) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue); // Sync when initialValue changes (city/year switch)
  }, [initialValue]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * jitterFactor;
      setValue(prev => {
        const num = typeof prev === 'string' ? parseFloat(prev) : prev;
        return num + jitter;
      });
    }, 800); // Faster updates for "lively" feel
    return () => clearInterval(interval);
  }, [isActive, jitterFactor]);

  return typeof value === 'number' ? value.toFixed(1) : value;
};

// --- Assets and Data ---
const cities = Object.keys(predictions);

const CITY_COORDS = {
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.6139, 77.2090],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Hyderabad: [17.3850, 78.4867],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Bhopal: [23.2599, 77.4126]
};

// --- Components ---

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl">
        <p className="text-slate-500 text-[10px] uppercase font-display mb-1">{label}</p>
        <p className="text-primary font-bold text-lg">{payload[0].value.toFixed(1)}%</p>
        <p className="text-[10px] text-slate-400">Stress Integrity Index</p>
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, unit, icon: Icon, color, trend, description, isSimulating }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${isSimulating ? 'ring-2 ring-primary/20' : ''}`}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125`} />
    <div className="flex justify-between items-start mb-6">
      <div className={`p-2.5 rounded-xl bg-${color === 'primary' ? 'sky-50' : color === 'secondary' ? 'rose-50' : 'emerald-50'} text-${color} border border-${color === 'primary' ? 'sky-100' : color === 'secondary' ? 'rose-100' : 'emerald-100'}`}>
        <Icon size={22} />
      </div>
      <div className={`flex items-center gap-1 font-display text-[10px] uppercase tracking-wider font-bold ${trend === 'up' ? 'text-secondary' : 'text-accent'}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {trend === 'up' ? 'Rising' : 'Stabilizing'}
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      {isSimulating ? (
        <motion.span
          animate={{ scale: [1, 1.02, 1], color: ['#0f172a', '#0ea5e9', '#0f172a'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-4xl font-display font-bold tracking-tight"
        >
          {value}
        </motion.span>
      ) : (
        <span className="text-4xl font-display font-bold text-slate-900 tracking-tight">{value}</span>
      )}
      <span className="text-slate-400 text-sm font-medium">{unit}</span>
    </div>
    {isSimulating && (
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className={`h-full bg-${color}`}
          />
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest text-${color} animate-pulse`}>Computing...</span>
      </div>
    )}
    {!isSimulating && (
      <p className="text-[11px] text-slate-400 mt-4 leading-relaxed line-clamp-2">
        {description}
      </p>
    )}
  </motion.div>
);

const AnomalyHUDCard = ({ item, i }) => {
  const simValue = useSimulation(item.initial, true);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
      className="glass-panel p-5 rounded-2xl flex items-center justify-between border border-white/50 shadow-lg pointer-events-auto"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 bg-${item.color}-500/10 text-${item.color}-500 rounded-lg`}>
          <item.icon size={18} />
        </div>
        <div className="text-left">
          <p className="text-[9px] font-bold text-slate-400 uppercase">{item.label}</p>
          <p className="text-sm font-black text-slate-900 leading-none mt-1">{simValue}{item.suffix}</p>
        </div>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    </motion.div>
  );
};

// --- Content Sections ---

const ForecastView = ({ selectedCity, activeYear, setActiveYear, cityData, liveData, lastUpdated }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const currentData = cityData[activeYear] || cityData['2026'];
  const prevData = cityData[(parseInt(activeYear) - 1).toString()] || currentData;

  const trajData = useMemo(() => [
    { name: '2024', score: cityData['2024'].score },
    { name: '2025', score: cityData['2025'].score },
    { name: '2026', score: cityData['2026'].score },
    { name: '2027', score: cityData['2027'].score },
    { name: '2028', score: cityData['2028'].score },
  ], [cityData]);

  const currentTemp = useSimulation(
    liveData?.measurements[selectedCity]?.temp || 28.5,
    isSimulating,
    0.01
  );
  const currentAQI = useSimulation(
    liveData?.measurements[selectedCity]?.aqi || 124,
    isSimulating,
    0.05
  );
  const currentHumidity = useSimulation(
    liveData?.measurements[selectedCity]?.humidity || 45,
    isSimulating,
    0.01
  );

  return (
    <div className="space-y-8 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em] mb-2">Confidence Model: DELTA-7</p>
          <h2 className="text-4xl font-display font-black text-slate-900 flex items-center gap-3">
            {activeYear} Prediction Hub
            {isSimulating && <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full animate-pulse border border-primary/20 uppercase tracking-widest">Simulating...</span>}
          </h2>
        </div>
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-8 py-3.5 rounded-2xl flex items-center gap-3 transition-all font-bold text-xs uppercase tracking-widest shadow-2xl pointer-events-auto ${isSimulating ? 'bg-secondary text-white shadow-secondary/20' : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'}`}
        >
          {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {isSimulating ? 'Active Simulation' : 'Run Scenario Simulation'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={Sun}
          title="Heat Exhaustion Index"
          value={currentTemp}
          unit="%"
          color="secondary"
          trend={currentData.heat > prevData.heat ? 'up' : 'down'}
          description="Anthropogenic heat islands and ambient thermal volatility projection."
          isSimulating={isSimulating}
        />
        <MetricCard
          icon={Wind}
          title="Ambient Air Quality"
          value={currentAQI}
          unit="%"
          color="primary"
          trend={currentData.pollution > prevData.pollution ? 'up' : 'down'}
          description="Atmospheric aerosol density and particulate concentration forecast."
          isSimulating={isSimulating}
        />
        <MetricCard
          icon={Droplets}
          title="Hydraulic Resilience"
          value={currentHumidity}
          unit="%"
          color="accent"
          trend={currentData.rainfall > prevData.rainfall ? 'up' : 'down'}
          description="Precipitation periodicity and localized hydro-system variance."
          isSimulating={isSimulating}
        />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
        {isSimulating && (
          <div className="absolute bottom-4 right-8 z-30 flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
            <p className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Neural Stream Sync Active</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">5-Year Pulse Trajectory</h2>
            <p className="text-sm text-slate-400 mt-1">Aggregated Climate Stress: 2024 Actual — 2028 Predictive Forecast</p>
          </div>
          <div className="flex gap-2">
            {['2024', '2025', '2026', '2027', '2028'].map(y => (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${y === activeYear ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                {y === '2024' || y === '2025' ? `${y} ACTUAL` : `${y} PROJ`}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full min-w-[0px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={trajData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600 }}
                dy={15}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600 }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#0EA5E9"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorScore)"
                animationDuration={2500}
                dot={{ r: 4, fill: '#fff', stroke: '#0EA5E9', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SatelliteView = ({ city, selectedCity, liveData }) => {
  const center = CITY_COORDS[city];

  return (
    <div className="h-[750px] w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl relative group bg-slate-900">
      <MapContainer
        center={center}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom={false}
        className="h-full w-full z-10"
      >
        <ChangeView center={center} />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          maxZoom={19}
        />
        <Marker position={center} icon={L.divIcon({
          className: 'custom-div-icon',
          html: `
                <div class="relative flex items-center justify-center w-12 h-12">
                    <div class="absolute inset-0 bg-primary/40 rounded-full animate-ping-slow"></div>
                    <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div class="w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg z-20"></div>
                </div>
            `,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        })}>
        </Marker>
      </MapContainer>

      {/* HUD OVERLAY - Immersive Layer */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {/* Scanning Beam */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-sm animate-scan" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 opacity-50" />

        {/* Corner HUD Brackets */}
        <div className="absolute top-10 left-10 w-24 h-24 border-t-4 border-l-4 border-primary/40 rounded-tl-3xl" />
        <div className="absolute top-10 right-10 w-24 h-24 border-t-4 border-r-4 border-primary/40 rounded-tr-3xl" />
        <div className="absolute bottom-10 left-10 w-24 h-24 border-b-4 border-l-4 border-primary/40 rounded-bl-3xl" />
        <div className="absolute bottom-10 right-10 w-24 h-24 border-b-4 border-r-4 border-primary/40 rounded-br-3xl" />

        {/* HUD Content Area */}
        <div className="h-full p-12 flex flex-col justify-between">
          {/* Top Row: Core Telemetry */}
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="glass-panel p-6 rounded-3xl shadow-2xl border border-white/50 pointer-events-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-xl text-primary animate-pulse">
                  <Satellite size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Orbital Link</p>
                  <p className="text-xs font-bold text-slate-900 tracking-tight">NODS-V4.2 // STRATOS-B</p>
                </div>
              </div>
              <div className="space-y-2">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em] mb-1">Target Coordinates</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-end gap-12">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Latitude</span>
                        <span className="text-xl font-display font-black text-slate-900">{center[0].toFixed(6)}°N</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Longitude</span>
                        <span className="text-xl font-display font-black text-slate-900">{center[1].toFixed(6)}°E</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end gap-12">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Latitude</span>
                  <span className="text-xl font-display font-black text-slate-900">{center[0].toFixed(6)}°N</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Longitude</span>
                  <span className="text-xl font-display font-black text-slate-900">{center[1].toFixed(6)}°E</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
                <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LINK ACTIVE
                </div>
                <div className="text-[10px] font-bold text-slate-300">|</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Signal: 94%</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col gap-4 pointer-events-auto"
            >
              <div className="glass-panel p-4 px-6 rounded-2xl flex items-center gap-6 shadow-xl">
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Atmospheric Fidelity</p>
                  <div className="flex gap-1.5 h-4 items-end">
                    {[1, 1, 1, 1, 1, 1, 0.5, 0.2].map((v, i) => (
                      <div key={i} className="w-1 rounded-full bg-primary" style={{ height: `${v * 100}%` }} />
                    ))}
                  </div>
                </div>
                <div className="p-2 bg-sky-50 rounded-xl text-primary">
                  <Cloud size={18} />
                </div>
              </div>

              <div className="glass-panel p-4 px-6 rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Node Resolution</p>
                  <p className="text-xs font-bold text-slate-900">4K SPECTRAL</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-900/5 flex items-center justify-center text-slate-400">
                  <Cpu size={14} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: Scan Meta */}
          <div className="flex justify-between items-end">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel p-6 rounded-3xl shadow-2xl pointer-events-auto max-w-xs"
            >
              <div className="flex items-center gap-3 mb-3 text-secondary">
                <AlertTriangle size={18} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Terrain Integrity Alert</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Regional humidity anomalies detected at node surface. Calibrating thermal variance markers.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel p-2 pl-8 rounded-full shadow-2xl pointer-events-auto flex items-center gap-6 border-2 border-primary/20"
            >
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-400">Calibration Profile</p>
                <p className="text-sm font-black text-primary tracking-tight">HIGH-FIDELITY ACTIVE</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-primary/20 relative group overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                <Navigation size={22} className="group-hover:scale-110 transition-transform" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Structure ---

export default function App() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [activeTab, setActiveTab] = useState('FORECAST');
  const [activeYear, setActiveYear] = useState('2026');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileConnectOpen, setIsMobileConnectOpen] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Syncing...');

  // Fetch live data periodically
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const response = await fetch('/src/data/live_data.json');
        if (response.ok) {
          const data = await response.json();
          setLiveData(data);

          // Calculate relative time
          const updateTime = new Date(data.last_updated);
          const now = new Date();
          const diffMins = Math.floor((now - updateTime) / 60000);
          setLastUpdated(diffMins <= 0 ? 'Just now' : `${diffMins}m ago`);
        }
      } catch (err) {
        console.log("Live source unavailable, using simulation.");
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const cityData = predictions[selectedCity];

  const handleGenerateReport = () => {
    const reportContent = `CLIMASENSE INTELLIGENCE REPORT
=================================
Generated: ${new Date().toLocaleString()}
Node: ${selectedCity.toUpperCase()}
Status: Pristine Climate Protocol Active

--- PREDICTIVE FORECAST (${activeYear}) ---
Risk Level: ${cityData[activeYear]?.risk || 'N/A'}
Trend: ${cityData[activeYear]?.trend || 'N/A'}
Overall Stress Score: ${cityData[activeYear]?.score?.toFixed(2) || 'N/A'}

--- 5-YEAR TRAJECTORY ---
${['2024', '2025', '2026', '2027', '2028'].map(y => `${y}: ${cityData[y]?.score?.toFixed(2)}`).join('\n')}

--- LIVE SENSOR TELEMETRY ---
Temp: ${liveData?.measurements?.[selectedCity]?.temp || 28.5}°C
AQI: ${liveData?.measurements?.[selectedCity]?.aqi || 124}
Humidity: ${liveData?.measurements?.[selectedCity]?.humidity || 45}%
Wind Speed: ${liveData?.measurements?.[selectedCity]?.wind_speed || 12} km/h

[End of Report]`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ClimaSense_Report_${selectedCity}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans select-none text-slate-900 overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-primary px-6 py-2 flex justify-center items-center gap-3">
        <Shield size={14} className="text-white" />
        <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Pristine Climate Protocol Active • Global Sensor Array Synced</span>
      </div>

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <Cloud size={24} />
            </div>
            <div>
              <span className="block font-display font-extrabold text-xl leading-none text-slate-900 tracking-tight">CLIMASENSE</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase opacity-70">Intelligence Platform</span>
                {liveData && (
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                      LIVE: MOEFCC GATEWAY
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Updated {lastUpdated}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[11px] font-display uppercase tracking-widest font-bold text-slate-400">
            {['FORECAST', 'SATELLITE', 'ANOMALIES'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-all relative py-2 ${activeTab === tab ? 'text-primary' : 'hover:text-slate-600'}`}
              >
                {tab}
                {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileConnectOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">
              <Radio size={14} className="text-emerald-500" />
              Connect Mobile
            </button>
            <button
              onClick={handleGenerateReport}
              className="hidden sm:inline-flex px-6 py-2.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-slate-900/10">
              Generate Report
            </button>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500">
              <Menu size={26} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Connect Modal */}
      <AnimatePresence>
        {isMobileConnectOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsMobileConnectOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-3xl shadow-2xl relative z-10 max-w-sm w-full border border-slate-100 flex flex-col items-center text-center"
            >
              <button
                onClick={() => setIsMobileConnectOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Radio size={32} />
              </div>

              <h3 className="text-xl font-display font-black text-slate-900 mb-2">Connect Mobile Device</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">
                Scan this QR code with your phone's camera to access the ClimaSense Intelligence Hub on the go.
              </p>

              <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100 mb-6 group inline-block relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                <QRCodeSVG
                  value={`http://${import.meta.env.VITE_LOCAL_IP}:5176`}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#0f172a"}
                  level={"Q"}
                  includeMargin={false}
                />
              </div>

              <div className="bg-emerald-50 w-full p-4 rounded-2xl border border-emerald-100 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Network Active</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">http://{import.meta.env.VITE_LOCAL_IP}:5176</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-[60] w-72 bg-white/90 backdrop-blur-2xl border-r border-slate-100 transition-transform duration-500 lg:relative lg:translate-x-0 lg:z-0
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Spatial Nodes</h2>
              {isSidebarOpen && <X onClick={() => setSidebarOpen(false)} size={20} className="text-slate-400 lg:hidden cursor-pointer" />}
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => { setSelectedCity(city); setSidebarOpen(false); }}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 group flex items-center justify-between
                    ${selectedCity === city
                      ? 'bg-primary/5 text-primary border border-primary/10 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <span className="text-[13px] font-bold tracking-tight">{city}</span>
                  <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedCity === city ? 'bg-primary scale-125' : 'bg-slate-200 group-hover:bg-slate-400'}`} />
                </button>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Update</p>
              <p className="text-xs font-bold text-slate-900">MAR 26, 2026/13:54</p>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
          {/* Header Area */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
            <motion.div key={selectedCity} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">Operational Node: {selectedCity.toUpperCase()}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tighter mb-4">
                {selectedCity} <span className="text-slate-300 font-light italic">Intelligence</span>
              </h1>
              <p className="text-slate-400 max-w-xl text-sm leading-relaxed font-medium">
                Automated climate analysis protocol reveals a <span className="text-secondary font-bold underline underline-offset-4 decoration-rose-200">{cityData[activeYear].trend}</span> pattern.
                Synthesizing raw telemetry across a rolling 5-year spatial window.
              </p>
            </motion.div>


          </div>

          {/* Dynamic Sections */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'FORECAST' && <ForecastView selectedCity={selectedCity} activeYear={activeYear} setActiveYear={setActiveYear} cityData={cityData} liveData={liveData} lastUpdated={lastUpdated} />}
              {activeTab === 'SATELLITE' && <SatelliteView city={selectedCity} selectedCity={selectedCity} liveData={liveData} />}
              {activeTab === 'ANOMALIES' && (
                <div className="relative bg-white rounded-[3rem] border border-slate-100 shadow-2xl min-h-[700px] overflow-hidden">
                  {/* Digital Grid Background */}
                  <div className="absolute inset-0 digital-grid opacity-[0.4] animate-grid pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-50/50 via-transparent to-rose-50/30 pointer-events-none" />

                  <div className="relative z-10 p-12 h-full flex flex-col xl:flex-row gap-12">
                    {/* Left Side: Analysis HUD */}
                    <div className="flex-1 space-y-10">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-secondary/10 rounded-xl text-secondary animate-pulse">
                            <AlertTriangle size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.3em]">Detection Protocol v9.4</p>
                            <p className="text-xl font-display font-black text-slate-900 tracking-tight">Spatial Anomaly Log</p>
                          </div>
                        </div>
                        <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
                          Real-time decoding of multi-modal environmental deviations for <span className="text-primary font-bold italic">{selectedCity}</span>. Multi-variate analysis active across all spectrums.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: 'Thermal Variance', key: 'term', initial: 4.2, suffix: '°C', icon: Thermometer, color: 'rose' },
                          { label: 'Pressure Pulse', key: 'pres', initial: 1012, suffix: ' hPa', icon: Cpu, color: 'sky' },
                          { label: 'Spectral Density', key: 'spec', initial: 88.4, suffix: '%', icon: Radio, color: 'emerald' },
                          { label: 'Flow Vector', key: 'flow', initial: 0.82, suffix: '', icon: Navigation, color: 'indigo' }
                        ].map((item, i) => (
                          <AnomalyHUDCard key={item.key} item={item} i={i} />
                        ))}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Live Stream Decrypt</h3>
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.2 }}
                              className="p-5 rounded-3xl bg-slate-900 text-white font-mono text-[10px] space-y-2 border-l-4 border-primary shadow-2xl"
                            >
                              <div className="flex justify-between items-center opacity-50">
                                <span>SIGNAL_DECRYPT_NOD_0{i}</span>
                                <span className="animate-pulse">DECODING...</span>
                              </div>
                              <div className="flex gap-2 text-primary overflow-hidden whitespace-nowrap">
                                {Array(10).fill('01101100101').join(' ')}
                              </div>
                              <p className="text-slate-400">Analysis: Regional delta in tropospheric moisture detected at coordinates [19.07, 72.87]. Recalibrating spatial grid...</p>
                            </motion.div>
                          ))}
                        </div>

                        <div className="mt-6 p-6 rounded-3xl bg-secondary/5 border border-secondary/10">
                          <div className="flex items-center gap-2 mb-4">
                            <Cpu size={14} className="text-secondary" />
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">AI Inference Probe</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-4 font-medium leading-relaxed">
                            Execute neural classification using the <span className="text-secondary font-bold">aqi_classifier.pkl</span> local engine.
                          </p>
                          <button
                            onClick={async () => {
                              try {
                                const cityMetrics = liveData?.measurements[selectedCity] || {};
                                const res = await fetch('http://localhost:8001/predict', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    temp: cityMetrics.temp || 28.5,
                                    humidity: cityMetrics.humidity || 45,
                                    wind: cityMetrics.wind_speed || 12,
                                    rainfall: cityMetrics.rainfall || 0,
                                    pressure: cityMetrics.pressure || 1012,
                                    cloud: cityMetrics.cloud_cover || 20
                                  })
                                });
                                const data = await res.json();
                                if (data.detail) throw new Error(data.detail);
                                alert(`AI Inference Result: ${data.aqi_category} (Index ${data.aqi_level})`);
                              } catch (e) {
                                alert(`Inference failed: ${e.message}. Ensure FastAPI is running on port 8001.`);
                              }
                            }}
                            className="w-full py-2.5 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-transform"
                          >
                            Run Quantum Inference
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Spectrum Analysis */}
                    <div className="w-full xl:w-[450px] flex flex-col gap-8">
                      <div className="glass-panel p-8 rounded-[2.5rem] shadow-2xl h-full border border-white flex flex-col items-center justify-center">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Anomaly Spectrum Analysis</h3>
                        <div className="h-[300px] w-full min-w-[0px]">
                          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                              { subject: 'Temp', A: 120, fullMark: 150 },
                              { subject: 'Press', A: 98, fullMark: 150 },
                              { subject: 'Moist', A: 86, fullMark: 150 },
                              { subject: 'Rad', A: 99, fullMark: 150 },
                              { subject: 'CO2', A: 85, fullMark: 150 },
                            ]}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                              <Radar name="Anomaly" dataKey="A" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.4} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 w-full">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Signature Profile</p>
                          <p className="text-xs font-bold text-slate-900 leading-relaxed italic">
                            "A balanced signature with high Temp-to-Rad ratio. Indicates possible localized thermal convection at Node {selectedCity.slice(0, 3).toUpperCase()}."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Info & GLOBAL SENSOR TICKER */}
          <div className="mt-12 group">
            <div className="bg-slate-900 py-4 px-12 rounded-t-[2rem] overflow-hidden relative group border-x border-t border-slate-800">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10" />
              <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Node_0{i}:</span>
                    <span className={`text-[10px] font-bold ${i % 3 === 0 ? 'text-rose-400' : 'text-emerald-400'} uppercase`}>
                      {i % 3 === 0 ? 'Variance Detected' : 'Operational Status: Nominal'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-600">//</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Latency: {12 + i}ms</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-4" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 rounded-b-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary/10 flex items-center justify-center text-primary animate-spin-slow">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Integrity</h4>
                  <p className="text-xs font-bold text-slate-900 leading-none mt-1">Stochastic Pulse Integration v4.2</p>
                </div>
              </div>
              <div className="flex gap-8 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                <button className="hover:text-primary transition-colors">Documentation</button>
                <button className="hover:text-primary transition-colors">API Access</button>
                <button className="hover:text-primary transition-colors">Research</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
