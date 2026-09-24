import { useMemo, useState } from 'react'
import { searchablePois } from '../data/campus/pois'
import { useCampusStore } from '../stores/campusStore'
import type { CampusPoi } from '../types/campus'

interface SearchBoxProps {
  onSelect: (poi: CampusPoi) => void
}

export function SearchBox({ onSelect }: SearchBoxProps) {
  const query = useCampusStore((state) => state.query)
  const setQuery = useCampusStore((state) => state.setQuery)
  const [focused, setFocused] = useState(false)

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('de-DE')
    if (!needle) return searchablePois.slice(0, 6)
    return searchablePois.filter((poi) => poi.searchText.includes(needle)).slice(0, 7)
  }, [query])

  return (
    <div className="search-wrap">
      <div className="search-shell">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setFocused(false)
              ;(event.currentTarget as HTMLInputElement).blur()
            }
            if (event.key === 'Enter' && results[0]) {
              onSelect(results[0])
              setFocused(false)
              ;(event.currentTarget as HTMLInputElement).blur()
            }
          }}
          placeholder="Gebäude oder Ort suchen"
          aria-label="Campus durchsuchen"
          autoComplete="off"
        />
        {query && (
          <button className="icon-button compact" onClick={() => setQuery('')} aria-label="Suche löschen">×</button>
        )}
      </div>
      {focused && (
        <div className="search-results" role="listbox">
          {results.length > 0 ? results.map((poi) => (
            <button
              key={poi.id}
              className="search-result"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(poi)
                setQuery(poi.name)
                setFocused(false)
              }}
            >
              <span>
                <strong>{poi.name}</strong>
                <small>{poi.buildingNumber ? `Gebäude ${poi.buildingNumber} · ` : ''}{labelForCategory(poi.category)}</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          )) : (
            <div className="search-empty">Kein passender Campus-Ort gefunden.</div>
          )}
        </div>
      )}
    </div>
  )
}

function labelForCategory(category: CampusPoi['category']) {
  const labels: Record<CampusPoi['category'], string> = {
    landmark: 'Wahrzeichen',
    food: 'Gastronomie',
    library: 'Bibliothek',
    teaching: 'Lehre',
    administration: 'Service / Verwaltung',
    'student-life': 'Studentisches Leben',
    green: 'Grünfläche',
    transport: 'Mobilität',
  }
  return labels[category]
}
