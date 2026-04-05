export default function BottomSimulation({ params, onParamChange }) {
  const scenarios = [
    { label: '[ START RAIN ]', id: 'startRain' },
    { label: '[ TRIGGER FLOOD ]', id: 'triggerFlood' },
    { label: '[ DAM BREAK ]', id: 'damBreak' },
    { label: '[ RAIN ONLY ]', id: 'rainOnly' },
  ];

  const cameraViews = ['TOP DOWN', 'ISOMETRIC', 'CLOSE FLY'];

  const toggles = [
    { label: 'Satellite', id: 'satellite', default: true },
    { label: 'Buildings', id: 'buildings', default: true },
  ];

  const sliders = [
    { label: 'Water Alpha', id: 'waterAlpha', default: 0 },
    { label: 'Forest Canopy', id: 'forestCanopy', default: 0 },
    { label: 'Building Lift', id: 'buildingLift', default: 0 },
  ];

  const handleScenarioClick = (scenario) => {
    console.log(`Scenario triggered: ${scenario.label}`);
  };

  const handleCameraView = (view) => {
    console.log(`Camera view: ${view}`);
  };

  return (
    <div className="absolute bottom-4 left-80 right-96 bg-black/60 border border-white/10 rounded-lg p-6 backdrop-blur-md max-h-96 overflow-y-auto">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="grid grid-cols-3 gap-8">
        {/* LEFT SECTION - PARAMETERS */}
        <div>
          <h3 className="text-white text-xs font-bold mb-4 tracking-wider">PARAMETERS</h3>
          <div className="space-y-4">
            {[
              { label: 'Rainfall (mm/hr)', key: 'rainfall' },
              { label: 'Flood Src', key: 'floodSrc' },
              { label: 'Viscosity', key: 'viscosity' },
              { label: 'Evaporation', key: 'evaporation' },
            ].map((param) => (
              <div key={param.key} className="flex items-center gap-3">
                <span className="text-white/70 text-xs flex-1">{param.label}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params[param.key]}
                  onChange={(e) => onParamChange(param.key, e.target.value)}
                  className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${params[param.key]}%, #ffffff1a ${params[param.key]}%, #ffffff1a 100%)`
                  }}
                />
                <span className="text-white/50 text-xs w-6 text-right">{params[param.key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE SECTION - SCENARIOS */}
        <div>
          <h3 className="text-white text-xs font-bold mb-4 tracking-wider">SCENARIOS</h3>
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/70 hover:text-white text-xs font-bold transition-all duration-200"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SECTION - CAMERA & TOGGLES */}
        <div className="space-y-6">
          {/* Camera Section */}
          <div>
            <h3 className="text-white text-xs font-bold mb-3 tracking-wider">CAMERA</h3>
            <div className="flex gap-2">
              {cameraViews.map((view) => (
                <button
                  key={view}
                  onClick={() => handleCameraView(view)}
                  className="flex-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded text-white/60 hover:text-white text-xs font-bold transition-all duration-200"
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles Section */}
          <div>
            <h3 className="text-white text-xs font-bold mb-3 tracking-wider">DISPLAY</h3>
            <div className="space-y-2">
              {toggles.map((toggle) => (
                <div key={toggle.id} className="flex items-center justify-between">
                  <span className="text-white/70 text-xs">{toggle.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={toggle.default}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sliders Section */}
          <div>
            <h3 className="text-white text-xs font-bold mb-3 tracking-wider">ADJUSTMENTS</h3>
            <div className="space-y-3">
              {sliders.map((slider) => (
                <div key={slider.id} className="flex items-center gap-2">
                  <span className="text-white/60 text-xs w-24">{slider.label}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={slider.default}
                    className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white/50 text-xs w-6">0</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
