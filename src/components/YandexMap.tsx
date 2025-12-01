import { useEffect, useRef } from 'react';

interface MapMarker {
  id: string;
  coordinates: [number, number];
  type: 'fire' | 'hydrant' | 'building' | 'water';
  title: string;
  description?: string;
}

interface YandexMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    ymaps3: any;
  }
}

const YandexMap = ({ 
  markers = [], 
  center = [55.7558, 37.6173], 
  zoom = 15,
  className = ''
}: YandexMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      await new Promise((resolve) => {
        if (window.ymaps3) {
          resolve(true);
        } else {
          const checkYmaps = setInterval(() => {
            if (window.ymaps3) {
              clearInterval(checkYmaps);
              resolve(true);
            }
          }, 100);
        }
      });

      try {
        await window.ymaps3.ready;

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = window.ymaps3;

        const map = new YMap(mapRef.current, {
          location: {
            center: center,
            zoom: zoom,
          },
        });

        map.addChild(new YMapDefaultSchemeLayer());
        map.addChild(new YMapDefaultFeaturesLayer());

        markers.forEach((marker) => {
          const markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
          markerElement.style.cssText = `
            position: relative;
            cursor: pointer;
            transform: translate(-50%, -50%);
          `;

          let iconColor = '#D32F2F';
          let iconSize = 32;
          let iconPath = '';

          switch (marker.type) {
            case 'fire':
              iconColor = '#D32F2F';
              iconSize = 40;
              iconPath = 'M12 2c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2zm-2 18v-6h4v6h5v-8h3L12 3 2 12h3v8h5z';
              break;
            case 'hydrant':
              iconColor = '#1976D2';
              iconSize = 28;
              iconPath = 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z';
              break;
            case 'building':
              iconColor = '#424242';
              iconSize = 32;
              iconPath = 'M19 9.3V4h-3v2.6L12 3L2 12h3v8h6v-6h2v6h6v-8h3L19 9.3zm-9 .7c0-1.1.9-2 2-2s2 .9 2 2h-4z';
              break;
            case 'water':
              iconColor = '#0288D1';
              iconSize = 28;
              iconPath = 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z';
              break;
          }

          markerElement.innerHTML = `
            <div style="
              width: ${iconSize}px;
              height: ${iconSize}px;
              background-color: ${iconColor};
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              ${marker.type === 'fire' ? 'animation: pulse 2s infinite;' : ''}
            ">
              <svg width="${iconSize * 0.6}" height="${iconSize * 0.6}" viewBox="0 0 24 24" fill="white">
                <path d="${iconPath || 'M12 2l8 8h-6v10h-4V10H4z'}" />
              </svg>
            </div>
            ${marker.type === 'fire' ? '<style>@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }</style>' : ''}
          `;

          const mapMarker = new YMapMarker(
            {
              coordinates: marker.coordinates,
            },
            markerElement
          );

          map.addChild(mapMarker);
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('Ошибка инициализации карты:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [markers, center, zoom]);

  return <div ref={mapRef} className={className} style={{ width: '100%', height: '100%' }} />;
};

export default YandexMap;
