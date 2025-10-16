import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        google: any;
    }
}

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

interface GoogleMapProps {
  lat: number;
  lng: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ lat, lng }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
        console.error("Google Maps API script is not loaded or has failed to load. Please check your API key.");
        if (mapRef.current) {
            mapRef.current.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-800 text-white/50 p-4 text-center">No se pudo cargar el mapa. Por favor, comprueba la clave de API de Google Maps.</div>';
        }
        return;
    }

    if (mapRef.current) {
      const location = { lat, lng };
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: location,
        disableDefaultUI: true,
        styles: mapStyles
      });
      new window.google.maps.Marker({
        position: location,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#A78BFA",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        }
      });
    }
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '1rem', overflow: 'hidden', backgroundColor: '#242f3e' }} aria-label="Mapa de la ubicación de la propiedad" />;
};

export default GoogleMap;
