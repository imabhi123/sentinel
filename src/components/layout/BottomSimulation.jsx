import React from 'react';

/**
 * BottomSimulation — Live data strip only (controls are in RightProperties)
 */
export default function BottomSimulation({ stats }) {
  const phaseColor = stats?.phase === 'IDLE' ? 'text-green-400' : stats?.phase === 'RAIN' ? 'text-blue-400' : 'text-red-400';
  const phaseGlow = stats?.phase === 'FLOOD' ? 'bg-red-500' : stats?.phase === 'RAIN' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="flex items-center gap-8 text-[11px]">
      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${phaseGlow} animate-pulse shadow-lg`} />
        <span className={`font-bold tracking-wider uppercase ${phaseColor}`}>{stats?.phase || 'IDLE'}</span>
      </div>

      {/* Live stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-white/40">Time</span>
          <span className="font-bold text-white">{stats?.time || '00:00'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">Rain</span>
          <span className="font-bold text-white">{stats?.rain || 0} mm/hr</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">Wet Cells</span>
          <span className="font-bold text-white">{(stats?.cells || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">Max Depth</span>
          <span className="font-bold text-orange-400">{(stats?.depth || 0).toFixed(2)} m</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">Area</span>
          <span className="font-bold text-white">
            {(stats?.area || 0) > 1e6
              ? `${((stats?.area || 0) / 1e6).toFixed(2)} km²`
              : `${(stats?.area || 0).toFixed(0)} m²`}
          </span>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-white/30 text-[9px]">Flood Coverage</span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[200px]">
          <div
            className="h-full bg-gradient-to-r from-blue-700 via-cyan-500 to-cyan-300 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(((stats?.cells || 0) / 40000) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
