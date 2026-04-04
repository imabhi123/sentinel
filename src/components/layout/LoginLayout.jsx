import { useState } from 'react';
import Logo from '../../assets/Logo.svg';
import MissionArea from '../../assets/login/Mission Area.svg';
import Line1 from '../../assets/login/line1.svg';
import Line2 from '../../assets/login/line2.svg';

export default function LoginLayout({ children }) {
  const [expandedSection, setExpandedSection] = useState(0);

  const sections = [
    { title: 'WEATHER RADAR', detail: 'NOAA NEXRAD (88km Dataset)' },
    { title: 'FLOOD/EARTHQUAKE', detail: 'USGS/Geological Data' },
    { title: 'SATELLITES', detail: 'Deep-TM (Plex Orbit)' },
    { title: 'LIVE FLIGHTS', detail: 'NOAA NEXRAD (Globe Overlay)' },
    { title: 'MILITARY FLIGHTS', detail: 'NOAA NEXRAD (Globe Overlay)' },
    { title: 'STREET TRAFFIC', detail: 'OpenStreetMap/Naver' },
  ];

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* GRID OVERLAY */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* TOP SCALE RULER */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-black/80 border-b border-green-500/50 flex items-center px-2 text-[10px] text-green-500 font-mono overflow-hidden backdrop-blur-sm z-20">
        <div className="flex gap-4 whitespace-nowrap">
          {[...Array(200)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-1 w-px bg-green-500/80"></div>
              {i % 10 === 0 && <span className="text-[8px]">{i}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SCALE RULER */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/80 border-t border-green-500/50 flex items-center px-2 text-[10px] text-green-500 font-mono overflow-hidden backdrop-blur-sm z-20">
        <div className="flex gap-4 whitespace-nowrap">
          {[...Array(200)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-1 w-px bg-green-500/80"></div>
              {i % 10 === 0 && <span className="text-[8px]">{i}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* LEFT SIDEBAR */}
      <div className="absolute left-0 top-6 bottom-6 w-56 bg-black/30 border-r border-green-500/40 overflow-hidden backdrop-blur-md z-30">
        {/* Topography map background - highly visible */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${Line1})`,
            backgroundRepeat: 'repeat-y',
            backgroundSize: 'cover',
            opacity: 0.35,
          }}
        />

        {/* Grid pattern overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.08 }}>
          <defs>
            <pattern id="leftGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leftGrid)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-4 border-b border-green-500/30 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
            <img src={Logo} alt="Logo" className="w-10 h-10" />
            <div className="text-xs text-green-400 font-bold">SPATIAL</div>
          </div>

          {/* Metrics Section */}
          <div className="p-3 border-b border-green-500/30 bg-black/50 backdrop-blur-sm">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-green-500">LATITUDE (C)</span>
                <span className="text-green-300">-10.883°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500">LONGITUDE (E)</span>
                <span className="text-green-300">328.219°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500">ALTITUDE</span>
                <span className="text-green-300">254.6 km</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-green-500">SATCOM I-87</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-yellow-400 text-[10px]">CONNECTED</span>
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto">
            {sections.map((section, index) => (
              <div key={index} className="border-b border-green-500/20 bg-black/30 hover:bg-black/50 transition-colors">
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full p-3 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-green-400 transition-transform text-xs ${expandedSection === index ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <span className="text-xs font-mono text-green-400 group-hover:text-green-300">
                      {section.title}
                    </span>
                  </div>
                  {expandedSection === index && (
                    <div className="mt-2 pl-6 text-xs text-green-500/80 font-mono">
                      {section.detail}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - Mission Area */}
      <div className="absolute right-0 top-6 bottom-6 w-64 bg-black/30 border-l border-green-500/40 overflow-hidden backdrop-blur-md z-30">
        {/* Mission Area background - highly visible */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${MissionArea})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />

        {/* Grid pattern overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.08 }}>
          <defs>
            <pattern id="rightGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rightGrid)" />
        </svg>

        {/* Mission Area Image - More visible */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
          <img 
            src={MissionArea} 
            alt="Mission Area" 
            className="w-full h-full object-contain opacity-70"
          />
        </div>
      </div>

      {/* MAIN CONTENT AREA - Center */}
      <div className="absolute inset-0 top-6 bottom-6 left-56 right-64 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
