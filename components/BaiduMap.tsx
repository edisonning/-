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
    const maxAttempts = 20; // 10 seconds timeout

    const renderMap = () => {
      if (!window.BMap || !mapContainer.current) return;

      try {
        const BMap = window.BMap;

        // Initialize map only once
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
            strokeColor: "blue",
            strokeWeight: 6,
            strokeOpacity: 0.8
            });
            map.addOverlay(polyline);
        }

        // Add Markers for Stations
        route.stations.forEach((station, index) => {
          const pt = new BMap.Point(station.lng, station.lat);
          
          // Custom Icon
          const iconUrl = "http://api.map.baidu.com/img/markers.png";
          const icon = new BMap.Icon(
              iconUrl, 
              new BMap.Size(23, 25), 
              { 
                  offset: new BMap.Size(10, 25), 
                  imageOffset: new BMap.Size(0, 0 - index * 25) 
              }
          );
          
          const marker = new BMap.Marker(pt, { icon: icon });
          
          // Label with minimal style to avoid clutter
          const label = new BMap.Label(station.name, { offset: new BMap.Size(20, -10) });
          label.setStyle({ 
              color: "#333", 
              fontSize: "12px", 
              border: "1px solid #ccc", 
              padding: "2px 5px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.9)"
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
            
            // Simple Bus Marker
            const busIcon = new BMap.Icon(
                "https://maps.gstatic.com/mapfiles/ms2/micons/bus.png", // Generic bus icon
                new BMap.Size(32, 32)
            );
            
            // Fallback if image fails or use default marker with label
            const busMarker = new BMap.Marker(busPt);
            const busLabel = new BMap.Label("🚌", { offset: new BMap.Size(-10, -10) });
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
        renderMap();
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          window.clearInterval(intervalId);
          setMapError(true);
        }
      }
    };

    // Check immediately and then interval
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
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500 flex-col">
        <p>地图加载失败</p>
        <p className="text-xs mt-2">请检查网络连接或刷新页面</p>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-64 rounded-lg shadow-inner bg-gray-100 overflow-hidden" />;
};

export default BaiduMap;