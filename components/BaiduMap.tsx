import React, { useEffect, useRef, useState } from 'react';
import { Route } from '../types';

interface BaiduMapProps {
  route: Route;
}

declare global {
  interface Window {
    BMap: any;
  }
}

const BaiduMap: React.FC<BaiduMapProps> = ({ route }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let intervalId: number;
    let attempts = 0;
    const maxAttempts = 40; // 20 seconds timeout (increased)

    const renderMap = () => {
      // Safety check: container must exist
      if (!mapContainer.current) return;
      
      // Safety check: BMap must be loaded
      if (!window.BMap) return;

      try {
        const BMap = window.BMap;

        // Initialize map only once if possible, or re-target
        if (!mapInstance.current) {
          const map = new BMap.Map(mapContainer.current);
          map.enableScrollWheelZoom(true);
          mapInstance.current = map;
        }

        const map = mapInstance.current;
        map.clearOverlays(); // Clear previous route info

        // Set Center
        if (route.stations.length > 0) {
            const firstStation = route.stations[0];
            const centerPoint = new BMap.Point(firstStation.lng, firstStation.lat);
            map.centerAndZoom(centerPoint, 13);
        } else {
            const defaultPoint = new BMap.Point(116.404, 39.915); // Beijing
            map.centerAndZoom(defaultPoint, 12);
        }

        // Draw Route Polyline
        if (route.stations.length > 0) {
            const points = route.stations.map(s => new BMap.Point(s.lng, s.lat));
            const polyline = new BMap.Polyline(points, {
            strokeColor: "#2563eb", // blue-600
            strokeWeight: 6,
            strokeOpacity: 0.8
            });
            map.addOverlay(polyline);
        }

        // Add Markers for Stations
        route.stations.forEach((station, index) => {
          const pt = new BMap.Point(station.lng, station.lat);
          
          // Use standard markers if custom icon fails, but here we try simple ones
          // To ensure visibility, we can use default marker for debugging if needed
          const marker = new BMap.Marker(pt);
          
          // Label
          const label = new BMap.Label(station.name, { offset: new BMap.Size(20, -10) });
          label.setStyle({ 
              color: "#333", 
              fontSize: "12px", 
              border: "1px solid #e5e7eb", 
              padding: "4px 8px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          });
          marker.setLabel(label);
          
          map.addOverlay(marker);
        });

        // Add Bus Location (Simulated)
        const lastPassedIndex = route.stations.findLastIndex(s => s.passed);
        if (lastPassedIndex !== -1 && lastPassedIndex < route.stations.length - 1) {
            const s1 = route.stations[lastPassedIndex];
            const s2 = route.stations[lastPassedIndex + 1];
            
            const busLng = (s1.lng + s2.lng) / 2;
            const busLat = (s1.lat + s2.lat) / 2;
            
            const busPt = new BMap.Point(busLng, busLat);
            
            // Bus Marker
            const busMarker = new BMap.Marker(busPt);
            // Use a large emoji as a simple, reliable icon
            const busLabel = new BMap.Label("🚌", { offset: new BMap.Size(-12, -12) });
            busLabel.setStyle({ border: 'none', background: 'transparent', fontSize: '24px' });
            
            busMarker.setLabel(busLabel);
            busMarker.setAnimation(window.BMap.BMAP_ANIMATION_BOUNCE);
            map.addOverlay(busMarker);
        }

      } catch (e) {
        console.error("Map render failed", e);
        setMapError(true);
      }
    };

    const checkBMap = () => {
      if (window.BMap) {
        window.clearInterval(intervalId);
        // Small delay to ensure script is fully executed
        setTimeout(renderMap, 100);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          window.clearInterval(intervalId);
          console.error("Baidu Map script failed to load within timeout");
          setMapError(true);
        }
      }
    };

    // Check if BMap is already available
    if (window.BMap) {
        renderMap();
    } else {
        intervalId = window.setInterval(checkBMap, 500);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [route]);

  if (mapError) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500 flex-col border border-gray-200">
        <p className="font-medium">地图加载失败</p>
        <p className="text-xs mt-2 text-gray-400">请检查网络或刷新页面</p>
      </div>
    );
  }

  return (
    <div 
        ref={mapContainer} 
        className="w-full h-64 rounded-lg shadow-inner bg-gray-50 overflow-hidden relative z-0"
    />
  );
};

export default BaiduMap;