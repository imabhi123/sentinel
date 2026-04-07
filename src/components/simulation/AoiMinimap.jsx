import * as THREE from 'three';
import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AoiMinimap — Draws the satellite texture, grid fallback, or a custom 3D model snapshot on a 2D canvas.
 * Supports drag-to-select for triggering 3D camera pan.
 */
export default function AoiMinimap({ satData, customModel, onSelectArea }) {
  const canvasRef = useRef(null);
  const [rect, setRect] = useState({ x0: 0.35, y0: 0.35, x1: 0.65, y1: 0.65 });
  const dragging = useRef(false);
  const startPt = useRef({ x: 0, y: 0 });

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const normRect = (r) => ({
    x0: clamp01(Math.min(r.x0, r.x1)),
    y0: clamp01(Math.min(r.y0, r.y1)),
    x1: clamp01(Math.max(r.x0, r.x1)),
    y1: clamp01(Math.max(r.y0, r.y1)),
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background: Custom Model Snapshot, Satellite Texture, or Basic Grid
    if (customModel) {
        if (modelSnapshotImg.current) {
            try { ctx.drawImage(modelSnapshotImg.current, 0, 0, w, h); } catch (e) {}
        } else {
            ctx.fillStyle = 'rgba(6,20,35,0.9)';
            ctx.fillRect(0, 0, w, h);
        }
    } else if (satData?.canvas) {
      try { ctx.drawImage(satData.canvas, 0, 0, w, h); } catch (e) { /* ignore */ }
    } else {
      ctx.fillStyle = 'rgba(6,20,35,0.9)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,180,216,0.12)';
      for (let i = 0; i <= 10; i++) {
        const p = i / 10;
        ctx.beginPath(); ctx.moveTo(p * w, 0); ctx.lineTo(p * w, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p * h); ctx.lineTo(w, p * h); ctx.stroke();
      }
    }

    // AOI rectangle
    const r = normRect(rect);
    const rx = r.x0 * w, ry = r.y0 * h;
    const rw = (r.x1 - r.x0) * w, rh = (r.y1 - r.y0) * h;
    ctx.fillStyle = 'rgba(0,180,216,0.12)';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = 'rgba(144,224,239,0.95)';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx + 1, ry + 1, Math.max(0, rw - 2), Math.max(0, rh - 2));
  }, [rect, satData, customModel]);

  // Generate WebGL snapshot of custom GLB Model
  const modelSnapshotUrl = useRef(null);
  const modelSnapshotImg = useRef(null);
  const prevModelId = useRef(null);
  
  useEffect(() => {
      if (!customModel || !canvasRef.current) {
          modelSnapshotUrl.current = null;
          modelSnapshotImg.current = null;
          prevModelId.current = null;
          draw();
          return;
      }
      
      if (prevModelId.current === customModel.uuid) {
          return; // Already generated snapshot for this exact model
      }
      prevModelId.current = customModel.uuid;
      
      const size = 220;
      const tCanvas = document.createElement('canvas'); // Temp canvas for WebGL
      tCanvas.width = size;
      tCanvas.height = size;
      
      const renderer = new THREE.WebGLRenderer({ canvas: tCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setClearColor(0x0B0B0D, 1);
      
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 2.5));
      const light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(100, 300, 100);
      scene.add(light);
      
      const clone = customModel.clone();
      scene.add(clone);
      
      const box = new THREE.Box3().setFromObject(clone);
      const center = box.getCenter(new THREE.Vector3());
      
      // Strict 2000m map width for 1:1 coordinate projection (WORLD=2000)
      const camSize = 1000;
      
      const cam = new THREE.OrthographicCamera(-camSize, camSize, camSize, -camSize, 1, 10000);
      cam.position.set(0, box.max.y + 1000, 0);
      cam.lookAt(new THREE.Vector3(0, 0, 0));
      
      renderer.render(scene, cam);
      
      // Store snapshot and draw to 2D canvas
      modelSnapshotUrl.current = tCanvas.toDataURL('image/jpeg');
      renderer.dispose();
      
      const img = new Image();
      img.onload = () => {
          modelSnapshotImg.current = img;
          draw(); // trigger repaint now that image is ready
      };
      img.src = modelSnapshotUrl.current;
      
  }, [customModel, draw]);

  useEffect(() => { 
      draw(); 
  }, [draw]);

  const getNorm = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0.5, y: 0.5 };
    const r = canvas.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - r.left) / r.width),
      y: clamp01((e.clientY - r.top) / r.height),
    };
  };

  const onMouseDown = (e) => {
    const p = getNorm(e);
    dragging.current = true;
    startPt.current = p;
    setRect({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const p = getNorm(e);
      setRect(prev => ({ ...prev, x1: p.x, y1: p.y }));
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setRect(prev => {
        let r = normRect(prev);
        // If too small, expand around center
        if ((r.x1 - r.x0) < 0.02 || (r.y1 - r.y0) < 0.02) {
          const cx = (r.x0 + r.x1) * 0.5, cy = (r.y0 + r.y1) * 0.5;
          r = { x0: clamp01(cx - 0.12), y0: clamp01(cy - 0.12), x1: clamp01(cx + 0.12), y1: clamp01(cy + 0.12) };
        }
        if (onSelectArea) onSelectArea(r);
        return r;
      });
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onSelectArea]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={220}
        height={220}
        className="w-full rounded border border-white/10 cursor-crosshair"
        style={{ aspectRatio: '1/1', imageRendering: 'auto' }}
        onMouseDown={onMouseDown}
      />
      <span className="absolute bottom-1 left-1 text-[8px] text-white/30 pointer-events-none">
        Drag to select area → auto-zoom
      </span>
    </div>
  );
}
