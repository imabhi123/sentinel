import React, { useState } from 'react';
import { SOIL_TYPES } from '../../hooks/useFloodSimulation';
import minimizeIcon from '../../assets/minimize.svg';

export default function RightProperties({ model, params, onParamChange, onScenario, onFastForward, stats, onUploadModel }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const scenarios = [
    { label: '[ START RAIN ]', id: 'startRain' },
    { label: '[ TRIGGER FLOOD ]', id: 'triggerFlood' },
    { label: '[ DAM BREAK ]', id: 'damBreak' },
    { label: '[ RAIN ONLY ]', id: 'rainOnly' },
  ];

  const ffButtons = [
    { label: '+10 min', mins: 10 },
    { label: '+30 min', mins: 30 },
    { label: '+1 hr', mins: 60 },
    { label: '+2 hr', mins: 120 },
  ];

  const phaseColor = stats?.phase === 'IDLE' ? 'text-green-400' : stats?.phase === 'RAIN' ? 'text-blue-400' : 'text-red-400';
  const phaseGlow = stats?.phase === 'FLOOD' ? 'bg-red-500' : stats?.phase === 'RAIN' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className={`${isMinimized ? 'h-16' : 'h-full'} w-[365px] ml-auto bg-[#06060B] border border-white/10 rounded-xl p-5 scrollbar-hide flex flex-col shadow-2xl transition-all duration-300`}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER */}
      <div className="flex items-center justify-between pb-1 mb-3">
        <h2 className="text-white text-[13px] font-bold tracking-[0.2em] uppercase text-left" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Simulation</h2>
        <button onClick={() => setIsMinimized(!isMinimized)}
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          <img src={minimizeIcon} alt={isMinimized ? 'Expand' : 'Minimize'} className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
        {/* LIVE DATA */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40 text-left">Live Data</h3>
          <div className="text-[11px]">
            {[
              { label: 'Time', value: stats?.time || '00:00' },
              { label: 'Rainfall', value: `${stats?.rain || 0} mm/hr` },
              { label: 'Wet Cells', value: (stats?.cells || 0).toLocaleString() },
              { label: 'Max Depth', value: `${(stats?.depth || 0).toFixed(2)} m`, cls: 'text-orange-400' },
              { label: 'Flood Area', value: (stats?.area || 0) > 1e6 ? `${((stats?.area || 0) / 1e6).toFixed(2)} km²` : `${(stats?.area || 0).toFixed(0)} m²` },
            ].map(r => (
              <div key={r.label} className="flex justify-between border-b border-white/5 py-0.5">
                <span className="text-white/40">{r.label}</span>
                <span className={`font-bold ${r.cls || ''}`}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <div className="text-[8px] text-white/30 mb-1">Flood Coverage</div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-700 via-cyan-500 to-cyan-300 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(((stats?.cells || 0) / 40000) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* CUSTOM TERRAIN */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40 text-left">Custom Terrain</h3>
          <div className="flex gap-2">
            <button onClick={() => document.getElementById('inp-glb').click()}
              className="flex-1 py-1.5 border border-white/20 rounded text-cyan-400 font-bold hover:bg-white/10 transition-colors uppercase text-[9px] tracking-widest"
            >Upload GLB / FBX</button>
            <input type="file" id="inp-glb" accept=".glb,.gltf,.fbx" style={{ display: 'none' }}
              onChange={(e) => {
                if (onUploadModel && e.target.files[0]) {
                  onUploadModel(e.target.files[0]);
                }
                e.target.value = '';
              }} />
          </div>
        </div>

        {/* PARAMETERS */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40 text-left">Parameters</h3>
          <div className="space-y-1.5">
            {[
              { label: 'Rainfall', key: 'rainfall', min: 0, max: 200, step: 1 },
              { label: 'Upstream', key: 'floodSrc', min: 0, max: 50, step: 1 },
              { label: 'Viscosity', key: 'viscosity', min: 0.3, max: 0.98, step: 0.02 },
              { label: 'Evaporation', key: 'evaporation', min: 0, max: 10, step: 0.1 },
            ].map((p) => (
              <div key={p.key} className="flex items-center gap-2 w-full">
                <span className="text-white/60 text-[9px] font-bold uppercase w-15 shrink-0 truncate text-left">{p.label}</span>
                <div className="flex items-center gap-2">
                  <input type="range" min={p.min} max={p.max} step={p.step}
                    value={params[p.key] || 0}
                    onChange={(e) => onParamChange(p.key, parseFloat(e.target.value))}
                    className="w-35 h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    style={{
                      accentColor: '#ffffff',
                      WebkitAppearance: 'none',
                    }}
                  />
                  <style>{`
                    input[type='range']::-webkit-slider-thumb {
                      appearance: none;
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      background: white;
                      cursor: pointer;
                    }
                    input[type='range']::-moz-range-thumb {
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      background: white;
                      cursor: pointer;
                      border: none;
                    }
                  `}</style>
                  <div className="w-10 h-5 shrink-0 bg-white/10 border border-white/15 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-[8px]">
                      {params[p.key]?.toFixed ? parseFloat(params[p.key].toFixed(2)) : params[p.key] ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Soil Type Dropdown */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-[10px] font-bold uppercase">Soil Type</span>
                <span className="text-cyan-400 font-bold text-[9px] uppercase tracking-wide">
                  {SOIL_TYPES[params.soilType]?.label?.split(' ')[0] || 'Loam'}
                </span>
              </div>
              <select
                value={params.soilType || 'loam'}
                onChange={(e) => onParamChange('soilType', e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded px-2 py-1.5 text-white text-[10px] font-bold focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23888\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {Object.entries(SOIL_TYPES).map(([key, soil]) => (
                  <option key={key} value={key} style={{ background: '#111', color: '#fff' }}>
                    {soil.label}
                  </option>
                ))}
              </select>
              <div className="text-white/25 text-[8px] leading-tight">
                {params.soilType && SOIL_TYPES[params.soilType] && (
                  <>
                    f₀={SOIL_TYPES[params.soilType].f0} mm/hr →
                    f꜀={SOIL_TYPES[params.soilType].fc} mm/hr (Horton)
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SCENARIOS */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40 text-left">Scenarios</h3>
            <div className="flex gap-2">
              <button onClick={() => onScenario('pause')}
                className="px-3 rounded text-[9px] font-bold transition-colors uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(108, 108, 108, 0.2)', border: '1px solid rgba(108, 108, 108, 0.5)', color: '#6C6C6C' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#6C6C6C'; e.target.style.color = 'white'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(108, 108, 108, 0.2)'; e.target.style.color = '#6C6C6C'; }}
              >PAUSE</button>
              <button onClick={() => onScenario('reset')}
                className="px-3 bg-red-600/20 border border-red-500/50 rounded text-red-500 hover:bg-red-600 hover:text-white text-[9px] font-bold transition-colors uppercase tracking-widest"
              >RESET</button>
            </div>
          </div>
          <div className="space-y-1.5">
            {scenarios.map((s) => (
              <button key={s.id} onClick={() => onScenario(s.id)}
                className="w-full px-3 hover:bg-white/10 border border-white/20 rounded text-white/70 hover:text-white text-[9px] font-bold transition-all duration-200 uppercase tracking-widest text-left"
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* TIME CONTROL */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40 text-left">Time Control</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {ffButtons.map(ff => (
              <button key={ff.mins} onClick={() => onFastForward?.(ff.mins)}
                className="px-2  bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 hover:text-white text-[9px] font-bold transition-all"
              >{ff.label}</button>
            ))}
          </div>
        </div>

        {/* VISUAL ADJUSTMENTS */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40 text-left mb-3">camera</h3>
          <div className="space-y-3">
            {/* Camera Buttons */}
            <div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'TOP DOWN', key: 'cameraTopDown' },
                  { label: 'ISOMETRIC', key: 'cameraIsometric' },
                  { label: 'CLOSE FLY', key: 'cameraCloseFly' },
                ].map((cam) => (
                  <button
                    key={cam.key}
                    onClick={() => onParamChange(cam.key, !params[cam.key])}
                    className="px-2 py-1 rounded-[20px] text-[9px] font-bold uppercase tracking-widest transition-all bg-gray-700/30 border border-gray-600/40 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                  >
                    {cam.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Satellite & Buildings Toggles */}
            {[
              { label: 'Satellite', key: 'satellite' },
              { label: 'Buildings', key: 'buildings' },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center gap-2">
                <span className="text-white/50 text-[11px] font-semibold">{toggle.label}</span>
                <span className="text-white/30 text-[9px]">({params[toggle.key] ? 'ON' : 'OFF'})</span>
                <div className="w-8 h-4 bg-[#2FB631] border-0 rounded-full relative flex items-center px-0.5 cursor-pointer transition-all" onClick={() => onParamChange(toggle.key, !params[toggle.key])}>
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      params[toggle.key] === true ? 'bg-white ml-auto' : 'bg-white'
                    }`}
                  />
                </div>
              </div>
            ))}

            {/* Sliders */}
            <div className=" pt-3 mt-3">
              {[
                { label: 'Water Alpha', key: 'waterAlpha', min: 0.2, max: 1, step: 0.02 },
                { label: 'Forest Canopy', key: 'forestCanopy', min: 0, max: 40, step: 1 },
                { label: 'Building Lift', key: 'buildingLift', min: 0, max: 35, step: 1 },
              ].map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-white/50 text-[11px] font-semibold min-w-max">{p.label}</span>
                  <input type="range" min={p.min} max={p.max} step={p.step}
                    value={params[p.key] || 0}
                    onChange={(e) => onParamChange(p.key, parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-gray-600/50 rounded-full appearance-none cursor-pointer"
                    style={{
                      accentColor: '#ffffff',
                      WebkitAppearance: 'none',
                    }}
                  />
                  <style>{`
                    input[type='range']::-webkit-slider-thumb {
                      appearance: none;
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      background: white;
                      cursor: pointer;
                    }
                    input[type='range']::-moz-range-thumb {
                      width: 10px;
                      height: 10px;
                      border-radius: 50%;
                      background: white;
                      cursor: pointer;
                      border: none;
                    }
                  `}</style>
                  <div className="w-12 h-6 shrink-0 bg-white/5 border border-white/20 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-[9px]">
                      {Math.round(params[p.key] || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WATER DEPTH LEGEND */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40 text-left">Water Depth</h3>
          <div className="space-y-1">
            {[
              { color: '#90e0ef', label: '< 0.1 m' },
              { color: '#00b4d8', label: '0.1 – 0.5 m' },
              { color: '#0077b6', label: '0.5 – 1.5 m' },
              { color: '#023e8a', label: '1.5 – 3.0 m' },
              { color: '#03045e', label: '> 3.0 m' },
            ].map(l => (
              <div key={l.color} className="flex items-center gap-2">
                <div className="w-5 h-1.5 rounded-sm" style={{ background: l.color }} />
                <span className="text-[9px] text-white/50">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}