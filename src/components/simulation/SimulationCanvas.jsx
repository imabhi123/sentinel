import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { N, CELLS, WORLD, CELL, TMAX } from '../../hooks/useFloodSimulation';

// ================================================================
//  SimulationCanvas — Full port of flood-simulation.html's Three.js
//  renderer including: terrain mesh, water mesh with double-buffering,
//  3D rain particles, sky dome, fog, border box, camera system,
//  advanced shaders (fresnel, foam, specular for water).
// ================================================================

const SimulationCanvas = ({
    terrainH, groundH, waterH, velX, velZ,
    simRunning, simPhase, tick, updateStats, stats, config, satData, terrainVersion, customModel
}) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const waterMeshRef = useRef(null);
    const terrainMeshRef = useRef(null);
    const rainMeshRef = useRef(null);
    const skyMatRef = useRef(null);
    const rafRef = useRef(null);
    const initDone = useRef(false);
    
    // Live reference to the latest config properties for the animation loop
    const configRef = useRef(config);
    useEffect(() => {
        configRef.current = config;
    }, [config]);

    // Camera state
    const camRef = useRef({
        th: 0.55, ph: 0.38, dist: 1800,
        tgt: new THREE.Vector3(0, 30, 0),
        isDrag: false, lastMX: 0, lastMY: 0,
    });

    // CPU-owned geometry arrays (double-buffer approach from original)
    const _wPos = useRef(new Float32Array((N + 1) * (N + 1) * 3));
    const _wDep = useRef(new Float32Array((N + 1) * (N + 1)));
    const _wSpd = useRef(new Float32Array((N + 1) * (N + 1)));

    // FPS counter
    const fpsRef = useRef({ buf: [], lastRT: performance.now() });

    // Stats throttle
    const statsTimer = useRef(0);

    const updateCam = useCallback(() => {
        const cam = camRef.current, camera = cameraRef.current;
        if (!camera) return;
        camera.position.set(
            cam.tgt.x + cam.dist * Math.sin(cam.ph) * Math.sin(cam.th),
            cam.tgt.y + cam.dist * Math.cos(cam.ph),
            cam.tgt.z + cam.dist * Math.sin(cam.ph) * Math.cos(cam.th)
        );
        camera.lookAt(cam.tgt);
    }, []);

    // Camera presets
    const setCameraPreset = useCallback((preset) => {
        const cam = camRef.current;
        switch (preset) {
            case 'TOP DOWN': cam.th = 0; cam.ph = 0.06; cam.dist = 2500; break;
            case 'ISOMETRIC': cam.th = 0.55; cam.ph = 0.38; cam.dist = 1800; break;
            case 'CLOSE FLY': cam.th = 0.7; cam.ph = 0.22; cam.dist = 700; break;
            default: break;
        }
        updateCam();
    }, [updateCam]);

    // ================================================================
    //  WATER HEIGHT HELPERS (bilinear interpolation from original)
    // ================================================================
    const getSurfaceHeightAtVertex = useCallback((vx, vz) => {
        const gH = groundH || terrainH;
        const x0 = Math.max(0, vx - 1), x1 = Math.min(N - 1, vx);
        const z0 = Math.max(0, vz - 1), z1 = Math.min(N - 1, vz);
        const t00 = gH[z0 * N + x0] + waterH[z0 * N + x0];
        const t10 = gH[z0 * N + x1] + waterH[z0 * N + x1];
        const t01 = gH[z1 * N + x0] + waterH[z1 * N + x0];
        const t11 = gH[z1 * N + x1] + waterH[z1 * N + x1];
        const wx = (vx <= 0 ? 0 : (vx >= N ? 1 : 0.5));
        const wz = (vz <= 0 ? 0 : (vz >= N ? 1 : 0.5));
        let h = (1 - wx) * (1 - wz) * t00 + wx * (1 - wz) * t10 + (1 - wx) * wz * t01 + wx * wz * t11;
        if (!Number.isFinite(h)) h = 0;
        if (h > 10000) h = 10000;
        return h;
    }, [terrainH, groundH, waterH]);

    const getWaterDepthAtVertex = useCallback((vx, vz) => {
        const x0 = Math.max(0, vx - 1), x1 = Math.min(N - 1, vx);
        const z0 = Math.max(0, vz - 1), z1 = Math.min(N - 1, vz);
        const wx = (vx <= 0 ? 0 : (vx >= N ? 1 : 0.5));
        const wz = (vz <= 0 ? 0 : (vz >= N ? 1 : 0.5));
        const w00 = waterH[z0 * N + x0], w10 = waterH[z0 * N + x1];
        const w01 = waterH[z1 * N + x0], w11 = waterH[z1 * N + x1];
        let d = (1 - wx) * (1 - wz) * w00 + wx * (1 - wz) * w10 + (1 - wx) * wz * w01 + wx * wz * w11;
        if (!Number.isFinite(d)) d = 0;
        if (d > 1000) d = 1000;
        return d;
    }, [waterH]);

    // ================================================================
    //  UPDATE WATER GEOMETRY (double-buffer, from original)
    // ================================================================
    const updateWaterGeom = useCallback(() => {
        const waterMesh = waterMeshRef.current;
        if (!waterMesh) return;
        const wP = _wPos.current, wD = _wDep.current, wS = _wSpd.current;

        for (let z = 0; z <= N; z++) {
            for (let x = 0; x <= N; x++) {
                const i = z * (N + 1) + x;
                wP[i * 3 + 1] = getSurfaceHeightAtVertex(x, z);
                wD[i] = getWaterDepthAtVertex(x, z);
                const cx = Math.max(0, Math.min(N - 1, x === N ? N - 1 : x));
                const cz = Math.max(0, Math.min(N - 1, z === N ? N - 1 : z));
                const idx = cz * N + cx;
                wS[i] = Math.sqrt(velX[idx] * velX[idx] + velZ[idx] * velZ[idx]);
            }
        }

        const posAttr = waterMesh.geometry.getAttribute('position');
        const depAttr = waterMesh.geometry.getAttribute('depth');
        const spdAttr = waterMesh.geometry.getAttribute('speed');
        posAttr.array.set(wP);
        depAttr.array.set(wD);
        if (spdAttr) spdAttr.array.set(wS);
        posAttr.needsUpdate = true;
        depAttr.needsUpdate = true;
        if (spdAttr) spdAttr.needsUpdate = true;
    }, [getSurfaceHeightAtVertex, getWaterDepthAtVertex, velX, velZ]);

    // ================================================================
    //  RAIN 3D PARTICLES
    // ================================================================
    const spawnRain = useCallback((n) => {
        const scene = sceneRef.current;
        if (!scene) return;
        if (rainMeshRef.current) {
            scene.remove(rainMeshRef.current);
            rainMeshRef.current.geometry.dispose();
            rainMeshRef.current.material.dispose();
        }
        const count = Math.max(Math.floor(n * 200), 1000);
        const rainPos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            rainPos[i * 3] = (Math.random() - 0.5) * WORLD;
            rainPos[i * 3 + 1] = 300 + Math.random() * 600;
            rainPos[i * 3 + 2] = (Math.random() - 0.5) * WORLD;
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        const mat = new THREE.PointsMaterial({ color: 0x99ebff, size: 0.16, transparent: true, opacity: 0.7 });
        const mesh = new THREE.Points(geom, mat);
        scene.add(mesh);
        rainMeshRef.current = mesh;
        rainMeshRef.current._count = count;
    }, []);

    const updateRain3D = useCallback((dt) => {
        const rain = rainMeshRef.current;
        if (!rain || !rain.geometry) return;
        const arr = rain.geometry.getAttribute('position').array;
        const maxCount = rain._count || arr.length / 3;
        
        // Only show rain during rain/flood phases
        const phase = simPhase?.current || 'idle';
        const isRaining = phase === 'rain' || phase === 'flood';
        
        const rRate = configRef.current?.rainfall || 80;
        // Scale visible particles: at 80mm/hr show ~50%, at 500mm/hr show 100%
        let visibleCount = isRaining ? Math.min(maxCount, Math.max(1000, Math.floor(rRate * 40 + 50) * 200)) : 0;
        if (visibleCount > maxCount) visibleCount = maxCount;
        rain.geometry.setDrawRange(0, visibleCount);
        rain.visible = isRaining;

        if (!isRaining) return;

        // Higher rainfall = faster drop speed
        const dropSpeed = 80 + (rRate / 500) * 200;
        for (let i = 0; i < visibleCount; i++) {
            arr[i * 3 + 1] -= dropSpeed * dt;
            if (arr[i * 3 + 1] < 2) {
                arr[i * 3] = (Math.random() - 0.5) * WORLD;
                arr[i * 3 + 1] = 300 + Math.random() * 200;
                arr[i * 3 + 2] = (Math.random() - 0.5) * WORLD;
            }
        }
        rain.geometry.getAttribute('position').needsUpdate = true;
    }, [simPhase]);

    // ================================================================
    //  SCENE INIT (runs once)
    // ================================================================
    useEffect(() => {
        if (initDone.current) return;
        initDone.current = true;
        const container = containerRef.current;
        if (!container) return;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        const cw = Math.max(container.clientWidth, 10);
        const ch = Math.max(container.clientHeight, 10);
        renderer.setSize(cw, ch);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        // attach to DOM
        if (container.lastChild) container.removeChild(container.lastChild);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x07101e);
        scene.fog = new THREE.FogExp2(0x07101e, 0.00032);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(65, cw / ch, 0.5, 8000);
        cameraRef.current = camera;

        // Lights (exact match from original)
        scene.add(new THREE.AmbientLight(0xffffff, 20));
        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.0));

        const makeSun = (x, y, z) => {
            const s = new THREE.DirectionalLight(0xfff5e0, 3);
            s.position.set(x, y, z);
            s.castShadow = true;
            s.shadow.mapSize.width = s.shadow.mapSize.height = 2048;
            s.shadow.camera.far = 4000;
            scene.add(s);
        };
        makeSun(100, 300, 600); makeSun(-100, 300, -600);
        makeSun(100, 300, -600); makeSun(-100, 300, 600);

        const fill = new THREE.DirectionalLight(0x4477aa, 0.4);
        fill.position.set(-400, 300, -400); scene.add(fill);
        const fillBack = new THREE.DirectionalLight(0xb8d4e8, 0.7);
        fillBack.position.set(-500, -200, -600); scene.add(fillBack);

        // Sky dome
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            uniforms: { uRain: { value: 0.0 } },
            vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
            fragmentShader: 'uniform float uRain;varying vec3 vP;void main(){float t=normalize(vP).y*0.5+0.5;vec3 top=mix(vec3(0.02,0.05,0.14),vec3(0.01,0.03,0.07),uRain);vec3 bot=mix(vec3(0.06,0.18,0.36),vec3(0.03,0.08,0.18),uRain);gl_FragColor=vec4(mix(bot,top,t*t),1.0);}'
        });
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(4000, 16, 8), skyMat));
        skyMatRef.current = skyMat;

        // Grid + Axes helpers
        scene.add(new THREE.AxesHelper(2000));
        scene.add(new THREE.GridHelper(2000, 20, 0x444444, 0x222222));

        // ---- BUILD TERRAIN MESH ----
        const tVerts = new Float32Array((N + 1) * (N + 1) * 3);
        const tUvs = new Float32Array((N + 1) * (N + 1) * 2);
        const tIdx = [];
        const co = WORLD * 0.5;
        for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) {
            const i = z * (N + 1) + x;
            const gx = Math.min(x, N - 1), gz = Math.min(z, N - 1);
            tVerts[i * 3] = x * CELL - co;
            tVerts[i * 3 + 1] = terrainH ? terrainH[gz * N + gx] : 0;
            tVerts[i * 3 + 2] = z * CELL - co;
            tUvs[i * 2] = x / N; tUvs[i * 2 + 1] = z / N;
        }
        for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
            const a = z * (N + 1) + x, b = a + 1, c = a + (N + 1), d = c + 1;
            tIdx.push(a, c, b, b, c, d);
        }
        const terrainGeom = new THREE.BufferGeometry();
        terrainGeom.setAttribute('position', new THREE.BufferAttribute(tVerts, 3));
        terrainGeom.setAttribute('uv', new THREE.BufferAttribute(tUvs, 2));
        terrainGeom.setIndex(tIdx);
        terrainGeom.computeVertexNormals();

        const tMat = new THREE.ShaderMaterial({
            uniforms: {
                uTMax: { value: TMAX },
                uOpacity: { value: 1.0 },
                uVegetationLift: { value: 18.0 },
                uBuildingLift: { value: 14.0 },
                uSatellite: { value: null },
                uUseSatellite: { value: 0.0 },
                uBboxWest: { value: 0 }, uBboxEast: { value: 1 },
                uBboxSouth: { value: 0 }, uBboxNorth: { value: 1 },
                uTileWest: { value: 0 }, uTileEast: { value: 1 },
                uTileSouth: { value: 0 }, uTileNorth: { value: 1 },
                uMercTileNorth: { value: 0 }, uMercTileSouth: { value: 1 }
            },
            vertexShader: [
                'uniform float uTMax,uUseSatellite,uVegetationLift,uBuildingLift;',
                'uniform float uBboxWest,uBboxEast,uBboxSouth,uBboxNorth;',
                'uniform float uTileWest,uTileEast,uTileSouth,uTileNorth;',
                'uniform float uMercTileNorth,uMercTileSouth;',
                'uniform sampler2D uSatellite;',
                'varying vec3 vWP,vN;varying float vH;varying vec2 vUv;',
                'void main(){',
                '  vUv=uv;',
                '  float lift=0.0;',
                '  if(uUseSatellite>0.5){',
                '    float lon=uBboxWest+uv.x*(uBboxEast-uBboxWest);',
                '    float lat=uBboxSouth+uv.y*(uBboxNorth-uBboxSouth);',
                '    float su=(lon-uTileWest)/(uTileEast-uTileWest);',
                '    float latRad=lat*0.01745329;',
                '    float mercLat=log(tan(0.78539816+latRad*0.5));',
                '    float mercRange=uMercTileNorth-uMercTileSouth;',
                '    float sv=(mercRange>0.0001)?((uMercTileNorth-mercLat)/mercRange):(1.0-uv.y);',
                '    vec3 sat=texture2D(uSatellite,vec2(su,clamp(sv,0.0,1.0))).rgb;',
                '    float mx=max(sat.r,sat.b);',
                '    float veg=smoothstep(-0.02,0.14,sat.g-mx);',
                '    veg*=smoothstep(0.12,0.42,sat.g/(mx+0.08));',
                '    float mn=min(sat.r,min(sat.g,sat.b));',
                '    float mx3=max(sat.r,max(sat.g,sat.b));',
                '    float chroma=mx3-mn;',
                '    float lum=dot(sat,vec3(0.299,0.587,0.114));',
                '    float bld=smoothstep(0.11,0.03,chroma)*smoothstep(0.19,0.52,lum);',
                '    bld*=smoothstep(0.07,-0.05,sat.g-mx);',
                '    bld*=1.0-smoothstep(0.18,0.48,veg);',
                '    lift=uVegetationLift*veg*veg+uBuildingLift*bld*bld;',
                '  }else{',
                '    float t=clamp(position.y/uTMax,0.0,1.0);',
                '    float veg=smoothstep(0.12,0.48,t)*(1.0-smoothstep(0.58,0.92,t));',
                '    float bproc=smoothstep(0.35,0.55,t)*smoothstep(0.88,0.62,t)*(1.0-smoothstep(0.2,0.55,veg));',
                '    lift=uVegetationLift*0.4*veg+uBuildingLift*0.22*bproc;',
                '  }',
                '  vec3 pos=position+vec3(0.0,lift,0.0);',
                '  vWP=(modelMatrix*vec4(pos,1.0)).xyz;',
                '  vN=normalize(normalMatrix*normal); vH=pos.y;',
                '  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform float uTMax,uOpacity,uUseSatellite;',
                'uniform sampler2D uSatellite;',
                'uniform float uBboxWest,uBboxEast,uBboxSouth,uBboxNorth;',
                'uniform float uTileWest,uTileEast,uTileSouth,uTileNorth;',
                'uniform float uMercTileNorth,uMercTileSouth;',
                'varying vec3 vWP,vN; varying float vH; varying vec2 vUv;',
                'void main(){',
                '  float t=clamp(vH/uTMax,0.0,1.0); vec3 col;',
                '  if(t<0.2) col=mix(vec3(0.13,0.19,0.10),vec3(0.22,0.40,0.14),t/0.2);',
                '  else if(t<0.55) col=mix(vec3(0.22,0.40,0.14),vec3(0.40,0.36,0.28),(t-0.2)/0.35);',
                '  else col=mix(vec3(0.40,0.36,0.28),vec3(0.72,0.70,0.66),(t-0.55)/0.45);',
                '  col*=0.35+0.65*max(0.15,dot(vN,normalize(vec3(0.5,0.9,0.4))));',
                '  col*=0.93+0.07*fract(sin(dot(floor(vWP.xz*0.06),vec2(127.1,311.7)))*43758.5);',
                '  if(uUseSatellite>0.5){',
                '    float lonFrac=(vUv.x*(uBboxEast-uBboxWest)+uBboxWest-uTileWest)/(uTileEast-uTileWest);',
                '    float lat=vUv.y*(uBboxNorth-uBboxSouth)+uBboxSouth;',
                '    float mercY=log(tan(3.14159265/4.0+lat*3.14159265/360.0));',
                '    float latFrac=(mercY-uMercTileSouth)/(uMercTileNorth-uMercTileSouth);',
                '    vec3 satCol=texture2D(uSatellite,vec2(lonFrac,1.0-latFrac)).rgb;',
                '    col=mix(col,satCol,uUseSatellite);',
                '  }',
                '  gl_FragColor=vec4(col,uOpacity);',
                '}'
            ].join('\n'),
            side: THREE.FrontSide, transparent: true
        });
        const terrainMesh = new THREE.Mesh(terrainGeom, tMat);
        terrainMesh.receiveShadow = true;
        scene.add(terrainMesh);
        terrainMeshRef.current = terrainMesh;

        // ---- BUILD WATER MESH (with double-buffer) ----
        const wPos = _wPos.current, wDep = _wDep.current, wSpd = _wSpd.current;
        const wUvs = new Float32Array((N + 1) * (N + 1) * 2);
        const wIdx = [];
        for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) {
            const i = z * (N + 1) + x;
            wPos[i * 3] = x * CELL - co;
            wPos[i * 3 + 1] = 0;
            wPos[i * 3 + 2] = z * CELL - co;
            wUvs[i * 2] = x / N; wUvs[i * 2 + 1] = z / N;
            wDep[i] = 0; wSpd[i] = 0;
        }
        for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
            const a = z * (N + 1) + x, b = a + 1, c = a + (N + 1), d = c + 1;
            wIdx.push(a, c, b, b, c, d);
        }
        const waterGeom = new THREE.BufferGeometry();
        const posAttr = new THREE.BufferAttribute(wPos.slice(), 3);
        const depAttr = new THREE.BufferAttribute(wDep.slice(), 1);
        const spdAttr = new THREE.BufferAttribute(wSpd.slice(), 1);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        depAttr.setUsage(THREE.DynamicDrawUsage);
        spdAttr.setUsage(THREE.DynamicDrawUsage);
        waterGeom.setAttribute('position', posAttr);
        waterGeom.setAttribute('uv', new THREE.BufferAttribute(wUvs, 2));
        waterGeom.setAttribute('depth', depAttr);
        waterGeom.setAttribute('speed', spdAttr);
        waterGeom.setIndex(wIdx);

        const wMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uAlpha: { value: 0.75 },
                uSun: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() }
            },
            vertexShader: [
                'attribute float depth; attribute float speed;',
                'varying float vD; varying vec3 vWP; varying vec2 vUv; varying vec3 vWaveN; varying float vS;',
                'uniform float uTime;',
                'void main(){',
                '  vD=depth; vUv=uv; vS=speed;',
                '  float wave=0.0; float dWaveDx=0.0, dWaveDz=0.0;',
                '  if(depth>0.005){',
                '    float d=min(depth,2.0); float r=min(depth,0.5);',
                '    float k1=0.06,k2=0.055,k3=0.04,k4=0.18,k5=0.16;',
                '    float ph1=position.x*k1+uTime*1.2, ph2=position.z*k2+uTime*0.95+1.0, ph3=(position.x+position.z)*k3+uTime*1.5;',
                '    float ph4=position.x*k4+uTime*2.1, ph5=position.z*k5+uTime*1.8;',
                '    wave=sin(ph1)*0.22*d+cos(ph2)*0.18*d+sin(ph3)*0.12*d+sin(ph4)*0.08*r+cos(ph5)*0.06*r;',
                '    dWaveDx=k1*cos(ph1)*0.22*d+k3*cos(ph3)*0.12*d+k4*cos(ph4)*0.08*r;',
                '    dWaveDz=-k2*sin(ph2)*0.18*d+k3*cos(ph3)*0.12*d-k5*sin(ph5)*0.06*r;',
                '  }',
                '  vec3 p=position; p.y+=wave;',
                '  vWaveN=normalize(vec3(-dWaveDx,1.0,-dWaveDz));',
                '  vWP=(modelMatrix*vec4(p,1.0)).xyz;',
                '  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform float uTime,uAlpha; uniform vec3 uSun;',
                'varying float vD; varying vec3 vWP; varying vec2 vUv; varying vec3 vWaveN; varying float vS;',
                'void main(){',
                '  if(vD<0.02) discard;',
                '  float t=clamp(vD/3.0,0.0,1.0);',
                '  vec3 col=t<0.35?mix(vec3(0.5,0.85,0.95),vec3(0.0,0.65,0.82),t/0.35):mix(vec3(0.0,0.65,0.82),vec3(0.0,0.15,0.35),(t-0.35)/0.65);',
                '  vec3 viewDir=normalize(cameraPosition-vWP);',
                '  vec3 nrm=normalize(vWaveN);',
                '  float NdotV=max(0.0,dot(nrm,viewDir));',
                '  float fresnel=pow(1.0-NdotV,3.5);',
                '  col+=vec3(1.0,0.98,0.95)*pow(max(0.0,dot(nrm,normalize(uSun+viewDir*0.3))),80.0)*0.7;',
                '  col=mix(col,vec3(1.0,1.0,1.0),fresnel*0.35);',
                '  float foam=0.0; if(vD>0.01&&vD<0.35) foam=exp(-vD*8.0)*(0.35+0.25*sin(vWP.x*2.0+uTime*4.0)*cos(vWP.z*2.0+uTime*3.0));',
                '  foam+=clamp(vS*0.06,0.0,0.55)*(0.25+0.25*sin(vWP.x*1.5+uTime*2.2)*sin(vWP.z*1.3+uTime*2.0));',
                '  col=mix(col,vec3(1.0,1.0,1.0),foam);',
                '  col+=sin(vWP.x*0.4+uTime*2.5)*cos(vWP.z*0.4+uTime*2.0)*0.03*clamp(t,0.0,0.4);',
                '  float alpha=clamp(uAlpha*(0.4+0.6*t)+fresnel*0.25+foam*0.5,0.0,1.0);',
                '  gl_FragColor=vec4(col,alpha);',
                '}'
            ].join('\n'),
            transparent: true, depthWrite: false, side: THREE.FrontSide, blending: THREE.NormalBlending
        });

        const waterMesh = new THREE.Mesh(waterGeom, wMat);
        waterMesh.renderOrder = 1;
        scene.add(waterMesh);
        waterMeshRef.current = waterMesh;

        // ---- Camera initial position ----
        updateCam();

        // ---- Mouse / wheel handlers ----
        const onMouseDown = (e) => {
            camRef.current.isDrag = true;
            camRef.current.lastMX = e.clientX;
            camRef.current.lastMY = e.clientY;
        };
        const onMouseUp = () => { camRef.current.isDrag = false; };
        const onMouseMove = (e) => {
            if (!camRef.current.isDrag) return;
            const cam = camRef.current;
            cam.th += (e.clientX - cam.lastMX) * 0.005;
            cam.ph = Math.max(0.05, Math.min(Math.PI * 0.47, cam.ph + (e.clientY - cam.lastMY) * 0.005));
            cam.lastMX = e.clientX; cam.lastMY = e.clientY;
            updateCam();
        };
        const onWheel = (e) => {
            camRef.current.dist = Math.max(50, Math.min(5000, camRef.current.dist + e.deltaY * 0.9));
            updateCam();
        };

        renderer.domElement.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('wheel', onWheel);

        // ---- Resize observer ----
        const ro = new ResizeObserver(() => {
            if (!container) return;
            const w = container.clientWidth, h = container.clientHeight;
            if (w === 0 || h === 0) return;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            renderer.render(scene, camera);
        });
        ro.observe(container);

        // ---- ANIMATION LOOP ----
        let lastT = performance.now();
        let simAcc = 0;
        let hasSpawnedRain = false;

        const animate = (now) => {
            rafRef.current = requestAnimationFrame(animate);
            const dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;

            // Spawn rain when sim starts
            if (simRunning?.current && !hasSpawnedRain) {
                spawnRain(500);  // allocate max buffer (100k particles)
                hasSpawnedRain = true;
            }
            if (!simRunning?.current && hasSpawnedRain) {
                // Remove rain on reset
                if (rainMeshRef.current) {
                    scene.remove(rainMeshRef.current);
                    rainMeshRef.current.geometry.dispose();
                    rainMeshRef.current.material.dispose();
                    rainMeshRef.current = null;
                }
                hasSpawnedRain = false;
            }

            // Physics tick
            if (tick && simRunning?.current) {
                simAcc += dt;
                const subDT = 0.14;
                while (simAcc >= subDT) {
                    tick(subDT);
                    simAcc -= subDT;
                }
            }

            // Update water geometry
            if (waterMeshRef.current && terrainH) {
                updateWaterGeom();
                waterMeshRef.current.material.uniforms.uTime.value = now * 0.001;
            }

            // Update water alpha from config
            if (waterMeshRef.current && configRef.current) {
                const alpha = configRef.current.waterAlpha != null ? configRef.current.waterAlpha : 0.75;
                waterMeshRef.current.material.uniforms.uAlpha.value = alpha;
            }

            // Update terrain uniforms
            if (terrainMeshRef.current && configRef.current) {
                const u = terrainMeshRef.current.material.uniforms;
                if (configRef.current.forestCanopy != null) u.uVegetationLift.value = configRef.current.forestCanopy;
                if (configRef.current.buildingLift != null) u.uBuildingLift.value = configRef.current.buildingLift;
            }

            // Sky darkening during rain
            if (skyMatRef.current && simPhase) {
                const phase = simPhase.current;
                skyMatRef.current.uniforms.uRain.value =
                    (phase === 'rain' || phase === 'flood') ? Math.min(1, (phaseTimerObj.current || 0) / 12) : 0;
            }

            // Rain particles
            if (rainMeshRef.current) updateRain3D(dt);

            // Stats (throttled)
            statsTimer.current += dt;
            if (statsTimer.current >= 0.25 && updateStats) {
                statsTimer.current = 0;
                updateStats();
            }

            renderer.render(scene, camera);
        };

        rafRef.current = requestAnimationFrame(animate);

        // phaseTimer ref for skyMat
        const phaseTimerObj = { current: 0 };

        return () => {
            initDone.current = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('wheel', onWheel);
            renderer.dispose();
            if (container && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Update terrain when heights change ----
    useEffect(() => {
        if (terrainMeshRef.current && terrainH) {
            const geom = terrainMeshRef.current.geometry;
            const pos = geom.attributes.position.array;
            for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) {
                const i = z * (N + 1) + x;
                const gx = Math.min(x, N - 1), gz = Math.min(z, N - 1);
                pos[i * 3 + 1] = terrainH[gz * N + gx];
            }
            geom.attributes.position.needsUpdate = true;
            geom.computeVertexNormals();
        }
    }, [terrainH, terrainVersion]);

    // ---- Apply satellite texture when satData changes ----
    useEffect(() => {
        if (!satData || !satData.canvas || !terrainMeshRef.current) return;
        const u = terrainMeshRef.current.material.uniforms;
        const tex = new THREE.CanvasTexture(satData.canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        if (u.uSatellite.value) u.uSatellite.value.dispose();
        u.uSatellite.value = tex;
        u.uUseSatellite.value = 1.0;
        u.uBboxWest.value = satData.bbox.west;
        u.uBboxEast.value = satData.bbox.east;
        u.uBboxSouth.value = satData.bbox.south;
        u.uBboxNorth.value = satData.bbox.north;
        if (satData.tileBounds) {
            u.uTileWest.value = satData.tileBounds.west;
            u.uTileEast.value = satData.tileBounds.east;
            u.uTileSouth.value = satData.tileBounds.south;
            u.uTileNorth.value = satData.tileBounds.north;
        }
        if (satData.mercTileNorth != null) u.uMercTileNorth.value = satData.mercTileNorth;
        if (satData.mercTileSouth != null) u.uMercTileSouth.value = satData.mercTileSouth;
    }, [satData]);

    // ---- Custom model ----
    useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;
        if (customModel) {
            scene.add(customModel);
            customModel.traverse(c => {
                if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
            });
            // hide procedural terrain
            if (terrainMeshRef.current) {
                terrainMeshRef.current.visible = false;
            }
        } else {
            // show procedural terrain if no custom model
            if (terrainMeshRef.current) {
                terrainMeshRef.current.visible = true;
            }
        }
        return () => {
            if (customModel) {
                scene.remove(customModel);
            }
            if (terrainMeshRef.current) {
                terrainMeshRef.current.visible = true;
            }
        };
    }, [customModel]);

    return <div ref={containerRef} className="w-full h-full overflow-hidden" style={{ cursor: 'grab' }} />;
};

export default SimulationCanvas;
