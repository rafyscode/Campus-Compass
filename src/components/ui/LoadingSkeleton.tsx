export function LoadingSkeleton() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Daten werden geladen">
      <div className="skeleton" style={{ height: 92 }} />
      <div className="loading-grid">
        {Array.from({ length: 4 }, (_, index) => <div className="skeleton" style={{ height: 124 }} key={index} />)}
      </div>
      <div className="skeleton" style={{ height: 370 }} />
    </div>
  );
}
