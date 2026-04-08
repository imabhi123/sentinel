import { useEffect, useState } from "react";
import animateLogo from '../../assets/animateLogo.png';
import vector from '../../assets/Vector.svg';
import LogoName from '../../assets/Logoname.svg';

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

  .s-main {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

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
    animation: sSpinRing 7s linear infinite;
    transform-origin: center;
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

  .s-terminal {
    text-align: left;
    align-self: flex-start;
    margin-left: 20px;
  }

  .s-status-block {
    margin-top: 16px;
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
    letter-spacing: 0.03em;
  }

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

  /* TYPING CURSOR */
  .typing-cursor::after {
    content: '█';
    animation: sBlink 0.7s step-end infinite;
    color: var(--green);
    font-size: 0.9em;
  }

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
`;

// ── typing engine ──────────────────────────────────────────────
const TYPING_LINES = [
  { key: 'header',    text: 'INITIALIZING SPATIALGRID SENTINEL ENGINE V1', speed: 28 },
  { key: 'connect',   text: 'CONNECTING 31 OSINT SOURCES...',               speed: 32 },
  { key: 'src1',      text: 'OPENSKY · FIRMS · KIWISDR · MARITIME',         speed: 22 },
  { key: 'src2',      text: 'FRED · BLS · EIA · TREASURY · GSCPI',          speed: 22 },
  { key: 'src3',      text: 'TELEGRAM · SAFECAST · EPA · WHO · OFAC',       speed: 22 },
  { key: 'src4',      text: 'GDELT · NOAA · PATENTS · BLUESKY · REDDIT',    speed: 22 },
  { key: 'sweep',     text: 'SWEEP COMPLETE — 30/31 SOURCES OK',            speed: 30 },
  { key: 'acled',     text: 'DEGRADED',                                      speed: 40 },
  { key: 'corridor',  text: 'DATA CORRIDORS: ACTIVE · DUAL PROJECTION: READY', speed: 25 },
  { key: 'intel',     text: 'INTELLIGENCE SYNTHESIS: ACTIVE',                speed: 28 },
];

const LINE_GAP = 180; // ms between lines
const MIN_DURATION = 15000; // 15 seconds minimum loading time

function useTypingSequence() {
  const [typed, setTyped] = useState({});
  const [visibleLines, setVisibleLines] = useState({});
  const [terminalVisible, setTerminalVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const startTime = Date.now(); // record start time

    const typeText = (key, text, speed) =>
      new Promise(resolve => {
        setVisibleLines(prev => ({ ...prev, [key]: true }));
        let i = 0;
        const tick = () => {
          if (cancelled) return;
          if (i <= text.length) {
            const slice = text.slice(0, i);
            setTyped(prev => ({ ...prev, [key]: slice }));
            i++;
            setTimeout(tick, speed + (Math.random() * 20 - 10));
          } else {
            resolve();
          }
        };
        tick();
      });

    const run = async () => {
      await new Promise(r => setTimeout(r, 600));
      for (const { key, text, speed } of TYPING_LINES) {
        if (cancelled) return;
        await typeText(key, text, speed);
        await new Promise(r => setTimeout(r, LINE_GAP));
      }
      if (!cancelled) {
        await new Promise(r => setTimeout(r, 400));

        // Wait out remaining time to enforce 15s minimum
        const elapsed = Date.now() - startTime;
        const remaining = MIN_DURATION - elapsed;
        if (remaining > 0) {
          await new Promise(r => setTimeout(r, remaining));
        }

        if (!cancelled) setTerminalVisible(true);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return { typed, visibleLines, terminalVisible };
}
// ──────────────────────────────────────────────────────────────

export default function Main() {
  const { typed, visibleLines, terminalVisible } = useTypingSequence();

  // attach blinking cursor to the line currently being typed
  const activeLine = [...TYPING_LINES].reverse().find(
    ({ key, text }) => visibleLines[key] && (typed[key] ?? '').length < text.length
  )?.key;

  const t = (key) => {
    const val = typed[key] ?? '';
    const isActive = key === activeLine;
    return isActive ? <span className="typing-cursor">{val}</span> : val;
  };

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

            {visibleLines.header && (
              <div className="s-term-header s-count">{t('header')}</div>
            )}

            {visibleLines.connect && (
              <div className="s-term-line">{t('connect')}</div>
            )}

            {visibleLines.src1 && (
              <div className="s-term indent">
                <span className="s-arrow">— </span>
                <span className="s-source-list">{t('src1')}</span>
              </div>
            )}

            {visibleLines.src2 && (
              <div className="s-term indent">
                <span className="s-arrow">— </span>
                <span className="s-source-list">{t('src2')}</span>
              </div>
            )}

            {visibleLines.src3 && (
              <div className="s-term indent">
                <span className="s-arrow">— </span>
                <span className="s-source-list">{t('src3')}</span>
              </div>
            )}

            {visibleLines.src4 && (
              <div className="s-term indent">
                <span className="s-corner">└ </span>
                <span className="s-source-list">{t('src4')}</span>
              </div>
            )}

            {visibleLines.sweep && (
              <div className="s-term indent">
                {t('sweep')}
              </div>
            )}

            {(visibleLines.acled || visibleLines.corridor || visibleLines.intel) && (
              <div className="s-status-block">
                {visibleLines.acled && (
                  <div className="s-status-line">
                    <span className="s-arrow">— </span>
                    ACLED CONFLICT LAYER: <span className="s-badge s-badge-degraded">{t('acled')}</span>
                  </div>
                )}
                {visibleLines.corridor && (
                  <div className="s-status-line">
                    <span className="s-arrow">— </span>
                    {t('corridor')}
                  </div>
                )}
                {visibleLines.intel && (
                  <div className="s-status-line">
                    <span className="s-arrow">— </span>
                    {t('intel')}
                  </div>
                )}
              </div>
            )}

          </div>

          <div className={`s-terminal-active ${terminalVisible ? "visible" : ""}`}>
            TERMINAL ACTIVE
          </div>

        </div>
      </div>
    </>
  );
}