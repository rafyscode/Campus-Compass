# Campus geodata

This folder contains only compact, hand-audited campus metadata that the UI needs for search, focus and data-quality display.

The base geometry (roads, paths, land-use, vegetation and building footprints) is loaded at runtime from OpenFreeMap's OpenMapTiles vector tiles, which are based on OpenStreetMap. This keeps the campus geometry current and avoids shipping a stale duplicated OSM extract.

Files:
- `poi.geojson`: verified/derived campus POIs and search anchors.
- `campus-boundary.geojson`: derived outline of the central campus, constrained by the official Leuphana site plan and surrounding streets.

Every local feature carries a `confidence` field: `verified`, `derived` or `estimated`.
