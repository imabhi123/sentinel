import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/chakra-petch';
import Logo from '../assets/Logo.svg';
import sentinelLogo from '../assets/login/sentinelogo.svg';
import Globe from '../assets/login/Globe.svg';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightProperties from '../components/layout/RightProperties';
import BottomSimulation from '../components/layout/BottomSimulation';

export default function DisasterManagement() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(null);
  const [showProperties, setShowProperties] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    rainfall: 0,
    floodSrc: 0,
    viscosity: 0,
    evaporation: 0,
  });

  const disasterModels = [
    { id: 'flood', name: 'FLOOD MODEL', status: 'active', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'hurricane', name: 'HURRICANE/CYCLONE MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'earthquake', name: 'EARTHQUAKE MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'wildfire', name: 'WILDFIRE MODELV', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'tsunami', name: 'TSUNAMI MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'landslide', name: 'LANDSLIDE MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'tornado', name: 'TORNADO MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'industrial', name: 'INDUSTRIAL/CHEMICAL ACCIDENT MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
  ];

  const handleModelClick = (model) => {
    setSelectedModel(model);
    setShowProperties(true);
  };

  const handleParamChange = (param, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleBackClick = () => {
    navigate('/login');
  };

  return (
    <div className="relative w-screen h-screen bg-gray-950 overflow-hidden font-chakra">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black"></div>

      {/* TOP NAVBAR */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-2xl">←</span>
            <span className="text-sm font-bold">DISASTER MANAGEMENT</span>
          </button>
          <div className="flex items-center gap-2 ml-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              LIVE MODULE
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              INACTIVE MODULE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo" className="h-8" />
          <img src={sentinelLogo} alt="Sentinel Logo" className="h-8" />
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="absolute inset-0 top-20 flex gap-4 p-4">
        {/* LEFT SIDEBAR */}
        <LeftSidebar models={disasterModels} selectedModel={selectedModel} onModelClick={handleModelClick} />

        {/* CENTER GLOBE */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={Globe}
              alt="Globe"
              className="w-3/4 h-3/4 object-contain drop-shadow-2xl animate-spin-slow"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))',
                animation: 'spin 20s linear infinite'
              }}
            />
            <style>{`
              @keyframes spin {
                from { transform: rotateY(0deg); }
                to { transform: rotateY(360deg); }
              }
            `}</style>
          </div>
        </div>

        {/* RIGHT PROPERTIES PANEL */}
        {showProperties && <RightProperties model={selectedModel} />}

        {/* BOTTOM SIMULATION PANEL */}
        <BottomSimulation 
          params={simulationParams} 
          onParamChange={handleParamChange} 
        />
      </div>
    </div>
  );
}
