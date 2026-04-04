export default function LeftSidebar({ models, selectedModel, onModelClick }) {
  return (
    <div className="w-64 h-full bg-black/40 border border-white/10 rounded-lg p-6 overflow-y-auto scrollbar-hide">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <h2 className="text-white/80 text-sm font-bold mb-6 tracking-wider">MODELS</h2>
      
      <div className="space-y-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelClick(model)}
            className={`w-full px-4 py-3 rounded-lg transition-all duration-300 text-left ${
              selectedModel?.id === model.id
                ? 'bg-white/20 border border-white/30'
                : 'bg-transparent border border-transparent hover:bg-white/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                model.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div>
                <p className="text-white text-xs font-bold leading-tight">
                  {model.name}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {model.overlayType}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
