import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

export function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <Card className="metric-card">
      <div className="metric-top"><span className="card-title">{label}</span><span className="metric-icon"><Icon aria-hidden="true" /></span></div>
      <div><div className="metric-value">{value}</div><div className="metric-detail">{detail}</div></div>
    </Card>
  );
}
