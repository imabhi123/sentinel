import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';

// ================================================================
//  FLOOD SIMULATION HOOK — Faithful port of flood-simulation.html
//  Physics: Shallow Water Equations — Sobel stencil on η for slope;
//           D8 terrain drainage nudge for shallow flow in valleys.
//  Grid:    200×200 cells, 10m each = 2km × 2km
// ================================================================

const N = 200;
const CELLS = N * N;
const WORLD = 2000;
const CELL = WORLD / N;
const DT = 0.14;
const G = 9.81;
const TMAX = 180;
const MANNING = 0.035;
const VALLEY_ASSIST = 0.24;
const RAIN_DUR = 40;

export { N, CELLS, WORLD, CELL, TMAX };

export const useFloodSimulation = () => {
    // ---- Simulation arrays (identical to original) ----
    const terrainH  = useRef(new Float32Array(CELLS));
    const groundH   = useRef(new Float32Array(CELLS));
    const waterH    = useRef(new Float32Array(CELLS));
    const velX      = useRef(new Float32Array(CELLS));
    const velZ      = useRef(new Float32Array(CELLS));
    const buildingMask = useRef(new Uint8Array(CELLS));
    const wHnew     = useRef(new Float32Array(CELLS));
    const vXnew     = useRef(new Float32Array(CELLS));
    const vZnew     = useRef(new Float32Array(CELLS));
    const drainDirX = useRef(new Float32Array(CELLS));
    const drainDirZ = useRef(new Float32Array(CELLS));
    const drainSlope = useRef(new Float32Array(CELLS));

    // ---- State ----
    const simRunning   = useRef(false);
    const simPhase     = useRef('idle');   // 'idle' | 'rain' | 'flood'
    const simTime      = useRef(0);
    const phaseTimer   = useRef(0);
    const floodDone    = useRef(false);
    const floodSources = useRef([]);
    const isFastForwarding = useRef(false);
    const targetSimTime    = useRef(0);

    // ---- Params (mutable refs for physics loop) ----
    const rainRate    = useRef(80);
    const floodStr    = useRef(1.0);
    const viscosity   = useRef(0.65);
    const evaporation = useRef(0.08);

    // ---- React stats for UI ----
    const [stats, setStats] = useState({
        time: '00:00', phase: 'IDLE', rain: 0, cells: 0,
        depth: 0, area: 0, fps: 0
    });
    const [terrainVersion, setTerrainVersion] = useState(0);

    // ================================================================
    //  D8 steepest descent on bare terrain
    // ================================================================
    const recomputeTerrainDrainage = useCallback(() => {
        const tH = terrainH.current;
        const ddX = drainDirX.current, ddZ = drainDirZ.current, dS = drainSlope.current;
        for (let z = 1; z < N - 1; z++) {
            for (let x = 1; x < N - 1; x++) {
                const idx = z * N + x;
                const t0 = tH[idx];
                let best = -1, bx = 0, bz = 0;
                for (let dz = -1; dz <= 1; dz++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dz === 0) continue;
                        const ni = (z + dz) * N + (x + dx);
                        const dist = Math.sqrt(dx * dx + dz * dz);
                        const slope = (t0 - tH[ni]) / (dist * CELL);
                        if (slope > best) { best = slope; bx = dx / dist; bz = dz / dist; }
                    }
                }
                if (best > 1e-8) { ddX[idx] = bx; ddZ[idx] = bz; dS[idx] = best; }
                else { ddX[idx] = 0; ddZ[idx] = 0; dS[idx] = 0; }
            }
        }
    }, []);

    // ================================================================
    //  INIT TERRAIN
    // ================================================================
    const initTerrain = useCallback((heights, mask = null) => {
        const tH = terrainH.current, gH = groundH.current;
        let minH = Infinity, maxH = -Infinity;
        for (let i = 0; i < CELLS; i++) {
            const h = heights[i] || 0;
            if (h < minH) minH = h;
            if (h > maxH) maxH = h;
        }
        const range = (maxH - minH) < 1e-6 ? 1 : (maxH - minH);
        for (let i = 0; i < CELLS; i++) {
            tH[i] = ((heights[i] || 0) - minH) / range * TMAX;
            gH[i] = tH[i];
        }
        if (mask) buildingMask.current.set(mask);
        else buildingMask.current.fill(0);

        waterH.current.fill(0);
        velX.current.fill(0);
        velZ.current.fill(0);
        floodSources.current = [];
        floodDone.current = false;
        simPhase.current = 'idle';
        simTime.current = 0;
        phaseTimer.current = 0;
        simRunning.current = false;
        isFastForwarding.current = false;
        targetSimTime.current = 0;

        recomputeTerrainDrainage();
        setTerrainVersion(v => v + 1);
    }, [recomputeTerrainDrainage]);

    // ================================================================
    //  CUSTOM MODEL CAPTURE (Raycast heightmap + building mask)
    // ================================================================
    const applyTerrainFromModel = useCallback((model) => {
        const box = new THREE.Box3().setFromObject(model);
        let rx = box.max.x - box.min.x, rz = box.max.z - box.min.z;
        if (rx < 1e-6) rx = 1; if (rz < 1e-6) rz = 1;
        const sx = WORLD / rx, sz = WORLD / rz;
        const sy = (sx + sz) * 0.5;
        model.scale.set(sx, sy, sz);
        model.updateMatrixWorld(true);

        const box2 = new THREE.Box3().setFromObject(model);
        model.position.set(-(box2.min.x + box2.max.x) / 2, -box2.min.y, -(box2.min.z + box2.max.z) / 2);
        model.updateMatrixWorld(true);

        const meshes = [];
        model.traverse(c => { if (c.isMesh) meshes.push(c); });

        const rc = new THREE.Raycaster();
        const rayDir = new THREE.Vector3(0, -1, 0);
        const topY = box2.max.y + 50;

        const tH = terrainH.current, gH = groundH.current, bM = buildingMask.current;
        tH.fill(0); gH.fill(0); bM.fill(0);

        for (let j = 0; j < N; j++) {
            for (let i = 0; i < N; i++) {
                let minH = 1e9, maxH = -1e9;
                for (let sy = 0; sy < 2; sy++) {
                    for (let sx = 0; sx < 2; sx++) {
                        const wx = (i + (sx + 0.5) / 2) * CELL - WORLD * 0.5;
                        const wz = (j + (sy + 0.5) / 2) * CELL - WORLD * 0.5;
                        rc.set(new THREE.Vector3(wx, topY, wz), rayDir);
                        const hits = rc.intersectObjects(meshes, true);
                        if (hits.length > 0) {
                            for (let h = 0; h < hits.length; h++) {
                                const y = hits[h].point.y;
                                if (y < minH) minH = y;
                                if (y > maxH) maxH = y;
                            }
                        }
                    }
                }
                if (minH > 1e8) minH = 0;
                if (maxH < -1e8) maxH = 0;

                gH[j * N + i] = minH;
                tH[j * N + i] = minH;
                if (maxH - minH > 2.2) bM[j * N + i] = 1;
            }
        }

        const tempH = new Float32Array(CELLS);
        for (let j = 0; j < N; j++) {
            for (let i = 0; i < N; i++) {
                let sum = 0, count = 0;
                for (let dj = -1; dj <= 1; dj++) {
                    for (let di = -1; di <= 1; di++) {
                        const nj = j + dj, ni = i + di;
                        if (nj >= 0 && nj < N && ni >= 0 && ni < N) {
                            sum += tH[nj * N + ni];
                            count++;
                        }
                    }
                }
                tempH[j * N + i] = sum / count;
            }
        }
        tH.set(tempH);
        gH.set(tempH);

        waterH.current.fill(0); velX.current.fill(0); velZ.current.fill(0);
        floodSources.current = []; floodDone.current = false;
        simPhase.current = 'idle'; simTime.current = 0; phaseTimer.current = 0;
        simRunning.current = false;

        recomputeTerrainDrainage();
        setTerrainVersion(v => v + 1);
        
        let validHits = 0;
        let missed = 0;
        for(let k=0; k<CELLS; k++) {
            if (tH[k] !== 0) validHits++;
            else missed++;
        }
        console.log(`GLB Extracted Heights: ${validHits} cells hit, ${missed} cells missed.`);
        alert(`GLB PARSED: ${validHits} / ${CELLS} valid hits.`);

        return model;
    }, [recomputeTerrainDrainage]);

    // ================================================================
    //  PROCEDURAL TERRAIN (fallback — identical to original)
    // ================================================================
    const generateTerrain = useCallback(() => {
        const tH = terrainH.current;
        function hash2(x, z) {
            let h = (x * 374761393 + z * 668265263) >>> 0;
            h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
            return ((h ^ (h >>> 16)) >>> 0) / 4294967295.0 * 2.0 - 1.0;
        }
        function lerp(a, b, t) { return a + (b - a) * t; }
        function noise2(x, z) {
            const ix = Math.floor(x), iz = Math.floor(z);
            const fx = x - ix, fz = z - iz;
            const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
            return lerp(lerp(hash2(ix, iz), hash2(ix + 1, iz), ux), lerp(hash2(ix, iz + 1), hash2(ix + 1, iz + 1), ux), uz);
        }
        let minH = Infinity, maxH = -Infinity;
        for (let z = 0; z < N; z++) {
            for (let x = 0; x < N; x++) {
                let fx = x / N, fz = z / N, h = 0;
                h += Math.sin(fx * Math.PI * 1.4) * Math.sin(fz * Math.PI * 1.1) * 80;
                h += Math.sin(fx * Math.PI * 2.2 + 0.5) * Math.cos(fz * Math.PI * 1.9) * 45;
                h += noise2(fx * 4.1, fz * 4.3) * 32;
                h += noise2(fx * 8.3 + 1.1, fz * 8.1 + 0.7) * 16;
                h += noise2(fx * 16, fz * 16) * 7;
                h += noise2(fx * 32, fz * 32) * 3;
                let rx = 0.5 + Math.sin(fz * Math.PI * 2.5) * 0.1, rd = Math.abs(fx - rx);
                h -= Math.max(0, (1 - rd * 14)) * 38;
                let bdx = fx - 0.18, bdz = fz - 0.78, br = Math.sqrt(bdx * bdx + bdz * bdz);
                h -= Math.max(0, (0.2 - br) / 0.2) * 55;
                let b2x = fx - 0.82, b2z = fz - 0.22, b2r = Math.sqrt(b2x * b2x + b2z * b2z);
                h -= Math.max(0, (0.12 - b2r) / 0.12) * 35;
                let pdx = fx - 0.52, pdz = fz - 0.48, pr = Math.sqrt(pdx * pdx + pdz * pdz);
                h -= Math.max(0, (0.06 - pr) / 0.06) * 28;
                h += (fz - 0.5) * 22 + (fx - 0.5) * 12 + 60;
                tH[z * N + x] = h;
                if (h < minH) minH = h; if (h > maxH) maxH = h;
            }
        }
        const range = maxH - minH;
        for (let i = 0; i < CELLS; i++) {
            tH[i] = (tH[i] - minH) / range * TMAX;
            groundH.current[i] = tH[i];
        }
        buildingMask.current.fill(0);
        waterH.current.fill(0); velX.current.fill(0); velZ.current.fill(0);
        floodSources.current = []; floodDone.current = false;
        simPhase.current = 'idle'; simTime.current = 0; phaseTimer.current = 0;
        simRunning.current = false;
        recomputeTerrainDrainage();
        setTerrainVersion(v => v + 1);
    }, [recomputeTerrainDrainage]);

    // ================================================================
    //  PHYSICS STEP  (exact port from original simStep)
    // ================================================================
    const simStep = useCallback((dtOverride) => {
        const dStep = dtOverride || DT;
        const dx = CELL;
        const dampBase = Math.max(0.3, Math.min(0.98, viscosity.current));
        const damp = Math.pow(dampBase, dStep / DT);
        const evap = evaporation.current * 0.000008;
        const n2 = MANNING * MANNING, cfl = 0.45;
        const eps = 1e-4;
        const tH = terrainH.current, wH = waterH.current, vX = velX.current, vZ = velZ.current;
        const bM = buildingMask.current;
        const ddX = drainDirX.current, ddZ = drainDirZ.current, dS = drainSlope.current;
        const wN = wHnew.current, xN = vXnew.current, zN = vZnew.current;

        // Rain accumulation
        if (simPhase.current === 'rain' || simPhase.current === 'flood') {
            const add = (rainRate.current / 1000) * dStep * 0.0022;
            for (let i = 0; i < CELLS; i++) {
                if (bM[i]) continue;
                wH[i] += add;
            }
        }

        // Flood sources
        for (let s = 0; s < floodSources.current.length; s++) {
            const src = floodSources.current[s];
            const cx = Math.max(0, Math.min(N - 1, src.x | 0));
            const cz = Math.max(0, Math.min(N - 1, src.z | 0));
            for (let dz2 = -src.r; dz2 <= src.r; dz2++) {
                for (let dx2 = -src.r; dx2 <= src.r; dx2++) {
                    if (dx2 * dx2 + dz2 * dz2 > src.r * src.r) continue;
                    const nx = Math.max(0, Math.min(N - 1, cx + dx2));
                    const nz = Math.max(0, Math.min(N - 1, cz + dz2));
                    const ni = nz * N + nx;
                    if (bM[ni]) continue;
                    wH[ni] += src.rate * dStep;
                }
            }
        }

        // Step A: velocity update (Sobel stencil + D8 valley assist + Manning friction)
        xN.set(vX); zN.set(vZ);
        for (let z = 1; z < N - 1; z++) {
            for (let x = 1; x < N - 1; x++) {
                const idx = z * N + x;
                if (bM[idx]) { xN[idx] = 0; zN[idx] = 0; continue; }
                const h = wH[idx];
                if (h < eps) { xN[idx] = 0; zN[idx] = 0; continue; }

                const TL = tH[idx - N - 1] + wH[idx - N - 1];
                const TC = tH[idx - N] + wH[idx - N];
                const TR = tH[idx - N + 1] + wH[idx - N + 1];
                const ML = tH[idx - 1] + wH[idx - 1];
                const MR = tH[idx + 1] + wH[idx + 1];
                const BL = tH[idx + N - 1] + wH[idx + N - 1];
                const BC = tH[idx + N] + wH[idx + N];
                const BR = tH[idx + N + 1] + wH[idx + N + 1];

                const Gx = -TL + TR - 2 * ML + 2 * MR - BL + BR;
                const Gz = -TL - 2 * TC - TR + BL + 2 * BC + BR;
                const inv8dx = 1 / (8 * dx);
                let ax_g = -G * Gx * inv8dx;
                let az_g = -G * Gz * inv8dx;

                // D8 valley assist (fades with depth)
                const shallow = Math.exp(-h * 3.2);
                ax_g += VALLEY_ASSIST * G * dS[idx] * ddX[idx] * shallow;
                az_g += VALLEY_ASSIST * G * dS[idx] * ddZ[idx] * shallow;

                let vx = vX[idx] * damp + ax_g * dStep;
                let vz = vZ[idx] * damp + az_g * dStep;

                // Semi-implicit Manning friction
                const speed = Math.sqrt(vx * vx + vz * vz);
                if (speed > 1e-4 && h > 0.002) {
                    const R = Math.pow(h, 0.66667);
                    const fCoeff = (G * n2 * speed / Math.max(1e-6, R)) * dStep;
                    vx /= (1 + fCoeff);
                    vz /= (1 + fCoeff);
                }

                // CFL clamp
                const maxV = (dx / dStep) * cfl;
                if (vx > maxV) vx = maxV; else if (vx < -maxV) vx = -maxV;
                if (vz > maxV) vz = maxV; else if (vz < -maxV) vz = -maxV;

                // NaN safety
                if (!Number.isFinite(vx)) vx = 0;
                if (!Number.isFinite(vz)) vz = 0;

                xN[idx] = vx;
                zN[idx] = vz;
            }
        }

        // Step B: conservative height update (upwind fluxes)
        wN.set(wH);
        for (let z = 1; z < N - 1; z++) {
            for (let x = 1; x < N - 1; x++) {
                const idx = z * N + x;
                if (bM[idx]) { wN[idx] = 0; continue; }
                const hC = wH[idx];
                const idxR = idx + 1, idxL = idx - 1;
                const uC = xN[idx], uR = xN[idxR], uL = xN[idxL];
                const hR = wH[idxR], hL = wH[idxL];
                const uFaceR = 0.5 * (uC + uR), uFaceL = 0.5 * (uL + uC);
                const fluxR = bM[idxR] ? 0 : (uFaceR >= 0 ? (hC * uFaceR) : (hR * uFaceR));
                const fluxL = bM[idxL] ? 0 : (uFaceL >= 0 ? (hL * uFaceL) : (hC * uFaceL));

                const idxD = idx + N, idxU = idx - N;
                const vC = zN[idx], vD = zN[idxD], vU = zN[idxU];
                const hD = wH[idxD], hU = wH[idxU];
                const vFaceD = 0.5 * (vC + vD), vFaceU = 0.5 * (vU + vC);
                const fluxD = bM[idxD] ? 0 : (vFaceD >= 0 ? (hC * vFaceD) : (hD * vFaceD));
                const fluxU = bM[idxU] ? 0 : (vFaceU >= 0 ? (hU * vFaceU) : (hC * vFaceU));

                const dh = -(dStep / dx) * ((fluxR - fluxL) + (fluxD - fluxU));
                wN[idx] = (hC + dh) > 0 ? (hC + dh) : 0;
            }
        }

        // Evaporation + safety clamp + boundary clear
        for (let i = 0; i < CELLS; i++) {
            let hn = wN[i] - evap;
            if (hn < 0) hn = 0;
            if (hn > 1000) hn = 1000;
            if (!Number.isFinite(hn)) hn = 0;
            wN[i] = hn;
        }
        for (let i = 0; i < N; i++) {
            wN[i] = 0; wN[(N - 1) * N + i] = 0;
            wN[i * N] = 0; wN[i * N + N - 1] = 0;
        }
        wH.set(wN); vX.set(xN); vZ.set(zN);
    }, []);

    // ================================================================
    //  SCENARIO CONTROLS (exact port from original)
    // ================================================================
    const startFlood = useCallback(() => {
        floodDone.current = true;
        simPhase.current = 'flood';
        phaseTimer.current = 0;
        const tH = terrainH.current;
        const half = N / 2;
        const best = [{ h: -1, i: -1 }, { h: -1, i: -1 }, { h: -1, i: -1 }, { h: -1, i: -1 }];
        for (let i = 0; i < CELLS; i++) {
            const gz = (i / N) | 0, gx = i % N;
            const q = (gx < half ? 0 : 1) + (gz < half ? 0 : 2);
            if (tH[i] > best[q].h) { best[q].h = tH[i]; best[q].i = i; }
        }
        for (let k = 0; k < 4; k++) {
            if (best[k].i >= 0) {
                floodSources.current.push({
                    x: best[k].i % N, z: (best[k].i / N) | 0,
                    r: 10, rate: 0.009 * floodStr.current
                });
            }
        }
    }, []);

    const resetSim = useCallback(() => {
        simRunning.current = false;
        simPhase.current = 'idle';
        simTime.current = 0;
        phaseTimer.current = 0;
        isFastForwarding.current = false;
        targetSimTime.current = 0;
        waterH.current.fill(0);
        velX.current.fill(0);
        velZ.current.fill(0);
        floodSources.current = [];
        floodDone.current = false;
        setStats({ time: '00:00', phase: 'IDLE', rain: 0, cells: 0, depth: 0, area: 0, fps: 0 });
    }, []);

    const startRain = useCallback(() => {
        resetSim();
        simRunning.current = true;
        simPhase.current = 'rain';
        phaseTimer.current = 0;
    }, [resetSim]);

    const triggerFlood = useCallback(() => {
        if (!simRunning.current) { simRunning.current = true; simPhase.current = 'flood'; }
        startFlood();
    }, [startFlood]);

    const damBreak = useCallback(() => {
        if (!simRunning.current) { simRunning.current = true; simPhase.current = 'flood'; floodDone.current = true; }
        const wH = waterH.current, vZ = velZ.current, tH = terrainH.current;
        // Find best edge
        let bestH = 0, edge = 'top';
        for (let x = 0; x < N; x++) { if (tH[x] > bestH) { bestH = tH[x]; edge = 'top'; } }
        for (let z = 0; z < N; z++) { if (tH[z * N] > bestH) { bestH = tH[z * N]; edge = 'left'; } }
        if (edge === 'top') {
            for (let z = 0; z < 14; z++) for (let x = 0; x < N; x++) {
                wH[z * N + x] = 10 + Math.random() * 5; vZ[z * N + x] = 4;
            }
        } else {
            for (let z = 0; z < N; z++) for (let x = 0; x < 14; x++) {
                wH[z * N + x] = 10 + Math.random() * 5; velX.current[z * N + x] = 4;
            }
        }
    }, []);

    const rainOnly = useCallback(() => {
        resetSim();
        simRunning.current = true;
        simPhase.current = 'rain';
        floodDone.current = true; // prevents auto-flood
    }, [resetSim]);

    const fastForward = useCallback((mins) => {
        if (!simRunning.current) return;
        targetSimTime.current = simTime.current + mins * 60;
        isFastForwarding.current = true;
    }, []);

    // ================================================================
    //  MAIN TICK — called by SimulationCanvas animation loop
    // ================================================================
    const tick = useCallback((dt) => {
        if (!simRunning.current) return;

        phaseTimer.current += dt;

        // Auto-trigger flood after RAIN_DUR seconds
        if (simPhase.current === 'rain' && phaseTimer.current >= RAIN_DUR && !floodDone.current) {
            startFlood();
        }

        if (isFastForwarding.current) {
            let ffBatch = 0;
            const tStart = performance.now();
            while (simTime.current < targetSimTime.current && ffBatch < 200) {
                simStep(DT);
                simTime.current += DT;
                ffBatch++;
                if (performance.now() - tStart > 15) break;
            }
            if (simTime.current >= targetSimTime.current) {
                isFastForwarding.current = false;
            }
        } else {
            simStep(DT);
            simTime.current += DT;
        }
    }, [simStep, startFlood]);

    // ================================================================
    //  UPDATE STATS — called periodically from canvas loop
    // ================================================================
    const updateStats = useCallback(() => {
        const wH = waterH.current;
        let wet = 0, maxD = 0;
        for (let i = 0; i < CELLS; i++) {
            if (wH[i] > 0.005) { wet++; if (wH[i] > maxD) maxD = wH[i]; }
        }
        const t = simTime.current;
        const h = (t / 3600) | 0;
        const m = ((t % 3600) / 60) | 0;
        const s = (t % 60) | 0;
        const timeStr = (h > 0 ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        const area = wet * CELL * CELL;
        setStats({
            time: timeStr,
            phase: simPhase.current.toUpperCase(),
            rain: simPhase.current === 'idle' ? 0 : rainRate.current,
            cells: wet,
            depth: maxD,
            area: area,
            fps: 0 // filled by canvas
        });
    }, []);

    // ================================================================
    //  PARAM SETTERS
    // ================================================================
    const setParam = useCallback((key, value) => {
        switch (key) {
            case 'rainfall': rainRate.current = value; break;
            case 'floodSrc':
                floodStr.current = value;
                for (let i = 0; i < floodSources.current.length; i++)
                    floodSources.current[i].rate = 0.009 * value;
                break;
            case 'viscosity': viscosity.current = value; break;
            case 'evaporation': evaporation.current = value; break;
            default: break;
        }
    }, []);

    return {
        // Arrays (refs — mutated in place)
        terrainH: terrainH.current,
        groundH: groundH.current,
        waterH: waterH.current,
        velX: velX.current,
        velZ: velZ.current,
        buildingMask: buildingMask.current,
        // Controls
        initTerrain, generateTerrain, resetSim, applyTerrainFromModel,
        startRain, triggerFlood, damBreak, rainOnly, fastForward,
        tick, updateStats, setParam,
        // State
        simRunning, simPhase,
        stats,
        terrainVersion,
    };
};
