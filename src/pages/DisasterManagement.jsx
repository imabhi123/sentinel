import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/chakra-petch';
import Logo from '../assets/Logo.svg';
import sentinelLogo from '../assets/login/sentinelogo.svg';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightProperties from '../components/layout/RightProperties';
import BottomSimulation from '../components/layout/BottomSimulation';

import GlobeView from '../components/simulation/GlobeView';
import SimulationCanvas from '../components/simulation/SimulationCanvas';
import { useFloodSimulation, SOIL_TYPES } from '../hooks/useFloodSimulation';
import {
  fetchDEM, fetchElevation, fetchBuildings, fetchGeocode,
  loadSatelliteTexture, mercatorYFromLat,
  parseCenterCoord, centerToBbox, validateBbox
} from '../api/simulation';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export default function DisasterManagement() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
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
    viscosity: 0.98,
    evaporation: 0.08,
    soilType: 'loam',
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
    <div className="w-screen h-screen bg-[#070b14] text-white relative" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
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
      
      {/* CANVAS BACKGROUND - FULL SCREEN */}
      <div className="absolute inset-0">
        {/* CENTER VIEWPORT - FULL SCREEN */}
        <div className="w-full h-full relative flex flex-col overflow-hidden bg-black">
          <div className="flex-1 relative">
            {viewMode === 'GLOBE' ? (
              <GlobeView />
            ) : (
              <SimulationCanvas
                ref={canvasRef}
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
            
          
          </div>

          {/* BOTTOM LIVE DATA PANEL */}
          {viewMode === 'SIMULATION' && (
            <div className="border-t border-white/10 bg-black p-4">
              <BottomSimulation stats={sim.stats} />
            </div>
          )}
        </div>
      </div>

      {/* HEADER CONTAINER - ABSOLUTELY POSITIONED */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center gap-4 p-4">
        {/* HEADER - LEFT */}
        <div className="h-16 flex-[2.5] flex items-center gap-6 px-6 py-3 border border-white/10 bg-black rounded-xl shadow-2xl">
          <img src={Logo} alt="Logo" className="h-8" />
          <div className="w-px h-8 bg-white/10"></div>
          <img src={sentinelLogo} alt="Sentinel Logo" className="h-8" />
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase ml-auto">
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

        {/* HEADER - RIGHT */}
        <div className="h-16 w-80 flex items-center justify-end gap-3 px-6 py-3 border border-white/10 bg-black rounded-xl shadow-2xl">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] text-white/60 uppercase tracking-wider">
              SELECT A REGION
            </label>
            <input
              type="text"
              placeholder="31.0407° N, 78.7972° E"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLoadArea(); }}
              className="bg-transparent border border-white/20 text-white text-xs py-1 px-3 focus:outline-none focus:border-white/40 rounded"
            />
          </div>
          <input
            type="file"
            id="inp-glb"
            accept=".glb,.gltf,.fbx"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (handleUploadModel && e.target.files[0]) {
                handleUploadModel(e.target.files[0]);
              }
              e.target.value = '';
            }}
          />
          <button 
            onClick={handleLoadArea}
            disabled={loading}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded uppercase transition-colors disabled:opacity-50 whitespace-nowrap h-fit"
          >
            {loading ? 'LOADING...' : 'SIMULATE'}
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR - ABSOLUTELY POSITIONED */}
      <div className="absolute top-24 left-4 w-80 h-[calc(100vh-10rem)] z-30 overflow-hidden">
        <LeftSidebar 
          models={disasterModels} 
          disasterModels={disasterSpecificModels}
          selectedModel={selectedModel} 
          onModelClick={handleModelClick} 
          stats={sim.stats}
          params={simulationParams}
          satData={satData}
          customModel={customModel}
          onSelectAoi={(rect) => canvasRef.current?.focusAoi(rect)}
        />
      </div>

      {/* RIGHT PROPERTIES PANEL - ABSOLUTELY POSITIONED */}
      {showProperties && expandedModel && (
        <div className="absolute top-24 right-4 w-96 h-[calc(100vh-10rem)] z-30 overflow-hidden">
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
    </div>
  );
}
