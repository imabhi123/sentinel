import AoiMinimap from '../simulation/AoiMinimap';

export default function LeftSidebar({ models, selectedModel, onModelClick, disasterModels, stats, params, satData, customModel, onSelectAoi }) {
  const liveData = {
    location: "NH34, Dharali, Bhatwari, Uttarkashi, Uttarkhand, India",
    time: stats?.time || "00:00",
    phase: stats?.phase || "IDLE",
    rainfall: (stats?.rain || 0).toFixed(2) + " mm/hr",
    wetCells: (stats?.cells || 0).toLocaleString(),
    maxDepth: (stats?.depth || 0).toFixed(2) + " m",
    floodArea: (stats?.area || 0) > 1e6 ? `${((stats?.area || 0) / 1e6).toFixed(2)} km²` : `${(stats?.area || 0).toFixed(0)} m²`,
    fps: stats?.fps || 0,
    floodCoverage: Math.min(((stats?.cells || 0) / 40000) * 100, 100).toFixed(1) + "%",
  };
  const isLiveDataMode = selectedModel?.liveDataMode === true;

  return (
    <div className="w-full h-full bg-black border border-white/10 rounded-xl p-5 flex flex-col shadow-2xl overflow-y-auto scrollbar-hide">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {!selectedModel ? (
        <>
          {/* STATE 1: INITIAL - GIS SENSOR MODELS */}
          <div className="mb-6 pb-4 border-b border-white/10 shrink-0">
            <h2 className="text-white/80 text-sm font-bold tracking-wider">GIS SENSOR MODELS</h2>
          </div>

          <div className="mb-4 flex items-center gap-3 pb-4 border-b border-white/10 shrink-0">
            <span className="flex items-center gap-1 text-white/70 text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              LIVE MODULE
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1 text-white/70 text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              INACTIVE MODULE
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-hidden">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelClick(model)}
                className="w-full px-4 py-4 rounded-lg transition-all duration-300 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold leading-tight">{model.name}</p>
                    <p className="text-white/50 text-xs mt-1">{model.overlayType}</p>
                  </div>
                  <div className={`shrink-0 w-3 h-3 rounded-full mt-1 ${model.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </button>
            ))}
          </div>
        </>

      ) : isLiveDataMode ? (
        <>
          {/* STATE 3: LIVE DATA VIEW */}

          {/* Top nav */}
          <div className="mb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => onModelClick(null)} className="text-white/70 hover:text-white transition-colors">
                <span className="text-lg">←</span>
              </button>
              <h2 className="text-white text-sm font-bold tracking-wider">{selectedModel.name}</h2>
            </div>
            <button onClick={() => onModelClick(null)} className="text-white/70 hover:text-white transition-colors text-lg">⊖</button>
          </div>

          {/* LIVE DATA CARD */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 shrink-0 mb-3">

         
<div className="flex items-center justify-between mb-4">
  <span className="text-white text-xs font-bold tracking-widest">LIVE DATA</span>
  <button className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-md transition-colors whitespace-nowrap tracking-wider">
    SELECT REGION & SIMULATE
  </button>
</div>


            {/* Location */}
           <div className="mb-3 text-left">
  <p className="text-white/60 text-xs font-semibold mb-1">Location</p>
  <p className="text-white text-xs leading-relaxed">
    {liveData.location}
  </p>
</div>

            <div className="border-t border-white/10" />

            {/* Data rows */}
            {[
              { label: 'Time', value: liveData.time, color: 'text-white' },
              { label: 'Phase', value: liveData.phase, color: liveData.phase === 'IDLE' ? 'text-green-400 font-bold' : liveData.phase === 'RAIN' ? 'text-blue-400 font-bold' : 'text-red-400 font-bold' },
              { label: 'Rainfall', value: liveData.rainfall, color: 'text-white' },
              { label: 'Wet Cells', value: liveData.wetCells, color: 'text-white' },
              { label: 'Max Depth', value: liveData.maxDepth, color: 'text-yellow-400 font-bold' },
              { label: 'Flood Area', value: liveData.floodArea, color: 'text-white' },
              { label: 'FPS', value: liveData.fps, color: 'text-red-500 font-bold' },
              { label: 'Flood Coverage', value: liveData.floodCoverage, color: 'text-white' },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex items-center justify-between py-[10px]">
                  <p className="text-white/60 text-xs font-semibold">{row.label}</p>
                  <p className={`text-xs ${row.color || 'text-white'}`}>{row.value}</p>
                </div>
                <div className="border-t border-white/10" />
              </div>
            ))}
          </div>

          {/* AOI PREVIEW CARD */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 shrink-0 flex flex-col">
            <p className="text-white text-xs font-bold tracking-wider mb-3 shrink-0">
              AOI PREVIEW <span className="text-white/50">(2KM)</span>
            </p>
            <div className="border border-white/10 rounded-lg overflow-hidden relative">
              <AoiMinimap satData={satData} customModel={customModel} onSelectArea={onSelectAoi} />
            </div>
          </div>
        </>

      ) : (
        <>
          {/* STATE 2: DISASTER MANAGEMENT */}
          <div className="mb-4 flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => onModelClick(null)} className="text-white/70 hover:text-white transition-colors">
                <span className="text-lg">←</span>
              </button>
              <h2 className="text-white text-sm font-bold tracking-wider">DISASTER MANAGEMENT</h2>
            </div>
            <button onClick={() => onModelClick(null)} className="text-white/70 hover:text-white transition-colors text-lg">⊖</button>
          </div>

          <div className="space-y-2 flex-1 overflow-hidden">
            {disasterModels.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelClick(model)}
                className={`w-full px-4 py-4 rounded-lg transition-all duration-300 text-left border ${
                  selectedModel?.id === model.id
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold leading-tight">{model.name}</p>
                    <p className="text-white/50 text-xs mt-1">{model.overlayType}</p>
                  </div>
                  <div className={`shrink-0 w-3 h-3 rounded-full mt-1 ${model.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}