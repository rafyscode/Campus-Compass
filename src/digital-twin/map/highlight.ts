import type { GeoJSONSource, Map } from 'maplibre-gl';
import { campusBuildings } from '../data/campus/buildings';

export function clearBuildingHighlight(map: Map) {
  if (!map.getSource('campus-buildings')) return;
  map.removeFeatureState({ source: 'campus-buildings' });
  (map.getSource('selected-building') as GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features: [] });
}

/** A stable building ID synchronizes roof color, outline and the clicked label. */
export function highlightBuilding(map: Map, id: string | null) {
  clearBuildingHighlight(map);
  const building = campusBuildings.features.find((feature) => feature.properties.id === id);
  if (!building) return;
  for (const feature of campusBuildings.features) map.setFeatureState({ source: 'campus-buildings', id: feature.id ?? feature.properties.id }, { subordinate: feature.properties.id !== id });
  map.setFeatureState({ source: 'campus-buildings', id: building.id ?? building.properties.id }, { selected: true });
  (map.getSource('selected-building') as GeoJSONSource).setData({ type: 'FeatureCollection', features: [building] });
}
