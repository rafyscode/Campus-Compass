import type { FeatureCollection, LineString, Position } from 'geojson';

export type WalkwayProperties = { nodeIds?: string[]; blockedNodeIds?: string[]; access?: string; foot?: string; [key: string]: unknown };
export interface WalkGraph { nodes: Map<string, Position>; edges: Map<string, Map<string, number>> }
export interface CampusRoute { coordinates: Position[]; distance: number; minutes: number; startGap: number; endGap: number }
export function meters(a: Position, b: Position) {
  const rad = Math.PI / 180;
  const lat = (b[1] - a[1]) * rad, lon = (b[0] - a[0]) * rad;
  const h = Math.sin(lat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(lon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function createWalkGraph(data: FeatureCollection<LineString, WalkwayProperties>): WalkGraph {
  const nodes = new Map<string, Position>(), edges = new Map<string, Map<string, number>>();
  const blocked = new Set(data.features.flatMap(feature => feature.properties.blockedNodeIds ?? []));
  for (const feature of data.features) {
    const { access, foot } = feature.properties;
    if (foot === 'no' || foot === 'private' || (['private', 'no'].includes(String(access)) && !['yes', 'designated', 'permissive'].includes(String(foot)))) continue;
    const coordinates = feature.geometry.coordinates;
    const ids = coordinates.map((point, i) => feature.properties.nodeIds?.[i] ?? point.join(','));
    coordinates.forEach((point, i) => { if (!blocked.has(ids[i])) { nodes.set(ids[i], point); if (!edges.has(ids[i])) edges.set(ids[i], new Map()); } });
    for (let i = 1; i < ids.length; i++) {
      if (blocked.has(ids[i - 1]) || blocked.has(ids[i])) continue;
      const length = meters(coordinates[i - 1], coordinates[i]);
      edges.get(ids[i - 1])!.set(ids[i], length);
      // Motor-vehicle oneway tags do not restrict pedestrians.
      edges.get(ids[i])!.set(ids[i - 1], length);
    }
  }
  return { nodes, edges };
}
export function findCampusRoute(graph: WalkGraph, start: Position, end: Position): CampusRoute | null {
  const nearest = (target: Position) => [...graph.nodes].reduce<{ id: string; gap: number } | null>((best, [id, point]) => {
    const gap = meters(point, target); return !best || gap < best.gap ? { id, gap } : best;
  }, null);
  const from = nearest(start), to = nearest(end);
  if (!from || !to || from.gap > 100 || to.gap > 100) return null;
  const distances = new Map<string, number>([[from.id, 0]]), previous = new Map<string, string>();
  const pending = new Set([from.id]), visited = new Set<string>();
  while (pending.size) {
    let current = pending.values().next().value!;
    for (const id of pending) if (distances.get(id)! < distances.get(current)!) current = id;
    pending.delete(current);
    if (current === to.id) break;
    visited.add(current);
    for (const [next, length] of graph.edges.get(current) ?? []) {
      if (visited.has(next)) continue;
      const distance = distances.get(current)! + length;
      if (distance < (distances.get(next) ?? Infinity)) { distances.set(next, distance); previous.set(next, current); pending.add(next); }
    }
  }
  if (!distances.has(to.id)) return null;
  const path = [to.id];
  while (path[0] !== from.id) { const parent = previous.get(path[0]); if (!parent) return null; path.unshift(parent); }
  const distance = distances.get(to.id)!;
  return { coordinates: path.map(id => graph.nodes.get(id)!), distance, minutes: Math.max(1, Math.ceil(distance / 78)), startGap: from.gap, endGap: to.gap };
}
