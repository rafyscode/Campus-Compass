import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CAMPUS_BUILDINGS } from '../../data/campus';

export function CampusSearch({ onSelect }: { onSelect: (buildingId: string) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('de-DE');
    if (!normalized) return CAMPUS_BUILDINGS.filter((building) => building.important).slice(0, 6);
    return CAMPUS_BUILDINGS.filter((building) => `${building.name} ${building.shortName} ${building.number ?? ''}`.toLocaleLowerCase('de-DE').includes(normalized)).slice(0, 7);
  }, [query]);

  return (
    <div className={`campus-search ${query ? 'is-open' : ''}`}>
      <div className="campus-search-input-wrap">
        <Search size={15} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setQuery((value) => value)}
          placeholder="Gebäude suchen …"
          aria-label="Campusgebäude suchen"
        />
        {query && <button type="button" className="campus-icon-button is-small" aria-label="Suche leeren" onClick={() => setQuery('')}><X size={14} /></button>}
      </div>
      <div className="campus-search-results">
        {results.map((building) => (
          <button key={building.id} type="button" onClick={() => { onSelect(building.id); setQuery(''); }}>
            <span>{building.shortName}</span>
            <small>{building.name}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
