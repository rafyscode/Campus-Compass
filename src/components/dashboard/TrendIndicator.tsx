import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { TrendDirection } from '../../types/domain';

export function TrendIndicator({ direction, value }: { direction: TrendDirection; value?: number }) {
  const Icon = direction === 'rising' ? ArrowUpRight : direction === 'falling' ? ArrowDownRight : ArrowRight;
  const label = direction === 'rising' ? 'steigend' : direction === 'falling' ? 'fallend' : 'stabil';
  return <span className={`trend ${direction === 'rising' ? 'tone-danger' : direction === 'falling' ? 'tone-success' : 'tone-neutral'}`}><Icon aria-hidden="true" />{value == null ? label : `${Math.abs(value).toFixed(1)} % ${label}`}</span>;
}
