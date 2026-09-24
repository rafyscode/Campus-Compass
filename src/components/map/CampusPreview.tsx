import { lazy, Suspense } from 'react';
import { ArrowUpRight, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OccupancySnapshot } from '../../types/domain';
import { DataSourceBadge } from '../dashboard/DataSourceBadge';

const CampusMap = lazy(() => import('../../digital-twin/components/CampusMap').then((module) => ({ default: module.CampusMap })));

export function CampusPreview({ current }: { current: OccupancySnapshot }) {
  return <section className="card campus-preview">
    <div className="campus-preview-head">
      <div><span className="eyebrow"><Map size={12} /> Campus Digital Twin</span><h2>Zentraler Campus</h2><p>Georeferenzierte 3D-Karte · Mensa-Auslastung auf einen Blick.</p></div>
      <div className="campus-preview-actions"><DataSourceBadge mode={current.source} /><Link className="button button-ghost" to="/campus">3D öffnen <ArrowUpRight size={14} /></Link></div>
    </div>
    <Suspense fallback={<div style={{ minHeight: 340, display: 'grid', placeItems: 'center' }} role="status">Campusvorschau wird geladen …</div>}><CampusMap current={current} compact /></Suspense>
  </section>;
}
