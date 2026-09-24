import { create } from 'zustand'
import type { BuildingSelection, MapMode, QualityLevel } from '../types/campus'

interface CampusState {
  selected: BuildingSelection | null
  query: string
  quality: QualityLevel
  mapMode: MapMode
  showLabels: boolean
  showCampusBoundary: boolean
  setSelected: (selected: BuildingSelection | null) => void
  setQuery: (query: string) => void
  setQuality: (quality: QualityLevel) => void
  setMapMode: (mapMode: MapMode) => void
  setShowLabels: (showLabels: boolean) => void
  setShowCampusBoundary: (showCampusBoundary: boolean) => void
}

export const useCampusStore = create<CampusState>((set) => ({
  selected: null,
  query: '',
  quality: 'auto',
  mapMode: 'campus',
  showLabels: true,
  showCampusBoundary: true,
  setSelected: (selected) => set({ selected }),
  setQuery: (query) => set({ query }),
  setQuality: (quality) => set({ quality }),
  setMapMode: (mapMode) => set({ mapMode }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setShowCampusBoundary: (showCampusBoundary) => set({ showCampusBoundary }),
}))
