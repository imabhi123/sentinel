// import { useState } from 'react';
// import Logo from '../../assets/Logo.svg';
// import MissionArea from '../../assets/login/Mission Area.svg';
// import Line1 from '../../assets/login/line1.svg';
// import Line2 from '../../assets/login/line2.svg';

// export default function LoginLayout({ children }) {
//   const [expandedSection, setExpandedSection] = useState(0);

//   const sections = [
//     { title: 'WEATHER RADAR', detail: 'NOAA NEXRAD (88km Dataset)' },
//     { title: 'FLOOD/EARTHQUAKE', detail: 'USGS/Geological Data' },
//     { title: 'SATELLITES', detail: 'Deep-TM (Plex Orbit)' },
//     { title: 'LIVE FLIGHTS', detail: 'NOAA NEXRAD (Globe Overlay)' },
//     { title: 'MILITARY FLIGHTS', detail: 'NOAA NEXRAD (Globe Overlay)' },
//     { title: 'STREET TRAFFIC', detail: 'OpenStreetMap/Naver' },
//   ];

//   const toggleSection = (index) => {
//     setExpandedSection(expandedSection === index ? null : index);
//   };

//   return (
//     <div className="relative w-screen h-screen overflow-hidden bg-black">
//       {/* GRID OVERLAY */}
//       <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
//         <defs>
//           <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//             <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
//           </pattern>
//         </defs>
//         <rect width="100%" height="100%" fill="url(#grid)" />
//       </svg>

//       {/* TOP SCALE RULER */}
//       <div className="absolute top-0 left-0 right-0 h-6 bg-black/80 border-b border-green-500/50 flex items-center px-2 text-[10px] text-green-500 font-mono overflow-hidden backdrop-blur-sm z-20">
//         <div className="flex gap-4 whitespace-nowrap">
//           {[...Array(200)].map((_, i) => (
//             <div key={i} className="flex flex-col items-center">
//               <div className="h-1 w-px bg-green-500/80"></div>
//               {i % 10 === 0 && <span className="text-[8px]">{i}</span>}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* BOTTOM SCALE RULER */}
//       <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/80 border-t border-green-500/50 flex items-center px-2 text-[10px] text-green-500 font-mono overflow-hidden backdrop-blur-sm z-20">
//         <div className="flex gap-4 whitespace-nowrap">
//           {[...Array(200)].map((_, i) => (
//             <div key={i} className="flex flex-col items-center">
//               <div className="h-1 w-px bg-green-500/80"></div>
//               {i % 10 === 0 && <span className="text-[8px]">{i}</span>}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* LEFT SIDEBAR */}
//       <div className="absolute left-0 top-6 bottom-6 w-56 bg-black/30 border-r border-green-500/40 overflow-hidden backdrop-blur-md z-30">
//         {/* Topography map background - highly visible */}
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage: `url(${Line1})`,
//             backgroundRepeat: 'repeat-y',
//             backgroundSize: 'cover',
//             opacity: 0.35,
//           }}
//         />

//         {/* Grid pattern overlay */}
//         <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.08 }}>
//           <defs>
//             <pattern id="leftGrid" width="30" height="30" patternUnits="userSpaceOnUse">
//               <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#leftGrid)" />
//         </svg>

//         {/* Content */}
//         <div className="relative z-10 h-full flex flex-col">
//           {/* Logo Section */}
//           <div className="p-4 border-b border-green-500/30 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
//             <img src={Logo} alt="Logo" className="w-10 h-10" />
//             <div className="text-xs text-green-400 font-bold">SPATIAL</div>
//           </div>

//           {/* Metrics Section */}
//           <div className="p-3 border-b border-green-500/30 bg-black/50 backdrop-blur-sm">
//             <div className="space-y-2 text-xs font-mono">
//               <div className="flex justify-between">
//                 <span className="text-green-500">LATITUDE (C)</span>
//                 <span className="text-green-300">-10.883°</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-green-500">LONGITUDE (E)</span>
//                 <span className="text-green-300">328.219°</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-green-500">ALTITUDE</span>
//                 <span className="text-green-300">254.6 km</span>
//               </div>
//               <div className="flex justify-between text-[10px]">
//                 <span className="text-green-500">SATCOM I-87</span>
//               </div>
//               <div className="flex items-center gap-2 pt-1">
//                 <span className="text-yellow-400 text-[10px]">CONNECTED</span>
//                 <div className="flex gap-0.5">
//                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
//                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
//                   <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sections List */}
//           <div className="flex-1 overflow-y-auto">
//             {sections.map((section, index) => (
//               <div key={index} className="border-b border-green-500/20 bg-black/30 hover:bg-black/50 transition-colors">
//                 <button
//                   onClick={() => toggleSection(index)}
//                   className="w-full p-3 text-left cursor-pointer group"
//                 >
//                   <div className="flex items-center gap-2">
//                     <span className={`text-green-400 transition-transform text-xs ${expandedSection === index ? 'rotate-90' : ''}`}>
//                       ▶
//                     </span>
//                     <span className="text-xs font-mono text-green-400 group-hover:text-green-300">
//                       {section.title}
//                     </span>
//                   </div>
//                   {expandedSection === index && (
//                     <div className="mt-2 pl-6 text-xs text-green-500/80 font-mono">
//                       {section.detail}
//                     </div>
//                   )}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDEBAR - Mission Area */}
//       <div className="absolute right-0 top-6 bottom-6 w-64 bg-black/30 border-l border-green-500/40 overflow-hidden backdrop-blur-md z-30">
//         {/* Mission Area background - highly visible */}
//         <div
//           className="absolute inset-0"
//           style={{
//             backgroundImage: `url(${MissionArea})`,
//             backgroundRepeat: 'no-repeat',
//             backgroundSize: 'contain',
//             backgroundPosition: 'center',
//             opacity: 0.4,
//           }}
//         />

//         {/* Grid pattern overlay */}
//         <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.08 }}>
//           <defs>
//             <pattern id="rightGrid" width="30" height="30" patternUnits="userSpaceOnUse">
//               <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#rightGrid)" />
//         </svg>

//         {/* Mission Area Image - More visible */}
//         <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
//           <img 
//             src={MissionArea} 
//             alt="Mission Area" 
//             className="w-full h-full object-contain opacity-70"
//           />
//         </div>
//       </div>

//       {/* MAIN CONTENT AREA - Center */}
//       <div className="absolute inset-0 top-6 bottom-6 left-56 right-64 flex items-center justify-center">
//         {children}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import Logo from '../../assets/Logo.svg';
import MissionArea from '../../assets/login/Mission Area.svg';
import Line1 from '../../assets/login/line1.svg?url';
import Line2 from '../../assets/login/line2.svg?url';
import UIFrame from '../../assets/login/UI Frame.png';
import Topography from '../../assets/login/Topography.svg';
import Parameters from '../../assets/Parameters.png';
import Satcom from '../../assets/Satcom.png';
import MenusSide from '../../assets/Menus-side.png';

export default function LoginLayout({ children }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [signalTick, setSignalTick] = useState(0);

  const sections = [
    { title: 'WEATHER RADAR', detail: 'NOAA NEXRAD (Globe Overlay)' },
    { title: 'FLOOD/EARTHQUAKE', detail: 'USGS/Bhuvan ISRO/NDEM' },
    { title: 'SATELLITES', detail: 'CelesTrek/Bhuvan ISRO' },
    { title: 'LIVE FLIGHTS', detail: 'NOAA NEXRAD (Globe Overlay)' },
    { title: 'MILITARY FLIGHTS', detail: 'NOAA NEXRAD (Globe Overlay)' },
    { title: 'STREET TRAFFIC', detail: 'OpenStreetMap-never' },
  ];

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  // Animate signal wave
  useEffect(() => {
    const id = setInterval(() => setSignalTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  const signalPath = (() => {
    const pts = [];
    for (let x = 0; x <= 140; x += 3) {
      const y = 8 + Math.sin((x + signalTick * 4) * 0.18) * 5;
      pts.push(`${x},${y}`);
    }
    return 'M ' + pts.join(' L ');
  })();

  const rulerNums = Array.from({ length: 34 }, (_, i) => i + 1);
  const rulerLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="relative w-screen h-screen overflow-hidden font-mono">

      {/* ── UI FRAME BACKGROUND ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${UIFrame})`,
          backgroundSize: '100% 100%  ',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      {/* ── SATELLITE MAP BACKGROUND ── */}
      {/* Commented out to use the satelliteBackground from Login.jsx */}

      {/* ── GLOBAL GRID OVERLAY ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-1" style={{ opacity: 0.13 }}>
        <defs>
          <pattern id="mainGrid" width="38" height="38" patternUnits="userSpaceOnUse">
            <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#64c8ff" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mainGrid)" />
      </svg>

      {/* ── SCANLINES ── */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
        }}
      />

      {/* ── TOP LINE IMAGE ── */}
      <div
        className="absolute top-3 left-30 right-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url(${Line1})`,
          backgroundSize: 'cover',
          // backgroundRepeat: 'repeat-x',
          // backgroundPosition: 'top center',
          height: '16px',
          width: '90%',
          opacity: 0.9,
        }}
      />

      {/* ── BOTTOM LINE IMAGE ── */}
      <div
        className="absolute bottom-3 left-30 right-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url(${Line1})`,
          backgroundSize: 'cover',
          // backgroundRepeat: 'repeat-x',
          // backgroundPosition: 'bottom center',
          height: '16px',
          width: '90%',
          transform: 'scaleY(1)',
          opacity: 0.9,
        }}
      />
      {/* ── RIGHT LINE IMAGE ── */}
      <div
        className="absolute right-3 top-10 bottom-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url(${Line2})`,
          backgroundSize: 'cover',
          // backgroundRepeat: 'repeat-y',
          // backgroundPosition: 'right center',
          width: '14px',
          height: '90%',
          opacity: 0.9,
        }}
      />

      {/* ── LOGO TOP LEFT ── */}
      <div
        className="absolute top-4 left-4 pointer-events-none z-20"
        style={{
          width: '80px',
          height: '80px',
        }}
      >
        <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
      </div>

      {/* ── TOPOGRAPHY MAP LEFT SIDE ── */}
      <div
        className="absolute top-24 left-4 pointer-events-none z-20"
        style={{
          width: '90px',
          top: '50px',
          left: '140px',
        }}
      >
        <img src={Topography} alt="Topography" className="w-full h-auto object-contain" />
      </div>

         {/* ── PArameters MAP LEFT SIDE ── */}
      <div
        className="absolute top-24 left-4 pointer-events-none z-20"
        style={{
          width: '60px',
          height: '60px',
          top: '120px',
          left: '35px',
        }}
      >
        <img src={Parameters} alt="Topography" className="w-full h-auto object-contain" />
      </div>
         {/* ── Satcom  LEFT SIDE ── */}
      <div
        className="absolute top-24 left-4 pointer-events-none z-20"
        style={{
          width: '200px',
          height: '60px',
          top: '220px',
          left: '35px',
        }}
      >
        <img src={Satcom} alt="Satcom" className="w-full h-auto object-contain" />
      </div>

           {/* ── MenusSide  LEFT SIDE ── */}
      <div
        className="absolute top-24 left-4 pointer-events-none z-20"
        style={{
          width: '185px',
          height: '60px',
          top: '280px',
          left: '35px',
        }}
      >
        <img src={MenusSide} alt="MenusSide" className="w-auto h-auto object-contain" />
      </div>
      

      

      {/* ── RIGHT PANEL — Mission Area / Tactical ── */}
      <div
        className="absolute top-6 bottom-6 z-30 overflow-hidden"
        // style={{
        //   right: 24,
        //   width: 265,
        //   background: 'rgba(8,12,8,0.52)',
        //   border: '1px solid rgba(60,100,60,0.32)',
        //   backdropFilter: 'blur(0px)',
        // }}
      >
        {/* inner grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.07 }}>
          <defs>
            <pattern id="rightGrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#22c55e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rightGrid)" />
        </svg>

        {/* Tactical overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Dashed threat zone */}
          <div
            className="absolute"
            style={{
              top: '28%', left: '16%', width: '66%', height: '42%',
              border: '1.5px dashed rgba(255,255,255,0.42)',
            }}
          >
            {/* Corner diamonds */}
            {[[0,0],[100,0],[0,100],[100,100]].map(([x,y], i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white"
                style={{ left:`${x}%`, top:`${y}%`, transform:'translate(-50%,-50%) rotate(45deg)' }}
              />
            ))}

            {/* Percentage labels */}
            {[
              { text:'54%', x:'28%',  y:'-14px', color:'#ffcc00' },
              { text:'70%', x:'-30px',y:'32%',   color:'#ffcc00' },
              { text:'92%', x:'28%',  y:'44%',   color:'#ffcc00' },
              { text:'96%', x:'62%',  y:'44%',   color:'#ff4400' },
              { text:'84%', x:'92%',  y:'68%',   color:'#ff2200' },
              { text:'54%', x:'108%', y:'40%',   color:'#ffcc00' },
            ].map((m, i) => (
              <span
                key={i}
                className="absolute font-bold"
                style={{ left:m.x, top:m.y, color:m.color, fontSize:9, fontFamily:'monospace' }}
              >
                {m.text}
              </span>
            ))}

            {/* Hex threat markers */}
            {[
              { x:'8%',  y:'38%', c:'#cc2200' },
              { x:'45%', y:'38%', c:'#cc2200' },
              { x:'25%', y:'14%', c:'#ff4400' },
              { x:'72%', y:'28%', c:'#cc2200' },
              { x:'86%', y:'56%', c:'#cc2200' },
            ].map((m, i) => (
              <svg
                key={i}
                width="13" height="13"
                className="absolute"
                style={{ left:m.x, top:m.y, transform:'translate(-50%,-50%)' }}
              >
                <polygon
                  points="6.5,1 12,3.5 12,9.5 6.5,12 1,9.5 1,3.5"
                  fill={m.c} stroke="rgba(255,120,60,0.65)" strokeWidth="0.8"
                />
              </svg>
            ))}
          </div>

          {/* Navigation arrows */}
          {[
            { bottom:'32%', left:'10%' },
            { bottom:'25%', left:'13%' },
            { bottom:'18%', left:'16%' },
          ].map((s, i) => (
            <div key={i} className="absolute text-white/55" style={{ bottom:s.bottom, left:s.left, fontSize:11 }}>
              ▽
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTER — login modal via children ── */}
      <div
        className="absolute top-6 bottom-6 flex items-center justify-center z-40"
        style={{ left: '50%', transform: 'translateX(-50%)', width: 'auto' }}
      >
        {children}
      </div>

      {/* ── MISSION AREA IMAGE ── */}
      <div
        className="absolute z-50"
        style={{
          width: '384.88px',
          height: '347.42px',
          top: '360px',
          left: '1231px',
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        <img 
          src={MissionArea} 
          alt="Mission Area" 
          className="w-full h-full object-contain" 
          style={{ opacity: 1 }}
        />
      </div>
    </div>
  );
}
