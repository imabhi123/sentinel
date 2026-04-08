import React from 'react';
import AoiMinimap from '../simulation/AoiMinimap';
import green from '../../assets/green.svg';
import red from '../../assets/red.svg';
import leftarrow from '../../assets/leftarrow.svg';
import minimize from '../../assets/minimize.svg';

export default function LeftSidebar({ models, selectedModel, onModelClick, disasterModels, stats, params, satData, customModel, onSelectAoi }) {
  const [selectedRegion, setSelectedRegion] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);

  const handleLoadArea = async () => {
    if (!selectedRegion.trim()) return;
    setLoading(true);
    try {
      // Handle region loading logic here
    } finally {
      setLoading(false);
    }
  };

  const liveData = {
    location: "NH34, Dharali, Bhatwari,\nUttarkashi, Uttarkhand, India",
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
    <div className={`${isMinimized ? 'h-16' : 'h-full'} w-[365px] ml-auto bg-[#06060B] border border-white/10 rounded-xl p-5 scrollbar-hide flex flex-col shadow-2xl transition-all duration-300 overflow-hidden`}>
      {/* ↑ overflow-hidden is the key fix — clips child content when h-16 is active */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {!selectedModel ? (
        <>
          {/* STATE 1: INITIAL - GIS SENSOR MODELS */}

          {/* Header — always visible even when minimized */}
          <div className="mb-2 border-white/10 shrink-0 text-left flex items-center justify-between">
            <h2 className="text-[#B5B5B5] text-[17px] tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>GIS SENSOR MODELS</h2>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <img src={minimize} alt={isMinimized ? 'Expand' : 'Minimize'} className="w-4 h-4" />
            </button>
          </div>

          {/* Content hidden when minimized */}
          {!isMinimized && (
            <>
              <div
                className="mb-2 flex items-center gap-3 border-white/10 shrink-0"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <img src={green} alt="Live" className="w-6 h-6" />
                  LIVE MODULE
                </span>
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <img src={red} alt="Inactive" className="w-6 h-6" />
                  INACTIVE MODULE
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onModelClick(model)}
                    className="w-full px-4 py-4 rounded-lg transition-all duration-300 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[#CCCCCC] text-[14px] leading-tight">{model.name}</p>
                        <p className="text-xs mt-1" style={{ fontFamily: 'Chakra Petch, sans-serif', color: '#8A8A8A' }}>{model.overlayType}</p>
                      </div>
                      <img
                        src={model.status === 'active' ? green : red}
                        alt={model.status}
                        className="shrink-0 w-6 h-6 mt-1"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </>

      ) : isLiveDataMode ? (
        <>
          {/* STATE 3: LIVE DATA VIEW */}

          {/* Top nav — always visible */}
          <div className="mb-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => onModelClick(null)} className="text-white/70 hover:text-white transition-colors">
                <img src={leftarrow} alt="Back" className="w-4 h-4" />
              </button>
              <h2 className="text-[#B5B5B5] text-[17px] tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{selectedModel.name}</h2>
            </div>
            <button onClick={() => setIsMinimized(!isMinimized)} className="flex-shrink-0 hover:opacity-80 transition-opacity" title={isMinimized ? 'Expand' : 'Minimize'}>
              <img src={minimize} alt={isMinimized ? 'Expand' : 'Minimize'} className="w-4 h-4" />
            </button>
          </div>

          {/* Content hidden when minimized */}
          {!isMinimized && (
            <>
              {/* LIVE DATA CARD */}
              <div className="bg-[#18181A] rounded-xl p-4 shrink-0 mb-3" style={{ height: '380px', overflow: 'hidden' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[#DADADA] text-[16px] font-bold tracking-widest">LIVE DATA</span>
                  <button className="px-1.5 py-1 bg-[#EE2B2A] text-white text-[10px] font-medium rounded-md transition-colors whitespace-nowrap tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    SELECT REGION & SIMULATE
                  </button>
                </div>

                {/* Location */}
                <div className="text-left">
                  <p className="text-[#B6B6B6] text-[13px] font-semibold mb-1">Location</p>
                  <p className="text-[#FFFBFB] text-[12px] leading-relaxed whitespace-pre-wrap">
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
                    <div className="flex items-center justify-between py-1">
                      <p className="text-[#B6B6B6] text-[13px] font-semibold">{row.label}</p>
                      <p className={`text-[12px] ${row.color || 'text-white'}`}>{row.value}</p>
                    </div>
                    {i < 7 && <div className="border-t border-white/10" />}
                  </div>
                ))}
              </div>

              {/* AOI PREVIEW CARD */}
              <div className="bg-[#18181A] rounded-xl p-4 shrink-0 flex flex-col" style={{ height: '260px', overflow: 'hidden' }}>
                <p className="text-[#DADADA] text-[16px] font-bold tracking-wider mb-3 text-left shrink-0">
                  AOI PREVIEW <span className="text-[#DADADA]">(2KM)</span>
                </p>
                <div className="border-[2px] border-[#434343] rounded-lg overflow-hidden relative">
                  <AoiMinimap satData={satData} customModel={customModel} onSelectArea={onSelectAoi} />
                </div>
                <div className="text-left text-[#828282] text-[12px]">Drag to select area → auto-zoom</div>
              </div>
            </>
          )}
        </>

      ) : (
        <>
          {/* STATE 2: DISASTER MANAGEMENT */}

          {/* Top nav — always visible */}
          <div className="mb-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => onModelClick(null)} className="text-white/70 hover:text-white transition-colors">
                <img src={leftarrow} alt="Back" className="w-4 h-4" />
              </button>
              <h2 className="text-[#B5B5B5] text-[13px] tracking-wider whitespace-nowrap" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>DISASTER MANAGEMENT</h2>
            </div>
            <button onClick={() => setIsMinimized(!isMinimized)} className="flex-shrink-0 hover:opacity-80 transition-opacity" title={isMinimized ? 'Expand' : 'Minimize'}>
              <img src={minimize} alt={isMinimized ? 'Expand' : 'Minimize'} className="w-4 h-4" />
            </button>
          </div>

          {/* Content hidden when minimized */}
          {!isMinimized && (
            <>
              <div
                className="mb-2 flex items-center gap-3 border-white/10 shrink-0"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <img src={green} alt="Live" className="w-6 h-6" />
                  LIVE MODULE
                </span>
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <img src={red} alt="Inactive" className="w-6 h-6" />
                  INACTIVE MODULE
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
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
                        <p className="text-[#CCCCCC] text-[14px] leading-tight">{model.name}</p>
                        <p className="text-xs mt-1" style={{ fontFamily: 'Chakra Petch, sans-serif', color: '#8A8A8A' }}>{model.overlayType}</p>
                      </div>
                      <img
                        src={model.status === 'active' ? green : red}
                        alt={model.status}
                        className="shrink-0 w-4 h-4 mt-1"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}