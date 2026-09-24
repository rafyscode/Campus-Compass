import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export default function NotFoundPage() {
  return <div className="content"><Card className="error-state"><div><div className="eyebrow">404</div><h3>Diese Route gibt es nicht.</h3><p>Der Campus ist groß, aber diese Seite gehört nicht dazu.</p><Link className="button button-primary" to="/"><ArrowLeft size={14} /> Zur Übersicht</Link></div></Card></div>;
}
