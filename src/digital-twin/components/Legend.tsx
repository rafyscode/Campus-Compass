export function Legend() {
  return (
    <div className="legend" aria-label="Kartenlegende">
      <span><i className="swatch building-landmark" /> Landmarke</span>
      <span><i className="swatch building-library" /> Bibliothek</span>
      <span><i className="swatch building-food" /> Mensa</span>
      <span><i className="swatch building-generic" /> weitere Gebäude</span>
      <span><i className="line boundary" /> Campusgrenze</span>
    </div>
  )
}
