import type { CampusPoi } from '../types/campus';

export interface RoomReference { label: string; building: string; floor: number; room: string }
export function parseRoomReference(query: string): RoomReference | undefined {
  const match = /^c\s*0*(\d{1,2})\s*[.]\s*(\d)(\d{2})$/i.exec(query.trim());
  if (!match) return undefined;
  return { label: `C ${Number(match[1])}.${match[2]}${match[3]}`, building: String(Number(match[1])), floor: Number(match[2]), room: match[3] };
}
export function searchCampus(query: string, pois: CampusPoi[]) {
  const room = parseRoomReference(query);
  if (room) return pois.filter(poi => poi.buildingNumber === room.building).map(poi => ({ poi, room }));
  const needle = query.trim().toLocaleLowerCase('de-DE').replace(/\s+/g, ' ');
  const building = /^(?:c\s*|gebäude\s*)?0*(\d{1,2})$/i.exec(needle)?.[1];
  return pois.filter(poi => !needle || (building ? poi.buildingNumber === String(Number(building)) :
    `${poi.name} ${poi.shortLabel ?? ''} ${poi.buildingNumber ?? ''}`.toLocaleLowerCase('de-DE').includes(needle)))
    .slice(0, 7).map(poi => ({ poi, room: undefined }));
}
