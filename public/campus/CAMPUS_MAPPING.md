# Campus Compass — Mapping documentation

## Coordinate model

Campus Compass uses a local metre coordinate system centered near the central campus (`53.22855, 10.40143`). `geoToWorld()` projects latitude/longitude into local east/south metre coordinates. `planPixelToWorld()` is an affine calibration derived from three independently located anchors (Mensa, Universitätsbibliothek and Zentralgebäude). Additional open-data lecture-hall locations are used as secondary plausibility checks.

This gives one consistent coordinate space for ground, paths, building footprints, labels, camera presets and future sensor zones.

## Recognized buildings

| App ID | Map object | Geometry | Height |
| --- | --- | --- | --- |
| `mensa` | Mensa / Gebäude 3 | geospatial anchor + official-plan footprint approximation | approximate |
| `library` | Universitätsbibliothek | geospatial anchor + official-plan footprint approximation | approximate |
| `9` | Gebäude 9 / Hörsäle 1–4 | official-plan footprint + secondary open-data plausibility check | approximate |
| `central` | Zentralgebäude / Gebäude 40 | geospatial anchor + angular multi-volume abstraction | **36.75 m maximum height, officially published** |
| `1,4,5,6,7,8,10,11,12,13,14,16,20,21,22,25,26,27,28,41` | numbered campus buildings / sports / service buildings | official-plan footprint approximation | approximate |

## Central Building

Official architecture reference: `https://www.leuphana.de/universitaet/campus/zentralgebaeude/architektur.html`  
Official factsheet: `https://www.leuphana.de/fileadmin/user_upload/universitaet/files/1804_02_ZG_FACT_SHEET_a4_final.pdf`

The Central Building is deliberately not represented as a cuboid. Its web model uses an angular base volume plus two stepped, non-orthogonal upper volumes. This is a low-polygon interpretation of Daniel Libeskind's asymmetrical, staggered architecture, optimized for real-time WebGL rather than a photogrammetric reconstruction.

## Ground interpretation

The model includes the main campus roads, internal pedestrian axes, Mensawiese / sports lawn, Bibliotheksgarten, Biotopgarten, central plaza and parking areas P1/P3/P4 as original vector geometry. They are not a reproduction of the source artwork.

## Known uncertainty

This Phase-1 twin is **not cadastral/survey geometry**. Fine details such as exact facade offsets, roof slopes, tree locations and most building heights are illustrative. Future versions can replace any building footprint or height independently without changing the rendering architecture.

## Calibration notes

The raster-to-world affine transform is calibrated to semantic building centroids in the supplied plan and open geographic anchors. This avoids claiming survey precision: secondary lecture-hall checks are expected to differ by several metres because POI coordinates may refer to entrances, sub-volumes or labels rather than cadastral centroids.
