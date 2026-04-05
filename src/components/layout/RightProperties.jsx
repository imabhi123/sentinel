export default function RightProperties({ model }) {
  const [params, setParams] = React.useState({
    rainfall: 0,
    floodSrc: 0,
    viscosity: 0,
    evaporation: 0,
    waterAlpha: 0,
    forestCanopy: 0,
    buildingLift: 0,
  });

  const [toggles, setToggles] = React.useState({
    satellite: true,
    buildings: true,
  });

  const scenarios = [
    { label: '[ START RAIN ]', id: 'startRain' },
    { label: '[ TRIGGER FLOOD ]', id: 'triggerFlood' },
    { label: '[ DAM BREAK ]', id: 'damBreak' },
    { label: '[ RAIN ONLY ]', id: 'rainOnly' },
  ];

  const cameraViews = ['TOP DOWN', 'ISOMETRIC', 'CLOSE FLY'];

  return (
    <div className="w-96 h-[calc(100%-120px)] bg-black/40 border border-white/10 rounded-lg p-6 overflow-y-auto scrollbar-hide flex flex-col">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        input[type="range"] {
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, #ffffff1a 50%, #ffffff1a 100%);
          border-radius: 5px;
          outline: none;
          -webkit-appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
      `}</style>

      {/* SIMULATION HEADER */}
      <div className="mb-6 flex items-center justify-between pb-4 border-b border-white/10">
        <h2 className="text-white text-sm font-bold tracking-wider">SIMULATION</h2>
        <button className="text-white/70 hover:text-white transition-colors text-lg">
          ⊖
        </button>
      </div>

      <div className="space-y-6 flex-1">
        {/* PARAMETERS SECTION */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-white text-xs font-bold mb-4 tracking-wider">Parameters</h3>
          <div className="space-y-4">
            {[
              { label: 'Rainfall (mm/hr)', key: 'rainfall' },
              { label: 'Flood Src', key: 'floodSrc' },
              { label: 'Viscosity', key: 'viscosity' },
              { label: 'Evaporation', key: 'evaporation' },
            ].map((param) => (
              <div key={param.key} className="flex items-center gap-3">
                <span className="text-white/70 text-xs w-24">{param.label}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params[param.key]}
                  onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
                  className="flex-1"
                />
                <div className="w-12 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs text-center">
                  {params[param.key]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SCENARIOS SECTION */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-xs font-bold tracking-wider">Scenarios</h3>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-white/10 border border-white/20 rounded text-white/60 hover:text-white text-xs font-bold transition-colors">
                PAUSE
              </button>
              <button className="px-4 py-1.5 bg-red-600/20 border border-red-500/50 rounded text-red-400 hover:text-red-300 text-xs font-bold transition-colors">
                RESET
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 hover:text-white text-xs font-bold transition-all duration-200"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* CAMERA SECTION */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-white text-xs font-bold mb-4 tracking-wider">Camera</h3>
          
          {/* Camera View Buttons */}
          <div className="flex gap-2 mb-4">
            {cameraViews.map((view) => (
              <button
                key={view}
                className="flex-1 px-2 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/60 hover:text-white text-xs font-bold transition-all duration-200"
              >
                {view}
              </button>
            ))}
          </div>

          {/* Toggles */}
          <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
            {[
              { label: 'Satellite', key: 'satellite' },
              { label: 'Buildings', key: 'buildings' },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <span className="text-white/70 text-xs">{toggle.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-xs">ON</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toggles[toggle.key]}
                      onChange={(e) => setToggles({ ...toggles, [toggle.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500/50"></div>
                  </label>
                  <span className="text-white/60 text-xs">OFF</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            {[
              { label: 'Water Alpha', key: 'waterAlpha' },
              { label: 'Forest Canopy', key: 'forestCanopy' },
              { label: 'Building Lift', key: 'buildingLift' },
            ].map((slider) => (
              <div key={slider.key} className="flex items-center gap-3">
                <span className="text-white/70 text-xs w-24">{slider.label}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params[slider.key]}
                  onChange={(e) => setParams({ ...params, [slider.key]: e.target.value })}
                  className="flex-1"
                />
                <div className="w-12 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs text-center">
                  {params[slider.key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
