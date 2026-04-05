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
  const [expandedModel, setExpandedModel] = useState(null);
  const [showProperties, setShowProperties] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [simulationParams, setSimulationParams] = useState({
    rainfall: 0,
    floodSrc: 0,
    viscosity: 0,
    evaporation: 0,
  });

  const disasterModels = [
    { id: 'disaster', name: 'DISASTER MANAGEMENT MODEL', status: 'active', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'urban', name: 'URBAN PLANNING MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'encroachment', name: 'ENCROACHMENT MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'cctv', name: 'CCTV STREET VIEW MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'satellite', name: 'SATELLITE MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'weather', name: 'WEATHER MODEL', status: 'active', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'flight', name: 'LIVE FLIGHT MODEL', status: 'active', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'defence', name: 'DEFENCE MODEL', status: 'active', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
  ];

  const disasterSpecificModels = [
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
    if (model === null) {
      // Reset everything
      setSelectedModel(null);
      setExpandedModel(null);
      setShowProperties(false);
    } else if (selectedModel?.id !== model.id) {
      // Different model: select it (STATE 2)
      setSelectedModel({ ...model, liveDataMode: false });
      setExpandedModel(null);
      setShowProperties(false);
    } else {
      // Same model clicked again: enter LIVE DATA view (STATE 3)
      setSelectedModel({ ...model, liveDataMode: true });
      setExpandedModel(model);
      setShowProperties(true);
    }
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
    <div className="relative w-screen h-screen bg-gray-950 overflow-hidden" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
      {/* GLOBAL STYLES */}
      <style>{`
        * {
          font-family: 'Chakra Petch', sans-serif;
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-linear-to-b from-gray-900 via-gray-950 to-black"></div>

      {/* TOP NAVBAR - TWO CARDS LAYOUT */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 gap-4">
        {/* LEFT CARD: LOGOS - WIDE */}
        <div className="flex-1 flex items-center gap-4 bg-black/40 border border-white/10 rounded-lg px-6 py-3 backdrop-blur-sm">
          <img src={Logo} alt="Logo" className="h-8" />
          <div className="w-px h-8 bg-white/20"></div>
          <img src={sentinelLogo} alt="Sentinel Logo" className="h-8" />
        </div>

        {/* RIGHT CARD: SELECT REGION & LOAD AREA - COMPACT */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg px-6 py-3 backdrop-blur-sm whitespace-nowrap">
          <label className="text-white/60 text-xs font-bold">SELECT A REGION</label>
          <input
            type="text"
            placeholder="Enter region or lat, long..."
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-xs placeholder-white/40 focus:outline-none focus:border-white/40 w-56"
          />
          <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors">
            LOAD AREA
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="absolute inset-0 top-20 flex gap-4 p-4">
        {/* LEFT SIDEBAR */}
        <LeftSidebar models={disasterModels} selectedModel={selectedModel} onModelClick={handleModelClick} disasterModels={disasterSpecificModels} />

        {/* CENTER GLOBE & INFO */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {/* TOP CENTER INFO CARD */}
          {/* {expandedModel && (
            <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-center">
                <h3 className="text-white text-sm font-bold mb-2 tracking-wider">{expandedModel.name}</h3>
                <p className="text-white/60 text-xs">{expandedModel.overlayType}</p>
              </div>
            </div>
          )} */}

          {/* GLOBE */}
          <div className="relative w-full flex-1 flex items-center justify-center">
            <img
              src={Globe}
              alt="Globe"
              className="w-3/4 h-3/4 object-contain"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))'
              }}
            />
          </div>

          {/* BOTTOM CENTER INFO CARD */}
          {expandedModel && (
            <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-xs mb-1">Status</p>
                  <p className="text-white text-sm font-bold capitalize">{expandedModel.status}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs mb-1">Scroll to zoom • Drag to pan</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Last Update</p>
                  <p className="text-white text-sm font-bold">LIVE</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PROPERTIES PANEL */}
        {showProperties && expandedModel && <RightProperties model={expandedModel} />}
      </div>
    </div>
  );
}
