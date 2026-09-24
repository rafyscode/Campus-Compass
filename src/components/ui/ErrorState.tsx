import { CircleAlert, RefreshCw } from 'lucide-react';
import { Card } from './Card';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="error-state" role="alert">
      <div>
        <CircleAlert aria-hidden="true" />
        <h3>Daten momentan nicht verfügbar</h3>
        <p>{message} Die Oberfläche bleibt verfügbar; Live-Werte werden nicht als aktuell ausgegeben.</p>
        {onRetry && <button className="button" type="button" onClick={onRetry}><RefreshCw size={14} /> Erneut versuchen</button>}
      </div>
    </Card>
  );
}
