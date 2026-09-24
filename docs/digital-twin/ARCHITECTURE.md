# Architecture overview

## Rendering

MapLibre owns the WebGL canvas, camera and map gesture system. The OpenFreeMap style supplies OSM-derived vector tiles. On style load the app suppresses the flat building fill and inserts a `fill-extrusion` layer using the OpenMapTiles building source layer.

## Application state

Zustand stores selected building, search query, quality mode and layer toggles. MapLibre's camera state stays inside MapLibre to avoid React re-render churn.

## Data layer

- Base geodata: streamed vector tiles from OpenFreeMap.
- Audited POIs: `src/data/campus/poi.geojson`.
- Derived central-campus visual boundary: `src/data/campus/campus-boundary.geojson`.
- Data-quality metadata lives on each feature.

## Extension seams

- `CampusLiveDataProvider`: occupancy or sensor backends.
- Selected-building GeoJSON source: can receive live style/heatmap state.
- A/B route layer can be added without replacing the map.
- Indoor data can become additional GeoJSON/vector sources keyed by `buildingId`.
- A high-detail glTF/BIM of C40 can be added as a MapLibre custom layer while preserving the current camera and UI.
