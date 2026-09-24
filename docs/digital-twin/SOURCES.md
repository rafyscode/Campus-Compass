# Data sources and geo audit

Audit date: 2026-09-16.

## Primary sources

1. **Leuphana Universität Lüneburg — Lageplan Zentraler Campus**  
   https://www.leuphana.de/universitaet/lageplaene.html  
   Used to verify the campus structure, building numbering and the relative placement of Mensa, Mensawiese, library, lecture halls, Biotopgarten and the central-building area.

2. **Leuphana — Factsheet Zentralgebäude**  
   https://www.leuphana.de/fileadmin/user_upload/universitaet/files/1804_02_ZG_FACT_SHEET_a4_final.pdf  
   Official maximum building height: **36.75 m**; footprint area: 5,000 m²; BGF: 21,000 m².

3. **Leuphana — Architektur Campus Leuphana**  
   https://www.leuphana.de/fileadmin/user_upload/Forschungseinrichtungen/ifsk/personen/kirschner_ursula/files/Architektur_Campus_Leuphana.pdf  
   Used for historical site plan cross-check and central-building architectural context.

4. **OpenStreetMap data via OpenFreeMap / OpenMapTiles**  
   https://openfreemap.org/  
   Live vector geometry for roads, paths, land use, vegetation and building footprints. OpenFreeMap states that its map data comes from OpenStreetMap.

5. **Wikidata — Zentralgebäude (Leuphana), Q758831**  
   OSM way ID 480715548 and building coordinates used as a cross-check.

6. **Lünepedia — Leuphana student portal / Mensa**  
   Used only as secondary coordinate cross-checks for Mensa, library, central building and building 9.

7. **Mapcarta pages backed by OpenStreetMap**  
   Used as secondary checks for OSM IDs and coordinates of Mensawiese, Hörsaal 2, Hörsaal 3, Hörsaal 4, Biotopgarten and related features.

## Quality decisions

- `central-building`: **verified** — coordinates/OSM ID cross-checked, official Leuphana maximum height used.
- `mensa`: **verified** — official site plan + OSM/Lünepedia coordinate.
- `library`: **verified** — official site plan + OSM/Lünepedia coordinate.
- `building-9`: **verified** — official site plan + OSM/Lünepedia coordinate.
- `building-14`: **derived** — official site plan and current Leuphana building address establish identity/relative position; search anchor is a derived centroid rather than a surveyed point.
- `building-8`: **derived** — official site plan and Leuphana Infoportal establish identity/relative position; search anchor is a derived centroid.
- `lecture-hall-2/3/4`: **verified** — explicit OSM ways and coordinates.
- `mensawiese`: **verified** — OSM way 25428436 + official site plan.
- `biotop-garden`: **verified** as a place; label anchor is at the mapped garden area.
- `central-campus-boundary`: **derived** — intentionally not claimed as a legal cadastral boundary; it is a visual campus outline constrained by official site-plan streets and the map geometry.

## Background imagery

8. **LGLN / OpenGeoData.NI — WMS NI DOP20 RGB**  
   `https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms`  
   Official Lower Saxony digital orthophotos (DOP20). The app requests the `ni_dop20` WMS layer at runtime in EPSG:3857. No image tiles are bundled into the repository. LGLN describes the DOP as georeferenced, true-scale orthophotos and makes the open geodata service available for external use.

The map therefore has three presentation modes without changing the underlying campus geometry: a focused vector Campus mode, a neutral vector Karte mode, and an official orthophoto Luftbild mode.
