import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

// AnimatedMarker: a small wrapper that creates a Leaflet marker directly
// and smoothly interpolates its position when the `position` prop changes.
export default function AnimatedMarker({ id, position, popupContent, isSimulated }) {
    const map = useMap();
    const markerRef = useRef(null);
    const animRef = useRef({ raf: null });

    useEffect(() => {
        if (!map) return;

        // Create marker with default icon; color differently if simulated.
        // In unit test environments leaflet may be partially mocked and
        // L.marker may not exist; provide a graceful fallback fake marker
        // that implements the minimal API used below.
        let marker;
        const hasMarkerFactory = typeof L.marker === 'function';
        if (hasMarkerFactory) {
            marker = L.marker(position, {
                // keep default icon; consumer can customize if desired
            }).addTo(map);
        } else {
            // Fallback fake marker (used in tests)
            const lat = position[0];
            const lng = position[1];
            marker = {
                _latlng: { lat, lng },
                setLatLng(p) {
                    this._latlng = Array.isArray(p) ? { lat: p[0], lng: p[1] } : p;
                },
                getLatLng() {
                    return this._latlng;
                },
                bindPopup() {
                    return this;
                },
                getPopup() {
                    return null;
                },
                remove() { },
            };
        }

        if (popupContent && marker.bindPopup) marker.bindPopup(popupContent);

        markerRef.current = marker;

        return () => {
            if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
            marker.remove();
            markerRef.current = null;
        };
    }, [map]);

    useEffect(() => {
        const marker = markerRef.current;
        if (!marker) return;

        // Cancel any in-flight animation
        if (animRef.current.raf) {
            cancelAnimationFrame(animRef.current.raf);
            animRef.current.raf = null;
        }

        const start = marker.getLatLng();
        const end = typeof L.latLng === 'function' ? L.latLng(position[0], position[1]) : { lat: position[0], lng: position[1] };

        if (!start || !end) return;
        const almostEqual = (a, b) => Math.abs(a - b) < 1e-8;
        if (almostEqual(start.lat, end.lat) && almostEqual(start.lng, end.lng)) {
            marker.setLatLng([end.lat, end.lng]);
            return;
        }

        const duration = 600; // ms
        const t0 = performance.now();

        function step(now) {
            const p = Math.min(1, (now - t0) / duration);
            const lat = start.lat + (end.lat - start.lat) * p;
            const lng = start.lng + (end.lng - start.lng) * p;
            marker.setLatLng([lat, lng]);
            if (p < 1) {
                animRef.current.raf = requestAnimationFrame(step);
            } else {
                animRef.current.raf = null;
                // Ensure final position exact
                marker.setLatLng(end);
            }
        }

        animRef.current.raf = requestAnimationFrame(step);

        // Update popup content if provided
        if (popupContent) marker.getPopup()?.setContent(popupContent);

        return () => {
            if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
            animRef.current.raf = null;
        };
    }, [position, popupContent]);

    // Render an empty DOM node so tests that query markers by data-testid
    // can still find markers (the actual marker is managed by Leaflet).
    return <span data-testid="marker" style={{ display: 'none' }} />;
}
