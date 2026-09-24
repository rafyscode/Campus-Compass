import { useTranslation } from '../../i18n/context';
import { useMemo, useState } from 'react';
import { campusPois } from '../data/campus/pois';
import { useCampusStore } from '../stores/campusStore';
import { searchCampus, type RoomReference } from '../utils/search';
import type { CampusPoi } from '../types/campus';

export function SearchBox({ onSelect }: { onSelect: (poi: CampusPoi, room?: RoomReference) => void }) {
  const { t } = useTranslation();
  const query = useCampusStore(state => state.query);
  const setQuery = useCampusStore(state => state.setQuery);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchCampus(query, campusPois), [query]);
  function choose(index: number) {
    const result = results[index];
    if (!result) return;
    onSelect(result.poi, result.room);
    setQuery(result.room?.label ?? result.poi.name);
    setFocused(false);
  }
  return <div className="search-wrap">
    <div className="search-shell">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input value={query} onChange={event => { setQuery(event.target.value); setActive(0); }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onKeyDown={event => {
          if (event.key === 'Escape') { setFocused(false); event.currentTarget.blur(); }
          if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(index + 1, results.length - 1)); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(index - 1, 0)); }
          if (event.key === 'Enter') { event.preventDefault(); choose(active); event.currentTarget.blur(); }
        }}
        placeholder={t("Gebäude, Raum oder Ort suchen")} aria-label={t("Gebäude, Raum oder Ort suchen")}
        role="combobox" aria-autocomplete="list" aria-expanded={focused} aria-controls={focused ? 'campus-search-results' : undefined}
        aria-activedescendant={focused && results[active] ? `campus-result-${active}` : undefined} autoComplete="off" />
      {query && <button type="button" className="icon-button compact" onClick={() => setQuery('')} aria-label={t("Suche löschen")}>×</button>}
    </div>
    {focused && <div id="campus-search-results" className="search-results" role="listbox" aria-label={t("Suchergebnisse")}>
      {results.length ? results.map(({ poi, room }, index) => <button type="button" key={poi.id}
        id={`campus-result-${index}`} role="option" aria-selected={index === active}
        className="search-result" onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>
        <span><strong>{room ? `${room.label} → ${poi.name}` : poi.name}</strong>
          <small>{room ? t('{floor}. Etage · Raum {room} · Zum Gebäude', { floor: room.floor, room: room.room }) : poi.buildingNumber ? t('Gebäude C {number}', { number: poi.buildingNumber }) : t("Campus-Ort")}</small></span>
        <span aria-hidden="true">›</span>
      </button>) : <div className="search-empty">{t("Kein erfasster Ort gefunden. Raumangaben z. B. C 7.209; Toiletten und Drucker sind noch nicht erfasst.")}</div>}
    </div>}
  </div>;
}
