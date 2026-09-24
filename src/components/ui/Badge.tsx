import type { ReactNode } from 'react';

export function Badge({ children, tone = 'neutral', dot = false }: { children: ReactNode; tone?: 'demo' | 'live' | 'neutral' | 'warning' | 'danger'; dot?: boolean }) {
  return <span className={`badge badge-${tone}`}>{dot && <span className="badge-dot" aria-hidden="true" />}{children}</span>;
}
