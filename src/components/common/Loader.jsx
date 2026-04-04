// import '@fontsource/chakra-petch';
// import sentinelLogo from '../../assets/login/sentinelogo.svg';

// export default function Loader() {
//   const sources = [
//     'OPENSKY · FIRMS · KIWISDR · MARITIME',
//     'FRED · BLS · EIA · TREASURY · GSCPI',
//     'TELEGRAM · SAFECAST · EPA · WHO · OFAC',
//     'GDELT · NOAA · PATENTS · BLUESKY · REDDIT',
//   ];

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center z-50 overflow-auto"
//       style={{
//         background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(5,10,20,0.95) 100%)',
//         backgroundImage: `
//           linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(5,10,20,0.95) 100%),
//           repeating-linear-gradient(0deg, rgba(34, 197, 94, 0.15) 0px, rgba(34, 197, 94, 0.15) 1px, transparent 1px, transparent 40px),
//           repeating-linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0px, rgba(34, 197, 94, 0.15) 1px, transparent 1px, transparent 40px)
//         `,
//       }}
//     >
//       {/* Main content container */}
//       <div className="relative flex flex-col items-center justify-center p-8 max-w-3xl w-full">
//         {/* Logo with spinning rings */}
//         <div className="relative w-72 h-72 flex items-center justify-center mb-8 shrink-0">
//           {/* Animated dashed ring (green) */}
//           <svg
//             width="280"
//             height="280"
//             viewBox="0 0 280 280"
//             className="absolute animate-spin-slow"
//           >
//             <circle
//               cx="140"
//               cy="140"
//               r="130"
//               fill="none"
//               stroke="rgba(34, 197, 94, 0.8)"
//               strokeWidth="2"
//               strokeDasharray="12,8"
//               strokeLinecap="round"
//             />
//           </svg>

//           {/* Sentinel Logo in center */}
//           <img
//             src={sentinelLogo}
//             alt="Sentinel"
//             className="w-28 h-28 z-10"
//           />
//         </div>

//         {/* SENTINEL text */}
//         <h2 className="font-chakra text-4xl font-light text-white mb-8 tracking-wider text-center">
//           SENTINEL
//         </h2>

//         {/* Main title */}
//         <h1 className="font-chakra text-sm font-normal text-gray-300 mb-8 text-center w-full">
//           INITIALIZING SPATIALGRID SENTINEL ENGINE V1
//         </h1>

//         {/* Status content */}
//         <div className="w-full max-w-2xl text-gray-400 text-sm font-mono tracking-widest leading-loose text-left">
//           {/* Connecting sources section */}
//           <p className="mb-3 text-gray-300 font-normal">
//             CONNECTING 31 OSINT SOURCES...
//           </p>

//           {/* Source list */}
//           {sources.map((source, idx) => (
//             <div key={idx} className="my-1 text-gray-400">
//               <span className="text-gray-500 mr-2">
//                 {idx === sources.length - 1 ? '└' : '—'}
//               </span>
//               {source}
//             </div>
//           ))}

//           {/* Sweep complete section */}
//           <p className="mt-6 mb-3 text-gray-300 font-normal">
//             SWEEP COMPLETE – <span className="text-white font-semibold">30</span>
//             /31 SOURCES <span className="text-green-500 font-semibold">OK</span>
//           </p>

//           {/* Status lines */}
//           <p className="my-2 text-gray-400">
//             <span className="text-gray-500 mr-2">—</span> ACLED CONFLICT LAYER:{' '}
//             <span className="text-amber-500 font-semibold">DEGRADED</span>
//           </p>
//           <p className="my-2 text-gray-400">
//             <span className="text-gray-500 mr-2">—</span> DATA CORRIDORS: ACTIVE ·
//             DUAL PROJECTION:{' '}
//             <span className="text-white font-semibold">READY</span>
//           </p>
//           <p className="my-2 mb-8 text-gray-400">
//             <span className="text-gray-500 mr-2">—</span> INTELLIGENCE SYNTHESIS:{' '}
//             <span className="text-white font-semibold">ACTIVE</span>
//           </p>

//           {/* Terminal active */}
//           <p className="mt-8 text-green-500 font-semibold tracking-widest text-center text-base animate-pulse">
//             TERMINAL ACTIVE
//           </p>
//         </div>
//       </div>

//       {/* Global animations */}
//       <style>{`
//         @keyframes spinClockwise {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         .animate-spin-slow {
//           animation: spinClockwise 6s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import animateLogo from '../../assets/animateLogo.png';
import vector from '../../assets/vector.svg';
import LogoName from '../../assets/logoname.svg';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;600;700&display=swap');

  :root {
    --green: #00ff88;
    --green-dim: #00cc66;
    --green-glow: rgba(0, 255, 136, 0.3);
    --orange: #ff9800;
    --red: #ff3b3b;
    --bg: #0a0a0a;
    --grid: rgba(255,255,255,0.07);
    --text: #c8d8c8;
    --text-dim: #5a7a5a;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .sentinel-body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  /* Grid layer */
  .sentinel-body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  /* Vignette layer */
  .sentinel-body::after {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.82) 100%),
      linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.4) 100%);
    pointer-events: none;
    z-index: 0;
  }

  /* Logo */
  .s-logo {
    position: fixed;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    z-index: 10;
    opacity: 0;
    animation: sFadeIn 0.5s ease 0.2s forwards;
  }

  .s-logo-icon {
    width: 120px;
    height: 120px;
    // background: #cc0000;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
  }

  .s-logo-icon img {
    width: 120px !important;
    height: 120px !important;
    object-fit: contain;
    display: block;
  }

  /* Main */
  .s-main {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Sentinel ring */
  .s-ring-wrap {
    position: relative;
    width: 220px;
    height: 220px;
    margin-bottom: 48px;
  }

  .s-ring-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .s-ring-rotate {
    animation: sSpinRing 4s linear infinite;
    transform-origin: 110px 110px;
  }

  .s-ring-pulse {
    animation: sPulse 2s ease-in-out infinite;
  }

  .s-scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
    opacity: 0;
    animation: sScanLine 3s ease-in-out infinite 1s;
  }

  .s-sentinel-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .s-sentinel-label {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.25em;
    color: var(--text);
  }

  .s-drone-icon img {
    width: 80px;
    height: 48px;
    object-fit: contain;
    filter: drop-shadow(0 0 12px var(--green-glow));
  }

  .s-term-line.indent { padding-left: 20px; }
  .s-source-list { color: var(--text); }

  .s-status-block {
    margin-top: 16px;
    opacity: 0;
  }

  .s-badge {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.15em;
    padding: 1px 6px;
  }

  .s-badge-degraded {
    color: var(--orange);
    font-family: 'Rajdhani', sans-serif;
    font-weight: 550;
    font-size: 18px;
    letter-spacing: 0.03em; }
  // .s-badge-active   { color: var(--green); }
  // .s-badge-ready    { color: var(--green); }

  .s-sweep-line {
    font-size: 12px;
    margin: 14px 0 0;
    letter-spacing: 0.05em;
    opacity: 0;
  }

  .s-count {
    color: #fff;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 550;
    font-size: 18px;
    letter-spacing: 0.03em;
  }

  .s-ok {
    color: var(--green);
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
  }

  /* Terminal active */
  .s-terminal-active {
    margin-top: 32px;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0.15em;
    color: var(--green);
    text-align: center;
    opacity: 0;
    text-shadow: 0 0 20px var(--green-glow), 0 0 40px var(--green-glow);
    transition: opacity 0.6s ease;
  }

  .s-terminal-active.visible { opacity: 1; }

  .s-terminal-active::after {
    content: '_';
    animation: sBlink 1s step-end infinite;
  }

  /* Corner accents */
  .s-corner-tl, .s-corner-br {
    position: fixed;
    width: 60px;
    height: 60px;
    z-index: 1;
    opacity: 0.3;
  }

  .s-corner-tl {
    top: 16px; right: 16px;
    border-top: 1px solid var(--green);
    border-right: 1px solid var(--green);
  }

  .s-corner-br {
    bottom: 16px; left: 16px;
    border-bottom: 1px solid var(--green);
    border-left: 1px solid var(--green);
  }

  /* Staggered line animations */
  .s-d1 { animation: sFadeInLine 0.3s ease 1.0s forwards; }
  .s-d2 { animation: sFadeInLine 0.3s ease 1.3s forwards; }
  .s-d3 { animation: sFadeInLine 0.3s ease 1.6s forwards; }
  .s-d4 { animation: sFadeInLine 0.3s ease 1.9s forwards; }
  .s-d5 { animation: sFadeInLine 0.3s ease 2.2s forwards; }
  .s-sweep  { animation: sFadeInLine 0.4s ease 2.6s forwards; }
  .s-status { animation: sFadeInLine 0.4s ease 3.0s forwards; }

  @keyframes sSpinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes sPulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.8; }
  }

  @keyframes sScanLine {
    0%   { top: 10%; opacity: 0; }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.6; }
    100% { top: 90%; opacity: 0; }
  }

  @keyframes sFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes sFadeInLine {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes sBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
    .s-ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: sSpinRing 7s linear infinite;
  transform-origin: center;
}


  
`;

export default function Main() {
  const [terminalVisible, setTerminalVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTerminalVisible(true), 3600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="sentinel-body">

        {/* Logo */}
        <div className="s-logo">
          <div className="s-logo-icon">
            <img src={LogoName} alt="Spatial Grid Logo" width="48" height="48" />

 
          </div>
        </div>

        {/* Corner accents */}
        <div className="s-corner-tl" />
        <div className="s-corner-br" />

        <div className="s-main">

          {/* Sentinel Ring */}
          <div className="s-ring-wrap">
            <div className="s-scan-line" />

           <img
  src={vector}
  alt="Sentinel Ring"
  className="s-ring-svg"
  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
/>

            <div className="s-sentinel-center">
              <div className="s-drone-icon">
                <img src={animateLogo} alt="Sentinel Logo" width="48" height="48" />
              </div>
              <span className="s-sentinel-label">SENTINEL</span>
            </div>
          </div>

          {/* Terminal */}
          <div className="s-terminal chakra-petch-light">
            <div className="s-term-header s-count">INITIALIZING SPATIALGRID SENTINEL ENGINE V1</div>
              
            <div className="s-term-line s-d1">CONNECTING 31 OSINT SOURCES...</div>
              
            <div className="s-term indent s-d2">
              <span className="s-arrow">— </span>
              <span className="s-source-list">OPENSKY · FIRMS · KIWISDR · MARITIME</span>
            </div>
            <div className="s-term indent s-d3">
              <span className="s-arrow">— </span>
              <span className="s-source-list">FRED · BLS · EIA · TREASURY · GSCPI</span>
            </div>
            <div className="s-term indent s-d4">
              <span className="s-arrow">— </span>
              <span className="s-source-list">TELEGRAM · SAFECAST · EPA · WHO · OFAC</span>
            </div>
            <div className="s-term indent s-d5">
              <span className="s-corner">└ </span>
              <span className="s-source-list">GDELT · NOAA · PATENTS · BLUESKY · REDDIT</span>
            </div>
               
            <div className="s-term indent">
              SWEEP COMPLETE — 
              <span className="s-count">30</span>/31 SOURCES 
              <span className="s-count">OK</span>
            </div>

            <div className={`s-status-block s-status`}>
              <div className="s-status-line">
                <span className="s-arrow">— </span>
                ACLED CONFLICT LAYER: <span className="s-badge s-badge-degraded">DEGRADED</span>
              </div>
              <div className="s-status-line">
                <span className="s-arrow">— </span>
                DATA CORRIDORS: ACTIVE
                {" · "}DUAL PROJECTION: <span className=" s-count">READY</span>
              </div>
              <div className="s-status-line">
                <span className="s-arrow">— </span>
                INTELLIGENCE SYNTHESIS: <span className="s-count">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className={`s-terminal-active ${terminalVisible ? "visible" : ""}`}>
            TERMINAL ACTIVE
          </div>

        </div>
      </div>
    </>
  );
}
