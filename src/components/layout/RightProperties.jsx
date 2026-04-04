export default function RightProperties({ model }) {
  return (
    <div className="w-80 h-full bg-black/40 border border-white/10 rounded-lg p-6 overflow-y-auto">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <h2 className="text-white/80 text-sm font-bold mb-6 tracking-wider">PROPERTIES</h2>
      
      {model ? (
        <div className="space-y-6">
          {/* Model Name */}
          <div>
            <label className="text-white/60 text-xs font-bold block mb-2">MODEL</label>
            <p className="text-white text-sm px-3 py-2 bg-white/5 rounded border border-white/10">
              {model.name}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="text-white/60 text-xs font-bold block mb-2">STATUS</label>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                model.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <p className="text-white text-sm capitalize">{model.status}</p>
            </div>
          </div>

          {/* Overlay Type */}
          <div>
            <label className="text-white/60 text-xs font-bold block mb-2">OVERLAY</label>
            <p className="text-white text-xs px-3 py-2 bg-white/5 rounded border border-white/10">
              {model.overlayType}
            </p>
          </div>

          {/* Statistics */}
          <div className="pt-4 border-t border-white/10">
            <label className="text-white/60 text-xs font-bold block mb-3">STATISTICS</label>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Coverage</span>
                <span className="text-white">95.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Accuracy</span>
                <span className="text-white">98.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Last Update</span>
                <span className="text-white">2 mins ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Data Points</span>
                <span className="text-white">2.5M</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-2">
            <button className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 rounded text-blue-400 text-xs font-bold transition-colors">
              VIEW DETAILS
            </button>
            <button className="w-full px-3 py-2 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 rounded text-green-400 text-xs font-bold transition-colors">
              START SIMULATION
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-white/40 text-sm">
          Select a model to view properties
        </div>
      )}
    </div>
  );
}
