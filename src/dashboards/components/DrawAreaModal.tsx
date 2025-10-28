import React, { useEffect, useRef } from 'react';
import GlassCard from '../../components/GlassCard';
import { XIcon } from '../../components/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

type LatLngLiteral = { lat: number; lng: number };

interface DrawAreaModalProps {
    isOpen: boolean;
    initialPath?: LatLngLiteral[] | null;
    onClose: () => void;
    onSave: (path: LatLngLiteral[]) => void;
}

const DEFAULT_CENTER: LatLngLiteral = { lat: 40.416775, lng: -3.70379 }; // Madrid

const polygonStyle: L.PolylineOptions = {
    color: '#8b5cf6',
    weight: 2,
    opacity: 1,
    fillColor: '#8b5cf6',
    fillOpacity: 0.2,
};

const DrawAreaModal: React.FC<DrawAreaModalProps> = ({ isOpen, initialPath, onClose, onSave }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
    const polygonRef = useRef<L.Polygon | null>(null);

    useEffect(() => {
        if (!isOpen || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
        });
        mapRef.current = map;

        const startingPoint = initialPath && initialPath.length > 0 ? initialPath[0] : DEFAULT_CENTER;
        map.setView([startingPoint.lat, startingPoint.lng], initialPath ? 13 : 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const drawnItems = new L.FeatureGroup();
        drawnItemsRef.current = drawnItems;
        map.addLayer(drawnItems);

        if (initialPath && initialPath.length > 2) {
            const latLngs = initialPath.map(point => [point.lat, point.lng]) as Array<[number, number]>;
            const polygon = L.polygon(latLngs, polygonStyle).addTo(drawnItems);
            polygonRef.current = polygon;
            map.fitBounds(polygon.getBounds(), { padding: [24, 24] });
        }

        const DrawControl: any = (L.Control as any).Draw;
        const drawEvents: any = (L as any).Draw?.Event;

        const control = new DrawControl({
            position: 'topright',
            edit: {
                featureGroup: drawnItems,
                remove: true,
                poly: { allowIntersection: false },
            },
            draw: {
                marker: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                polyline: false,
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: polygonStyle,
                },
            },
        });
        map.addControl(control as L.Control);

        const handleCreated = (event: any) => {
            const { layer } = event;
            if (polygonRef.current) {
                drawnItems.removeLayer(polygonRef.current);
            }
            drawnItems.addLayer(layer);
            polygonRef.current = layer as L.Polygon;
        };

        const handleEdited = (event: any) => {
            event.layers.eachLayer((layer: L.Layer) => {
                polygonRef.current = layer as L.Polygon;
            });
        };

        const handleDeleted = () => {
            polygonRef.current = null;
        };

        if (drawEvents) {
            map.on(drawEvents.CREATED, handleCreated);
            map.on(drawEvents.EDITED, handleEdited);
            map.on(drawEvents.DELETED, handleDeleted);
        }

        if ((!initialPath || initialPath.length === 0) && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 13);
                },
                () => {
                    // ignore failures, keep default center
                },
                { enableHighAccuracy: true, timeout: 5000 },
            );
        }

        return () => {
            if (drawEvents) {
                map.off(drawEvents.CREATED, handleCreated);
                map.off(drawEvents.EDITED, handleEdited);
                map.off(drawEvents.DELETED, handleDeleted);
            }
            map.remove();
            mapRef.current = null;
            drawnItemsRef.current = null;
            polygonRef.current = null;
        };
    }, [isOpen, initialPath]);

    const handleSave = () => {
        if (!polygonRef.current) {
            onSave([]);
        } else {
            const path = polygonRef.current
                .getLatLngs()[0]
                .map((point: L.LatLng) => ({ lat: point.lat, lng: point.lng })) as LatLngLiteral[];
            onSave(path);
        }
        onClose();
    };

    const handleClear = () => {
        if (drawnItemsRef.current && polygonRef.current) {
            drawnItemsRef.current.removeLayer(polygonRef.current);
        }
        polygonRef.current = null;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <GlassCard className="w-full max-w-4xl h-[75vh] text-white relative !p-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold">Dibuja tu zona de búsqueda</h2>
                        <p className="text-sm text-white/70">
                            Traza una zona sobre el mapa para ver solo las propiedades dentro del área seleccionada.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Cerrar">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="h-full flex flex-col">
                    <div ref={mapContainerRef} className="h-[calc(75vh-160px)] w-full overflow-hidden" />
                    <div className="sticky bottom-0 px-4 pb-4 sm:px-6 sm:pb-6">
                        <div className="rounded-3xl border border-white/15 bg-black/60 backdrop-blur-md p-4 sm:p-5 shadow-lg">
                            <p className="text-sm text-white/70">
                                Sugerencia: utiliza la herramienta de polígono para dibujar tu zona ideal. Puedes volver a dibujar tantas veces
                                como quieras.
                            </p>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/15 transition"
                                >
                                    Limpiar dibujo
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/40 transition hover:shadow-indigo-500/60"
                                >
                                    Aplicar zona
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default DrawAreaModal;
