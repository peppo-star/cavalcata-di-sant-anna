'use client';

import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, LocateFixed, TriangleAlert } from 'lucide-react';
import type { LngLatBounds, Map as MapLibreMap, Marker, Popup } from 'maplibre-gl';

import { Button } from '@/components/ui/button';
import { segments } from '@/lib/stages';

const STAGE_NAMES = [
  'Partenza',
  'Fontana monumentale',
  'Chiesa di San Vincenzo',
  'Piazza di Padre Pio',
  'Chiesa madre',
  'Ponte di Annibale',
  'Chiesa di Sant Anna',
];

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';
const TERRAIN_SOURCE = 'https://tiles.mapterhorn.com/tilejson.json';
const ROUTE_SOURCE_ID = 'cavalcata-route';
const ROUTE_LAYER_ID = 'cavalcata-route-progress';

type LatLngTuple = [number, number];
type LngLatTuple = [number, number];

export type DemoGpsReading = {
  accuracy: number;
  latitude: number;
  longitude: number;
  recordedAt: number;
};

type RoutePosition = {
  bearing: number;
  point: LatLngTuple;
};

type Stage = {
  name: string;
  point: LatLngTuple;
};

function coordinatesFromElement(element: Element | null): LatLngTuple[] {
  if (!element?.textContent) return [];

  return element.textContent
    .trim()
    .split(/\s+/)
    .map((coordinate) => {
      const [longitude, latitude] = coordinate.split(',').map(Number);
      return [latitude, longitude] as LatLngTuple;
    })
    .filter(([latitude, longitude]) => Number.isFinite(latitude) && Number.isFinite(longitude));
}

function parseKml(kml: string) {
  const document = new DOMParser().parseFromString(kml, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('Il file KML non è leggibile.');

  const placemarks = Array.from(document.getElementsByTagNameNS('*', 'Placemark'));
  const placemarkNamed = (name: string) =>
    placemarks.find(
      (placemark) =>
        placemark.getElementsByTagNameNS('*', 'name')[0]?.textContent?.trim() === name,
    );

  const routePlacemark = placemarkNamed('Percorso principale cavalli');
  const route = coordinatesFromElement(
    routePlacemark?.getElementsByTagNameNS('*', 'coordinates')[0] ?? null,
  );

  if (route.length < 2) throw new Error('Il percorso principale non è presente nel KML.');

  const stages = STAGE_NAMES.map((name) => {
    const placemark = placemarkNamed(name);
    const coordinates = coordinatesFromElement(
      placemark?.getElementsByTagNameNS('*', 'Point')[0]
        ?.getElementsByTagNameNS('*', 'coordinates')[0] ?? null,
    );

    return coordinates[0] ? { name, point: coordinates[0] } : null;
  }).filter((stage): stage is Stage => stage !== null);

  return { route, stages };
}

function distanceBetween([latitudeA, longitudeA]: LatLngTuple, [latitudeB, longitudeB]: LatLngTuple) {
  const earthRadius = 6_371_008.8;
  const radians = Math.PI / 180;
  const latitude1 = latitudeA * radians;
  const latitude2 = latitudeB * radians;
  const latitudeDifference = (latitudeB - latitudeA) * radians;
  const longitudeDifference = (longitudeB - longitudeA) * radians;
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDifference / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function buildCumulativeDistances(route: LatLngTuple[]) {
  const distances = [0];
  for (let index = 1; index < route.length; index += 1) {
    distances.push(distances[index - 1] + distanceBetween(route[index - 1], route[index]));
  }
  return distances;
}

function bearingBetween(
  [latitudeA, longitudeA]: LatLngTuple,
  [latitudeB, longitudeB]: LatLngTuple,
) {
  const radians = Math.PI / 180;
  const latitude1 = latitudeA * radians;
  const latitude2 = latitudeB * radians;
  const longitudeDifference = (longitudeB - longitudeA) * radians;
  const y = Math.sin(longitudeDifference) * Math.cos(latitude2);
  const x =
    Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDifference);

  return (Math.atan2(y, x) / radians + 360) % 360;
}

function positionAtProgress(
  route: LatLngTuple[],
  cumulativeDistances: number[],
  progress: number,
): RoutePosition {
  const safeProgress = Math.min(1, Math.max(0, progress));
  const totalDistance = cumulativeDistances.at(-1) ?? 0;
  const targetDistance = totalDistance * safeProgress;
  const nextIndex = cumulativeDistances.findIndex((distance) => distance >= targetDistance);

  if (nextIndex <= 0) {
    return {
      bearing: bearingBetween(route[0], route[1] ?? route[0]),
      point: route[0],
    };
  }

  if (nextIndex < 0) {
    const finalPoint = route.at(-1) ?? route[0];
    return {
      bearing: bearingBetween(route.at(-2) ?? finalPoint, finalPoint),
      point: finalPoint,
    };
  }

  const previousIndex = nextIndex - 1;
  const sectionLength = cumulativeDistances[nextIndex] - cumulativeDistances[previousIndex];
  const sectionProgress = sectionLength
    ? (targetDistance - cumulativeDistances[previousIndex]) / sectionLength
    : 0;
  const previous = route[previousIndex];
  const next = route[nextIndex];

  return {
    bearing: bearingBetween(previous, next),
    point: [
      previous[0] + (next[0] - previous[0]) * sectionProgress,
      previous[1] + (next[1] - previous[1]) * sectionProgress,
    ],
  };
}

function directionAtProgress(
  route: LatLngTuple[],
  cumulativeDistances: number[],
  progress: number,
) {
  const current = positionAtProgress(route, cumulativeDistances, progress);
  const ahead = positionAtProgress(route, cumulativeDistances, Math.min(1, progress + 0.004));
  if (distanceBetween(current.point, ahead.point) < 1) return current;

  return {
    point: current.point,
    bearing: bearingBetween(current.point, ahead.point),
  };
}

function smoothBearing(previous: number | null, next: number) {
  if (previous === null) return next;
  const shortestTurn = ((next - previous + 540) % 360) - 180;
  return (previous + shortestTurn * 0.32 + 360) % 360;
}

function toLngLat([latitude, longitude]: LatLngTuple): LngLatTuple {
  return [longitude, latitude];
}

function lineFeature(route: LatLngTuple[]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: route.map(toLngLat),
    },
  };
}

function routeGradient(progress: number) {
  const safeProgress = Math.min(0.9999, Math.max(0.0001, progress));
  return [
    'step',
    ['line-progress'],
    '#168fa2',
    safeProgress,
    'rgba(74, 84, 80, 0.32)',
  ];
}

function showWholeRoute(map: MapLibreMap, bounds: LngLatBounds, animate: boolean) {
  const mobile = window.innerWidth < 720;
  const camera = map.cameraForBounds(bounds, {
    maxZoom: 14.7,
    padding: mobile
      ? { top: 120, right: 28, bottom: 330, left: 28 }
      : { top: 100, right: 470, bottom: 46, left: 46 },
  });

  if (!camera) return;
  map.easeTo({
    ...camera,
    bearing: -12,
    duration: animate ? 1400 : 0,
    pitch: 42,
  });
}

function followCavalcata(map: MapLibreMap, position: RoutePosition, animate: boolean) {
  const mapHeight = map.getContainer().clientHeight;
  const behindHorseOffset = Math.min(120, Math.max(54, mapHeight * 0.12));

  map.easeTo({
    bearing: position.bearing,
    center: toLngLat(position.point),
    duration: animate ? 1700 : 0,
    easing: (time) => 1 - (1 - time) ** 3,
    offset: [0, behindHorseOffset],
    pitch: 62,
    zoom: window.innerWidth < 720 ? 16 : 16.4,
  });
}

function setMapInteraction(map: MapLibreMap, enabled: boolean) {
  const handlers = [
    map.scrollZoom,
    map.boxZoom,
    map.dragRotate,
    map.dragPan,
    map.keyboard,
    map.doubleClickZoom,
    map.touchZoomRotate,
  ];

  handlers.forEach((handler) => {
    if (enabled) handler.enable();
    else handler.disable();
  });
  map.getCanvas().style.cursor = enabled ? 'grab' : 'default';
}

function addTerrainAndBuildings(map: MapLibreMap) {
  const styleLayers = map.getStyle().layers ?? [];
  const firstSymbolLayer = styleLayers.find((layer) => layer.type === 'symbol')?.id;

  map.addSource('terrain-dem', {
    type: 'raster-dem',
    url: TERRAIN_SOURCE,
    tileSize: 512,
  });
  map.setTerrain({ exaggeration: 1.55, source: 'terrain-dem' });
  map.addLayer(
    {
      id: 'terrain-hillshade',
      type: 'hillshade',
      source: 'terrain-dem',
      paint: {
        'hillshade-accent-color': '#7f9c94',
        'hillshade-exaggeration': 0.46,
        'hillshade-highlight-color': '#fffdf7',
        'hillshade-shadow-color': '#233a34',
      },
    },
    firstSymbolLayer,
  );

  const buildingLayer = styleLayers.find((layer) => {
    const candidate = layer as typeof layer & { 'source-layer'?: string };
    return candidate['source-layer'] === 'building' && layer.type === 'fill';
  }) as (typeof styleLayers)[number] & { source?: string; 'source-layer'?: string } | undefined;

  if (!buildingLayer?.source || !buildingLayer['source-layer']) return;

  map.addLayer(
    {
      id: 'cavalcata-buildings-3d',
      type: 'fill-extrusion',
      source: buildingLayer.source,
      'source-layer': buildingLayer['source-layer'],
      minzoom: 14.5,
      paint: {
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-color': '#d9d4c7',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 7],
        'fill-extrusion-opacity': 0.66,
      },
    },
    firstSymbolLayer,
  );
}

function addRoute(map: MapLibreMap, route: LatLngTuple[], progress: number) {
  map.addSource(ROUTE_SOURCE_ID, {
    type: 'geojson',
    data: lineFeature(route),
    lineMetrics: true,
  });

  map.addLayer({
    id: 'cavalcata-route-shadow',
    type: 'line',
    source: ROUTE_SOURCE_ID,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-blur': 3,
      'line-color': 'rgba(9, 43, 49, 0.32)',
      'line-width': ['interpolate', ['linear'], ['zoom'], 12, 7, 17, 16],
      'line-translate': [0, 3],
    },
  });
  map.addLayer({
    id: 'cavalcata-route-casing',
    type: 'line',
    source: ROUTE_SOURCE_ID,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': 'rgba(255, 253, 247, 0.94)',
      'line-width': ['interpolate', ['linear'], ['zoom'], 12, 6, 17, 15],
    },
  });
  map.addLayer({
    id: ROUTE_LAYER_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-gradient': routeGradient(progress),
      'line-width': ['interpolate', ['linear'], ['zoom'], 12, 4, 17, 10],
    },
  });
}

function createHorseMarker(
  maplibre: typeof import('maplibre-gl'),
  map: MapLibreMap,
  point: LatLngTuple,
) {
  const element = document.createElement('div');
  element.className = 'live-horse-marker';
  element.setAttribute('aria-label', 'Posizione GPS simulata della Cavalcata');
  element.innerHTML =
    '<span class="horse-pulse"></span><span class="horse-symbol" aria-hidden="true">🐎</span>';

  return new maplibre.Marker({ anchor: 'center', element })
    .setLngLat(toLngLat(point))
    .addTo(map);
}

function createStagePopup(
  maplibre: typeof import('maplibre-gl'),
  map: MapLibreMap,
  stage: Stage,
  stageIndex: number,
  onExplore: () => void,
) {
  const card = document.createElement('div');
  card.className = 'stage-popup-card';

  const image = document.createElement('img');
  image.className = 'stage-popup-image';
  image.src = segments[stageIndex]?.photos[0].src ?? '/og.png';
  image.alt = segments[stageIndex]?.photos[0].alt ?? stage.name;

  const details = document.createElement('div');
  details.className = 'stage-popup-details';

  const name = document.createElement('strong');
  name.textContent = stage.name;

  const exploreButton = document.createElement('button');
  exploreButton.className = 'stage-popup-explore';
  exploreButton.type = 'button';
  exploreButton.textContent = 'Esplora';
  exploreButton.addEventListener('click', onExplore);

  details.append(name, exploreButton);
  card.append(image, details);

  return new maplibre.Popup({
    anchor: 'bottom',
    className: 'stage-map-popup',
    closeButton: true,
    closeOnClick: true,
    maxWidth: '320px',
    offset: 30,
  })
    .setLngLat(toLngLat(stage.point))
    .setDOMContent(card)
    .addTo(map);
}

type CavalcataMapProps = {
  activeStageIndex: number;
  focusRequestId: number;
  followPosition: boolean;
  interactive: boolean;
  onExploreStage: (stageIndex: number) => void;
  onGpsReading?: (reading: DemoGpsReading) => void;
  progress: number;
};

export function CavalcataMap({
  activeStageIndex,
  focusRequestId,
  followPosition,
  interactive,
  onExploreStage,
  onGpsReading,
  progress,
}: CavalcataMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const routeRef = useRef<LatLngTuple[]>([]);
  const distancesRef = useRef<number[]>([]);
  const liveMarkerRef = useRef<Marker | null>(null);
  const stageMarkersRef = useRef<Marker[]>([]);
  const popupRef = useRef<Popup | null>(null);
  const boundsRef = useRef<LngLatBounds | null>(null);
  const progressRef = useRef(progress);
  const followPositionRef = useRef(followPosition);
  const interactiveRef = useRef(interactive);
  const cameraDetachedRef = useRef(false);
  const onGpsReadingRef = useRef(onGpsReading);
  const onExploreStageRef = useRef(onExploreStage);
  const lastCameraUpdateRef = useRef(0);
  const cameraBearingRef = useRef<number | null>(null);
  const previousProgressRef = useRef(progress);
  const introTimerRef = useRef<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cameraDetached, setCameraDetached] = useState(false);

  progressRef.current = progress;
  followPositionRef.current = followPosition;
  interactiveRef.current = interactive;
  cameraDetachedRef.current = cameraDetached;
  onGpsReadingRef.current = onGpsReading;
  onExploreStageRef.current = onExploreStage;

  useEffect(() => {
    let cancelled = false;

    async function initialiseMap() {
      try {
        const [maplibre, response] = await Promise.all([
          import('maplibre-gl'),
          fetch('/cavalcata-mappa.kml'),
        ]);
        if (!response.ok) throw new Error('Non riesco a caricare il percorso.');

        const { route, stages } = parseKml(await response.text());
        if (cancelled || !containerRef.current) return;

        const cumulativeDistances = buildCumulativeDistances(route);
        const currentPosition = positionAtProgress(route, cumulativeDistances, progressRef.current);
        const map = new maplibre.Map({
          attributionControl: false,
          bearing: -18,
          canvasContextAttributes: { antialias: true },
          center: toLngLat(currentPosition.point),
          container: containerRef.current,
          interactive: interactiveRef.current,
          maxPitch: 75,
          pitch: 58,
          style: MAP_STYLE,
          zoom: 14,
        });
        mapRef.current = map;

        map.addControl(
          new maplibre.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
          'top-right',
        );
        map.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-right');
        map.on('movestart', (event) => {
          const movement = event as typeof event & { originalEvent?: Event };
          if (movement.originalEvent) pauseCameraFollow();
        });

        // load attende anche tutti i tasselli remoti visibili. In produzione
        // una singola sorgente lenta può lasciare l'attesa bloccata, anche se
        // lo stile è già pronto. Qui basta attendere il caricamento dello stile.
        await new Promise<void>((resolve) => {
          if (map.isStyleLoaded()) {
            resolve();
            return;
          }

          map.once('style.load', () => resolve());
        });
        if (cancelled) return;

        addTerrainAndBuildings(map);
        addRoute(map, route, progressRef.current);

        const liveMarker = createHorseMarker(maplibre, map, currentPosition.point);
        const stageMarkers = stages.map((stage, index) => {
          const element = document.createElement('button');
          element.className = 'route-stage-marker';
          element.type = 'button';
          element.title = stage.name;
          element.disabled = !interactiveRef.current;
          element.setAttribute('aria-label', `Apri le informazioni su ${stage.name}`);

          const image = document.createElement('img');
          image.src = segments[index]?.photos[0].src ?? '/og.png';
          image.alt = '';
          image.setAttribute('aria-hidden', 'true');
          element.append(image);

          element.addEventListener('click', (event) => {
            event.stopPropagation();
            pauseCameraFollow();
            popupRef.current?.remove();
            const popup = createStagePopup(maplibre, map, stage, index, () => {
              popup.remove();
              popupRef.current = null;
              onExploreStageRef.current(index);
            });
            popup.on('close', () => {
              if (popupRef.current === popup) popupRef.current = null;
            });
            popupRef.current = popup;
            map.easeTo({ center: toLngLat(stage.point), duration: 550 });
          });

          return new maplibre.Marker({ anchor: 'center', element })
            .setLngLat(toLngLat(stage.point))
            .addTo(map);
        });

        const bounds = route.reduce(
          (routeBounds, point) => routeBounds.extend(toLngLat(point)),
          new maplibre.LngLatBounds(),
        );
        routeRef.current = route;
        distancesRef.current = cumulativeDistances;
        liveMarkerRef.current = liveMarker;
        stageMarkersRef.current = stageMarkers;
        boundsRef.current = bounds;

        showWholeRoute(map, bounds, false);
        setStatus('ready');

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        introTimerRef.current = window.setTimeout(() => {
          if (cancelled || !followPositionRef.current || cameraDetachedRef.current) return;
          followCavalcata(map, currentPosition, !reducedMotion);
        }, reducedMotion ? 0 : 1000);
      } catch (error) {
        console.error('Errore durante l\'inizializzazione della mappa 3D:', error);
        if (!cancelled) setStatus('error');
      }
    }

    initialiseMap();

    return () => {
      cancelled = true;
      if (introTimerRef.current !== null) window.clearTimeout(introTimerRef.current);
      popupRef.current?.remove();
      stageMarkersRef.current.forEach((marker) => marker.remove());
      liveMarkerRef.current?.remove();
      stageMarkersRef.current = [];
      liveMarkerRef.current = null;
      boundsRef.current = null;
      routeRef.current = [];
      distancesRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    setMapInteraction(mapRef.current, interactive);
    stageMarkersRef.current.forEach((marker) => {
      const element = marker.getElement();
      if (element instanceof HTMLButtonElement) element.disabled = !interactive;
    });
    if (!interactive) {
      popupRef.current?.remove();
      popupRef.current = null;
      cameraDetachedRef.current = false;
      cameraBearingRef.current = null;
      setCameraDetached(false);
      if (boundsRef.current) showWholeRoute(mapRef.current, boundsRef.current, true);
    }
  }, [interactive]);

  useEffect(() => {
    const route = routeRef.current;
    const distances = distancesRef.current;
    const map = mapRef.current;
    if (!route.length || !distances.length || !map) return;

    const position = positionAtProgress(route, distances, progress);
    const direction = directionAtProgress(route, distances, progress);
    const cameraPosition = {
      point: position.point,
      bearing: smoothBearing(cameraBearingRef.current, direction.bearing),
    };
    cameraBearingRef.current = cameraPosition.bearing;
    liveMarkerRef.current?.setLngLat(toLngLat(position.point));
    map.setPaintProperty(ROUTE_LAYER_ID, 'line-gradient', routeGradient(progress));

    onGpsReadingRef.current?.({
      accuracy: Math.round(5 + 3 * (0.5 + Math.sin(progress * 73) / 2)),
      latitude: position.point[0],
      longitude: position.point[1],
      recordedAt: Date.now(),
    });

    const now = performance.now();
    const routeRestarted = progress < previousProgressRef.current;
    previousProgressRef.current = progress;

    if (
      routeRestarted &&
      boundsRef.current &&
      followPosition &&
      !cameraDetachedRef.current
    ) {
      showWholeRoute(map, boundsRef.current, true);
      lastCameraUpdateRef.current = now;
      return;
    }

    if (
      followPosition &&
      !cameraDetachedRef.current &&
      !popupRef.current &&
      now - lastCameraUpdateRef.current > 1800
    ) {
      followCavalcata(
        map,
        cameraPosition,
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      );
      lastCameraUpdateRef.current = now;
    }
  }, [followPosition, progress]);

  useEffect(() => {
    if (!followPosition || cameraDetached || !mapRef.current) return;

    const route = routeRef.current;
    const distances = distancesRef.current;
    if (!route.length || !distances.length) return;
    followCavalcata(
      mapRef.current,
      directionAtProgress(route, distances, progressRef.current),
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, [followPosition, cameraDetached]);

  useEffect(() => {
    if (!focusRequestId || status !== 'ready' || !mapRef.current) return;

    const route = routeRef.current;
    const distances = distancesRef.current;
    if (!route.length || !distances.length) return;

    popupRef.current?.remove();
    popupRef.current = null;
    cameraDetachedRef.current = false;
    setCameraDetached(false);
    const position = directionAtProgress(route, distances, progressRef.current);
    cameraBearingRef.current = position.bearing;
    followCavalcata(
      mapRef.current,
      position,
      true,
    );
    lastCameraUpdateRef.current = performance.now();
  }, [focusRequestId, status]);

  useEffect(() => {
    stageMarkersRef.current.forEach((marker, index) => {
      const element = marker.getElement();
      element.classList.toggle('is-current', index === activeStageIndex);
      element.classList.toggle('is-visited', index < activeStageIndex);
    });
  }, [activeStageIndex, status]);

  function pauseCameraFollow() {
    cameraDetachedRef.current = true;
    setCameraDetached(true);
  }

  function recenterOnCavalcata() {
    const map = mapRef.current;
    const route = routeRef.current;
    const distances = distancesRef.current;
    if (!map || !route.length || !distances.length) return;

    popupRef.current?.remove();
    popupRef.current = null;
    cameraDetachedRef.current = false;
    setCameraDetached(false);
    const position = directionAtProgress(route, distances, progressRef.current);
    cameraBearingRef.current = position.bearing;
    followCavalcata(map, position, true);
    lastCameraUpdateRef.current = performance.now();
  }

  return (
    <div className={`real-map-shell ${interactive ? 'is-interactive' : 'is-passive'}`}>
      <div
        ref={containerRef}
        className="maplibre-map"
        aria-label={interactive
          ? 'Mappa tridimensionale interattiva del percorso della Cavalcata'
          : 'Anteprima della mappa tridimensionale del percorso della Cavalcata'}
      />

      {status === 'ready' && (
        <div className="terrain-badge" aria-label="Mappa con terreno tridimensionale">
          <span aria-hidden="true" />
          Terreno 3D
        </div>
      )}

      {status === 'loading' && (
        <div className="map-status" role="status">
          <LoaderCircle className="map-status-spinner" aria-hidden="true" />
          <span>Preparo il terreno 3D…</span>
        </div>
      )}

      {status === 'error' && (
        <div className="map-status map-status-error" role="alert">
          <TriangleAlert aria-hidden="true" />
          <span>La mappa 3D non è disponibile. Controlla la connessione.</span>
        </div>
      )}

      <Button
        className="map-fit-button"
        variant="outline"
        size="sm"
        type="button"
        aria-label="Ricentra la mappa sul cavallo e seguilo"
        title="Ricentra la mappa sul cavallo"
        disabled={status !== 'ready' || !interactive}
        onClick={recenterOnCavalcata}
      >
        <LocateFixed data-icon="inline-start" aria-hidden="true" />
        Ricentra
      </Button>
    </div>
  );
}
