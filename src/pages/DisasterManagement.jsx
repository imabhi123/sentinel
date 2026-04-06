import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/chakra-petch';
import Logo from '../assets/Logo.svg';
import sentinelLogo from '../assets/login/sentinelogo.svg';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightProperties from '../components/layout/RightProperties';
import BottomSimulation from '../components/layout/BottomSimulation';

import GlobeView from '../components/simulation/GlobeView';
import SimulationCanvas from '../components/simulation/SimulationCanvas';
import { useFloodSimulation } from '../hooks/useFloodSimulation';
import {
  fetchDEM, fetchElevation, fetchBuildings, fetchGeocode,
  loadSatelliteTexture, mercatorYFromLat,
  parseCenterCoord, centerToBbox, validateBbox
} from '../api/simulation';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export default function DisasterManagement() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(null);
  const [expandedModel, setExpandedModel] = useState(null);
  const [showProperties, setShowProperties] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('31.0407° N, 78.7972° E');
  const [viewMode, setViewMode] = useState('GLOBE');
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [alertText, setAlertText] = useState('');

  const sim = useFloodSimulation();

  // Satellite texture data for canvas
  const [satData, setSatData] = useState(null);
  
  // Custom 3D model data for simulation
  const [customModel, setCustomModel] = useState(null);

  const [simulationParams, setSimulationParams] = useState({
    rainfall: 80,
    floodSrc: 1.0,
    viscosity: 0.65,
    evaporation: 0.08,
    waterAlpha: 0.75,
    forestCanopy: 18,
    buildingLift: 14,
  });

  const showAlert = (msg, dur = 3000) => {
    setAlertText(msg);
    setTimeout(() => setAlertText(''), dur);
  };

  // ---- Scenario handler ----
  const handleScenario = (scenarioId) => {
    switch (scenarioId) {
      case 'startRain': sim.startRain(); showAlert('RAIN STARTED'); break;
      case 'triggerFlood': sim.triggerFlood(); showAlert('FLOOD WARNING'); break;
      case 'damBreak': sim.damBreak(); showAlert('!! DAM BREAK !!'); break;
      case 'rainOnly': sim.rainOnly(); break;
      case 'reset': sim.resetSim(); break;
      default: break;
    }
  };

  const handleFastForward = (mins) => {
    if (!sim.simRunning.current) {
      showAlert('START SIMULATION FIRST', 2000);
      return;
    }
    sim.fastForward(mins);
    showAlert(`FAST-FORWARDING +${mins} MIN...`, 3000);
  };

  const handleParamChange = (param, value) => {
    setSimulationParams(prev => ({ ...prev, [param]: value }));
    sim.setParam(param, value);
  };


  // ================================================================
  //  LOAD REGION — calls the same APIs as flood-simulation.html
  // ================================================================
  const handleLoadArea = async () => {
    // Parse coordinates from input
    const coord = parseCenterCoord(selectedRegion);
    if (!coord) {
      showAlert('Invalid coordinates. Use format: 31.0407° N, 78.7972° E', 3000);
      return;
    }
    const bbox = centerToBbox(coord.lat, coord.lon);
    if (!validateBbox(bbox)) {
      showAlert('Invalid bounding box', 3000);
      return;
    }

    setLoading(true);

    try {
      // 1) Fetch DEM heights (same as /api/dem in original)
      let heights;
      try {
        const demData = await fetchDEM(bbox);
        heights = demData.heights;
      } catch (e) {
        console.warn('DEM API failed, trying elevation API...', e);
        try {
          const elevData = await fetchElevation(bbox);
          heights = elevData.heights;
        } catch (e2) {
          console.warn('Elevation API also failed, using procedural terrain', e2);
          sim.generateTerrain();
          setViewMode('SIMULATION');
          setLoading(false);
          showAlert('Using procedural terrain (API unavailable)', 3000);
          return;
        }
      }

      // 2) Apply DEM heights to simulation
      sim.initTerrain(heights);
      sim.resetSim();
      setViewMode('SIMULATION');

      // 3) Fetch location name (async, non-blocking)
      fetchGeocode(coord.lat, coord.lon).then(data => {
        const name = data?.display_name || `${coord.lat.toFixed(2)}°, ${coord.lon.toFixed(2)}°`;
        setLocationName(name);
        showAlert(`TERRAIN LOADED – ${name}`, 2200);
      }).catch(() => {
        setLocationName(`${coord.lat.toFixed(2)}°, ${coord.lon.toFixed(2)}°`);
        showAlert('TERRAIN LOADED', 2200);
      });

      // 4) Load satellite texture (async, non-blocking)
      loadSatelliteTexture(bbox).then(result => {
        if (result && result.canvas) {
          setSatData({
            canvas: result.canvas,
            tileBounds: result.tileBounds,
            bbox: bbox,
            mercTileNorth: mercatorYFromLat(result.tileBounds.north),
            mercTileSouth: mercatorYFromLat(result.tileBounds.south),
          });
          showAlert('Satellite imagery applied', 1800);
        }
      }).catch(() => {});

      // 5) Fetch buildings (async, non-blocking)
      fetchBuildings(bbox).then(data => {
        if (data?.elements?.length > 0) {
          showAlert(`${data.elements.length} buildings loaded`, 1500);
        }
      }).catch(() => {});

    } catch (err) {
      console.error('Load area failed:', err);
      showAlert('Load failed: ' + err.message, 4000);
    } finally {
      setLoading(false);
    }
  };

  // ---- Model lists ----
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
    { id: 'wildfire', name: 'WILDFIRE MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'tsunami', name: 'TSUNAMI MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'landslide', name: 'LANDSLIDE MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'tornado', name: 'TORNADO MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
    { id: 'industrial', name: 'INDUSTRIAL/CHEMICAL ACCIDENT MODEL', status: 'inactive', overlayType: 'NOAA NEXRAD (Globe Overlay)' },
  ];

  const handleModelClick = (model) => {
    if (model === null) {
      setSelectedModel(null); setExpandedModel(null); setShowProperties(false);
    } else if (selectedModel?.id !== model.id) {
      setSelectedModel({ ...model, liveDataMode: false });
      setExpandedModel(null); setShowProperties(false);
    } else {
      setSelectedModel({ ...model, liveDataMode: true });
      setExpandedModel(model); setShowProperties(true);
      if (model.id === 'flood') handleLoadArea();
    }
  };

  const handleUploadModel = async (file) => {
    const url = URL.createObjectURL(file);
    const format = file.name.substring(file.name.lastIndexOf('.') + 1).toUpperCase();
    try {
      if (format === 'FBX') {
        const loader = new FBXLoader();
        const fbx = await loader.loadAsync(url);
        fbx.rotation.z = Math.PI / 2;
        const processed = sim.applyTerrainFromModel(fbx);
        setCustomModel(processed);
      } else if (format === 'GLB' || format === 'GLTF') {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(url);
        gltf.scene.rotation.x = 0;
        const processed = sim.applyTerrainFromModel(gltf.scene);
        setCustomModel(processed);
      }
    } catch (err) {
      console.error('Error loading custom model:', err);
      alert(`GLB/FBX Load Failed: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#070b14] flex flex-col text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
      <style>{`* { font-family: 'Chakra Petch', sans-serif; }`}</style>

      {/* ALERT OVERLAY */}
      {alertText && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="text-4xl font-black tracking-wider text-cyan-400 animate-pulse"
               style={{ textShadow: '0 0 40px rgba(0,180,216,0.9)' }}>
            {alertText}
          </div>
        </div>
      )}
      
      {/* HEADER BAR */}
      <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-6">
          <img src={Logo} alt="Logo" className="h-8" />
          <div className="w-px h-8 bg-white/10"></div>
          <img src={sentinelLogo} alt="Sentinel Logo" className="h-8" />
          <div className="ml-10 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
            <span>Dashboard</span>
            <span>{'>'}</span>
            <span>Disaster Management</span>
            {expandedModel && (
              <>
                <span>{'>'}</span>
                <span className="text-white/80">{expandedModel.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-4">
            <label className="text-[10px] font-bold text-white/40 whitespace-nowrap">CENTER COORDS</label>
            <input
              type="text"
              placeholder="e.g. 31.0407° N, 78.7972° E"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLoadArea(); }}
              className="bg-transparent border-b border-white/20 text-white text-xs py-1 focus:outline-none focus:border-white/40 w-64"
            />
            <button onClick={() => document.getElementById('inp-glb').click()}
              className="flex-1 py-1.5 border border-white/20 rounded text-cyan-400 font-bold hover:bg-white/10 transition-colors uppercase text-[9px] tracking-widest"
            >Upload GLB / FBX</button>
            <input type="file" id="inp-glb" accept=".glb,.gltf,.fbx" style={{ display: 'none' }}
              onChange={(e) => {
                if (handleUploadModel && e.target.files[0]) {
                  handleUploadModel(e.target.files[0]);
                }
                e.target.value = ''; // Reset input to allow re-uploading the same file
              }} />
            <button 
              onClick={handleLoadArea}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded uppercase transition-colors disabled:opacity-50"
            >
              {loading ? 'LOADING...' : 'LOAD REGION & SIMULATE'}
            </button>
          </div>
          {locationName && (
            <span className="text-[10px] text-cyan-400 font-bold tracking-wider max-w-[200px] truncate" title={locationName}>
              📍 {locationName}
            </span>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* LEFT SIDEBAR */}
        <div className="w-80 flex flex-col h-full overflow-hidden">
          <LeftSidebar 
            models={disasterModels} 
            disasterModels={disasterSpecificModels}
            selectedModel={selectedModel} 
            onModelClick={handleModelClick} 
            stats={sim.stats}
            params={simulationParams}
          />
        </div>

        {/* CENTER VIEWPORT */}
        <div className="flex-1 relative flex flex-col h-full overflow-hidden bg-black/40 border border-white/5 rounded-xl shadow-2xl">
          <div className="flex-1 relative">
            {viewMode === 'GLOBE' ? (
              <GlobeView />
            ) : (
              <SimulationCanvas
                terrainH={sim.terrainH}
                groundH={sim.groundH}
                waterH={sim.waterH}
                velX={sim.velX}
                velZ={sim.velZ}
                simRunning={sim.simRunning}
                simPhase={sim.simPhase}
                tick={sim.tick}
                updateStats={sim.updateStats}
                stats={sim.stats}
                config={simulationParams}
                satData={satData}
                terrainVersion={sim.terrainVersion}
                customModel={customModel}
              />
            )}
            
            {viewMode === 'SIMULATION' && (
              <button 
                onClick={() => { sim.resetSim(); setViewMode('GLOBE'); setSatData(null); setCustomModel(null); }}
                className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/60 hover:bg-black/80 border border-white/20 rounded text-[10px] font-bold tracking-widest backdrop-blur-md transition-all active:scale-95"
              >
                ← BACK TO GLOBE
              </button>
            )}
          </div>

          {/* BOTTOM LIVE DATA PANEL */}
          {viewMode === 'SIMULATION' && (
            <div className="border-t border-white/10 bg-black/60 backdrop-blur-xl p-4">
              <BottomSimulation stats={sim.stats} />
            </div>
          )}
        </div>

        {/* RIGHT PROPERTIES PANEL */}
        {showProperties && expandedModel && (
          <div className="w-96 flex h-full overflow-hidden">
            <RightProperties 
              model={expandedModel} 
              params={simulationParams} 
              onParamChange={handleParamChange}
              onScenario={handleScenario}
              onFastForward={handleFastForward}
              stats={sim.stats}
            />
          </div>
        )}
      </main>
    </div>
  );
}
