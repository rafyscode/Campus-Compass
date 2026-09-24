import { Badge } from '../ui/Badge';
import type { DataMode } from '../../types/domain';

export function DataSourceBadge({ mode }: { mode: DataMode }) {
  return mode === 'live'
    ? <Badge tone="live" dot>LIVE DATA</Badge>
    : <Badge tone="demo" dot>DEMO DATA</Badge>;
}
