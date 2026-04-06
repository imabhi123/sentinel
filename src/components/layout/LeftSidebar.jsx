export default function LeftSidebar({ models, selectedModel, onModelClick, disasterModels, stats, params }) {
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
    <div className="w-full h-full bg-black/40 border border-white/10 rounded-xl p-6 overflow-y-auto scrollbar-hide flex flex-col shadow-2xl">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {!selectedModel ? (
        <>
          {/* STATE 1: INITIAL - GIS SENSOR MODELS */}
          <div className="mb-6 pb-4 border-b border-white/10">
            <h2 className="text-white/80 text-sm font-bold tracking-wider">GIS SENSOR MODELS</h2>
          </div>
          
          <div className="mb-4 flex items-center gap-3 pb-4 border-b border-white/10">
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
          
          <div className="space-y-2 flex-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelClick(model)}
                className="w-full px-4 py-4 rounded-lg transition-all duration-300 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold leading-tight">
                      {model.name}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      {model.overlayType}
                    </p>
                  </div>
                  <div className={`shrink-0 w-3 h-3 rounded-full mt-1 ${
                    model.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : isLiveDataMode ? (
        <>
          {/* STATE 3: LIVE DATA VIEW */}
          <div className="mb-4 flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onModelClick(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <span className="text-lg">←</span>
              </button>
              <h2 className="text-white text-sm font-bold tracking-wider">{selectedModel.name}</h2>
            </div>
            <button 
              onClick={() => onModelClick(null)}
              className="text-white/70 hover:text-white transition-colors text-lg"
            >
              ⊖
            </button>
          </div>

          {/* LIVE DATA HEADER WITH BUTTON */}
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-white text-xs font-bold tracking-wider">LIVE DATA</span>
            <button className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors">
              SELECT REGION & SIMULATE
            </button>
          </div>

          {/* LIVE DATA FIELDS - FORM STYLE */}
          <div className="space-y-4 flex-1 pb-6">
            {/* Location */}
            <div className="pb-4 border-b border-white/10">
              <p className="text-white/60 text-xs font-bold mb-2">Location</p>
              <p className="text-white text-xs leading-relaxed">
                NH34, Dharali, Bhatwari, Uttarkashi, Uttarkhand, India
              </p>
            </div>

            {/* Time */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">Time</p>
              <p className="text-white text-xs">00:00</p>
            </div>

            {/* Phase */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">Phase</p>
              <p className="text-green-400 text-xs font-bold">IDLE</p>
            </div>

            {/* Rainfall */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">Rainfall</p>
              <p className="text-white text-xs">00.00 mm/hr</p>
            </div>

            {/* Wet Cells */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">Wet Cells</p>
              <p className="text-white text-xs">39,176</p>
            </div>

            {/* Max Depth */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">Max Depth</p>
              <p className="text-yellow-500 text-xs font-bold">00.00 m</p>
            </div>

            {/* Flood Area */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">Flood Area</p>
              <p className="text-white text-xs">0 km2</p>
            </div>

            {/* FPS */}
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">FPS</p>
              <p className="text-red-500 text-xs font-bold">4</p>
            </div>

            {/* Flood Coverage */}
            <div className="pb-6 border-b border-white/10 flex items-center justify-between">
              <p className="text-white/60 text-xs font-bold">Flood Coverage</p>
              <p className="text-white text-xs">—</p>
            </div>

            {/* AOI PREVIEW */}
            <div className="pt-4">
              <label className="text-white/80 text-xs font-bold block mb-3">AOI PREVIEW (2KM)</label>
              <div className="w-full h-40 bg-gray-800/50 border border-white/10 rounded flex items-center justify-center">
                <span className="text-white/40 text-xs text-center px-2">Drag to select area → auto-zoom</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* STATE 2: MODEL LIST WITH BACK BUTTON - DISASTER MANAGEMENT */}
          <div className="mb-4 flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onModelClick(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <span className="text-lg">←</span>
              </button>
              <h2 className="text-white text-sm font-bold tracking-wider">DISASTER MANAGEMENT</h2>
            </div>
            <button 
              onClick={() => onModelClick(null)}
              className="text-white/70 hover:text-white transition-colors text-lg"
            >
              ⊖
            </button>
          </div>

          <div className="space-y-2 flex-1">
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
                    <p className="text-white text-sm font-bold leading-tight">
                      {model.name}
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      {model.overlayType}
                    </p>
                  </div>
                  <div className={`shrink-0 w-3 h-3 rounded-full mt-1 ${
                    model.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
