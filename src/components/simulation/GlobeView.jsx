import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

window.CESIUM_BASE_URL = '/Cesium/';

const GlobeView = ({ onBboxSelect, selectedBbox }) => {
    const containerRef = useRef();
    const viewerRef = useRef();

    useEffect(() => {
        // Cesium initialization
        const viewer = new Cesium.Viewer(containerRef.current, {
            terrainProvider: new Cesium.EllipsoidTerrainProvider(),
            timeline: false,
            animation: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            navigationHelpButton: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            infoBox: false,
            selectionIndicator: false,
        });

        viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#07101e');
        viewerRef.current = viewer;

        // Add a handler for bbox selection if needed
        // For now, just set the view to a default location
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(82.5, 22.5, 6.2e6)
        });

        return () => {
            viewer.destroy();
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
};

export default GlobeView;
