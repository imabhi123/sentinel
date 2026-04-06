import React from 'react';

export default function RightProperties({ model, params, onParamChange, onScenario, onFastForward, stats, onUploadModel }) {
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
    <div className="w-80 h-full ml-auto bg-black border border-white/10 rounded-xl p-5 overflow-y-auto scrollbar-hide flex flex-col shadow-2xl">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between pb-3 border-b border-white/10">
        <h2 className="text-white text-sm font-bold tracking-[0.2em] uppercase">Simulation</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${phaseGlow} animate-pulse`} />
          <span className={`text-[10px] font-bold tracking-wider uppercase ${phaseColor}`}>{stats?.phase || 'IDLE'}</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* LIVE DATA */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold mb-3 tracking-wider uppercase text-cyan-400/60">Live Data</h3>
          <div className="space-y-1 text-[11px]">
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
          <h3 className="text-[10px] font-bold mb-3 tracking-wider uppercase text-cyan-400">Custom Terrain</h3>
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
          <h3 className="text-[8px] font-bold mb-1.5 tracking-wider uppercase text-white/40">Parameters</h3>
          <div className="space-y-1">
            {[
              { label: 'Rainfall (mm/hr)', key: 'rainfall', min: 0, max: 500, step: 1 },
              { label: 'Flood Src', key: 'floodSrc', min: 0.1, max: 5, step: 0.1 },
              { label: 'Viscosity', key: 'viscosity', min: 0.1, max: 1, step: 0.05 },
              { label: 'Evaporation', key: 'evaporation', min: 0, max: 1, step: 0.02 },
            ].map((p) => (
              <div key={p.key} className="flex items-center gap-1 w-full min-w-0">
                {/* Label - fixed width, left aligned */}
                <span className="text-white/60 text-[8px] font-bold uppercase w-24 shrink-0 truncate text-left">
                  {p.label}
                </span>

                {/* Slider with min/max labels - takes remaining space */}
                <div className="flex-1 min-w-0">
                  <input type="range" min={p.min} max={p.max} step={p.step}
                    value={params[p.key] || 0}
                    onChange={(e) => onParamChange(p.key, parseFloat(e.target.value))}
                    className="w-full h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    style={{
                      accentColor: '#ffffff',
                    }}
                  />
                  <div className="flex justify-between text-[7px] text-white/30">
                    <span>{p.min}</span>
                    <span>{p.max}</span>
                  </div>
                </div>

                {/* Value box - fixed width */}
                <div className="w-9 h-4 shrink-0 bg-white/10 border border-white/15 rounded flex items-center justify-center">
                  <span className="text-white text-[8px] font-medium">{params[p.key] ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SCENARIOS */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-white/40">Scenarios</h3>
            <button onClick={() => onScenario('reset')}
              className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-500 hover:bg-red-600 hover:text-white text-[9px] font-bold transition-colors uppercase tracking-widest"
            >RESET</button>
          </div>
          <div className="space-y-1.5">
            {scenarios.map((s) => (
              <button key={s.id} onClick={() => onScenario(s.id)}
                className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 hover:text-white text-[9px] font-bold transition-all duration-200 uppercase tracking-widest text-left"
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* TIME CONTROL */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold mb-3 tracking-wider uppercase text-white/40">Time Control</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {ffButtons.map(ff => (
              <button key={ff.mins} onClick={() => onFastForward?.(ff.mins)}
                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 hover:text-white text-[9px] font-bold transition-all"
              >{ff.label}</button>
            ))}
          </div>
        </div>

        {/* VISUAL ADJUSTMENTS */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold mb-3 tracking-wider uppercase text-white/40">Visual</h3>
          <div className="space-y-3">
            {[
              { label: 'Water Alpha', key: 'waterAlpha', min: 0.2, max: 1, step: 0.02 },
              { label: 'Forest Canopy', key: 'forestCanopy', min: 0, max: 40, step: 1 },
              { label: 'Building Lift', key: 'buildingLift', min: 0, max: 35, step: 1 },
            ].map((p) => (
              <div key={p.key} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-white/60 text-[10px] font-bold uppercase">{p.label}</span>
                  <span className="text-white font-bold text-[10px]">{params[p.key] || 0}</span>
                </div>
                <input type="range" min={p.min} max={p.max} step={p.step}
                  value={params[p.key] || 0}
                  onChange={(e) => onParamChange(p.key, parseFloat(e.target.value))}
                  className="accent-white/40 h-1 bg-white/10 rounded-full appearance-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* WATER DEPTH LEGEND */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <h3 className="text-[10px] font-bold mb-2 tracking-wider uppercase text-white/40">Water Depth</h3>
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
