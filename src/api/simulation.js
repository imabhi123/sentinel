/**
 * API layer for flood simulation — calls the Flask backend (app.py)
 * All routes are under /api/simulation/... and require JWT auth token.
 * Server base: https://960wd305-5001.inc1.devtunnels.ms
 */

const SERVER = 'https://960wd305-5001.inc1.devtunnels.ms';
const API_BASE = `${SERVER}/api/simulation`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * GET /api/simulation/dem?south=&north=&west=&east=
 * Returns { heights: Float[40000], bbox, gridSize }
 */
export const fetchDEM = async (bbox, refresh = false) => {
    const { south, north, west, east } = bbox;
    const qs = `south=${south}&north=${north}&west=${west}&east=${east}${refresh ? '&refresh=1' : ''}`;
    const res = await fetch(`${API_BASE}/dem?${qs}`, { headers: getAuthHeader() });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!data.heights || data.heights.length !== 40000) throw new Error('DEM returned wrong size');
    return data;
};

/**
 * GET /api/simulation/elevation?south=&north=&west=&east=
 * Fallback DEM source (Open-Elevation / OpenTopoData)
 */
export const fetchElevation = async (bbox, refresh = false) => {
    const { south, north, west, east } = bbox;
    const qs = `south=${south}&north=${north}&west=${west}&east=${east}${refresh ? '&refresh=1' : ''}`;
    const res = await fetch(`${API_BASE}/elevation?${qs}`, { headers: getAuthHeader() });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!data.heights || data.heights.length !== 40000) throw new Error('Elevation API returned wrong size');
    return data;
};

/**
 * GET /api/simulation/buildings?south=&north=&west=&east=
 * Returns { elements: [...] } — OSM building polygons
 */
export const fetchBuildings = async (bbox, refresh = false) => {
    const { south, north, west, east } = bbox;
    const qs = `south=${south}&north=${north}&west=${west}&east=${east}${refresh ? '&refresh=1' : ''}`;
    const res = await fetch(`${API_BASE}/buildings?${qs}`, { headers: getAuthHeader() });
    return res.json();
};

/**
 * GET /api/simulation/geocode?lat=&lon=
 * Returns { display_name: "..." }
 */
export const fetchGeocode = async (lat, lon, refresh = false) => {
    const qs = `lat=${lat}&lon=${lon}${refresh ? '&refresh=1' : ''}`;
    const res = await fetch(`${API_BASE}/geocode?${qs}`, { headers: getAuthHeader() });
    return res.json();
};

/**
 * Build satellite tile URL (proxied through server to avoid CORS)
 * Uses auth token as query param since <img> tags can't set headers
 */
export const tileUrl = (z, x, y, refresh = false) => {
    const token = localStorage.getItem('token') || '';
    return `${API_BASE}/tile?z=${z}&x=${x}&y=${y}${refresh ? '&refresh=1' : ''}&token=${token}`;
};

/** Hydra endpoints */
export const getHydraMeta = async () => {
    const res = await fetch(`${API_BASE}/hydra/meta`, { headers: getAuthHeader() });
    return res.json();
};

export const getHydraDem = async (refresh = false) => {
    const res = await fetch(`${API_BASE}/hydra/dem?${refresh ? 'refresh=1' : ''}`, { headers: getAuthHeader() });
    return res.json();
};

export const getHydraTextureUrl = () => {
    const token = localStorage.getItem('token') || '';
    return `${API_BASE}/hydra/texture.png?token=${token}`;
};

/**
 * Coordinate helpers (same as flood-simulation.html)
 */
const REGION_HALF_DEG = 0.009;

export const centerToBbox = (lat, lon) => ({
    south: lat - REGION_HALF_DEG,
    north: lat + REGION_HALF_DEG,
    west: lon - REGION_HALF_DEG,
    east: lon + REGION_HALF_DEG,
});

export const parseCenterCoord = (str) => {
    if (!str || typeof str !== 'string') return null;
    str = str.trim();
    let lat = null, lon = null;
    const num = /(-?\d+\.?\d*)\s*°?\s*([NS]?)\s*,?\s*(-?\d+\.?\d*)\s*°?\s*([EW]?)/i.exec(str);
    if (num) {
        lat = parseFloat(num[1]);
        if ((num[2] || '').toUpperCase() === 'S') lat = -lat;
        lon = parseFloat(num[3]);
        if ((num[4] || '').toUpperCase() === 'W') lon = -lon;
    } else {
        const parts = str.split(/[\s,]+/).filter(p => p.length);
        if (parts.length >= 2) {
            lat = parseFloat(parts[0]);
            lon = parseFloat(parts[1]);
        }
    }
    if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
};

export const validateBbox = (b) => {
    if (!b) return false;
    if (b.south >= b.north || b.west >= b.east) return false;
    if (b.south < -90 || b.north > 90 || b.west < -180 || b.east > 180) return false;
    return true;
};

/**
 * Satellite tile compositor — loads Esri tiles through proxy, composites to canvas texture
 */
export const loadSatelliteTexture = (bbox, refresh = false) => {
    return new Promise((resolve) => {
        const { west, south, east, north } = bbox;
        const zoom = 18;
        const n = Math.pow(2, zoom);

        const lonLatToTile = (lon, lat) => ({
            x: Math.floor((lon + 180) / 360 * n),
            y: Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n),
        });
        const tileYToLat = (yNorm) => {
            const latRad = 2 * Math.atan(Math.exp(Math.PI * (1 - 2 * yNorm))) - Math.PI / 2;
            return latRad * 180 / Math.PI;
        };

        const t0 = lonLatToTile(west, north);
        const t1 = lonLatToTile(east, south);
        const txMin = Math.max(0, Math.min(t0.x, t1.x));
        const txMax = Math.min(n - 1, Math.max(t0.x, t1.x));
        const tyMin = Math.max(0, Math.min(t0.y, t1.y));
        const tyMax = Math.min(n - 1, Math.max(t0.y, t1.y));
        const tw = txMax - txMin + 1, th = tyMax - tyMin + 1;
        const size = 256;

        const canvas = document.createElement('canvas');
        canvas.width = Math.min(4096, tw * size);
        canvas.height = Math.min(4096, th * size);
        const ctx = canvas.getContext('2d');

        const tileBounds = {
            west: (txMin / n) * 360 - 180,
            east: ((txMax + 1) / n) * 360 - 180,
            south: tileYToLat((tyMax + 1) / n),
            north: tileYToLat(tyMin / n),
        };

        const count = tw * th;
        let loaded = 0;

        const drawTile = (tx, ty) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, (tx - txMin) * size, (ty - tyMin) * size, size, size);
                loaded++;
                if (loaded >= count) resolve({ canvas, tileBounds });
            };
            img.onerror = () => {
                loaded++;
                if (loaded >= count) resolve({ canvas, tileBounds });
            };
            img.src = tileUrl(zoom, tx, ty, refresh);
        };

        for (let ty = tyMin; ty <= tyMax; ty++)
            for (let tx = txMin; tx <= txMax; tx++)
                drawTile(tx, ty);
        if (count === 0) resolve(null);
    });
};

export const mercatorYFromLat = (latDeg) =>
    Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
