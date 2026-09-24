import { ArrowDown, BarChart3, BrainCircuit, Cpu, Database, EyeOff, Map, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';

const STEPS = [
  { icon: Cpu, title: 'Sensor', text: 'Erfasst aggregierte Auslastung statt Identitäten.' },
  { icon: Database, title: 'Data', text: 'Speichert zeitlich saubere Snapshots und Systemzustände.' },
  { icon: BrainCircuit, title: 'Intelligence', text: 'Lernt historische Muster und quantifiziert Unsicherheit.' },
  { icon: Sparkles, title: 'Forecast', text: 'Berechnet Echtzeit-Prognosen für die kommende Auslastung.' },
];

export default function AboutPage() {
  return (
    <div className="content page-stack">
      <PageHeader eyebrow="Über das Projekt" title="Ein Campus, der verständlicher wird." description="Campus Compass ist ein studentisches Smart-Campus-Projekt: aktuelle Auslastung sichtbar machen, Muster lernen und aus Daten bessere Zeitentscheidungen ableiten." />
      <div className="grid grid-2">
        <Card className="card-pad"><span className="eyebrow">Problem</span><h2 style={{ fontSize: 35, letterSpacing: '-.045em', margin: '14px 0 0' }}>Unsicherheit kostet Zeit.</h2><p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 13 }}>Wer zur Mensa geht, weiß heute oft erst vor Ort, ob es entspannt oder voll ist. Campus Compass macht die aktuelle Lage und die erwartete Entwicklung vorher sichtbar.</p></Card>
        <Card className="card-pad"><span className="eyebrow">Vision</span><h2 style={{ fontSize: 35, letterSpacing: '-.045em', margin: '14px 0 0' }}>Daten werden handlungsfähig.</h2><p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 13 }}>Nicht mehr Daten um ihrer selbst willen, sondern wenige verständliche Signale: Jetzt gehen, später gehen oder mit höherer Auslastung rechnen.</p></Card>
      </div>
      <Card className="card-pad">
        <div className="section-heading"><div><h2>How it works</h2><p>Vier Schichten, eine klare Echtzeit-Prognose.</p></div></div>
        <div className="pipeline" style={{ marginTop: 20 }}>{STEPS.map(({ icon: Icon, title, text }, index) => <div className="pipeline-step" key={title}><div className="pipeline-step-icon"><Icon /></div><h3>{title}</h3><p>{text}</p>{index < STEPS.length - 1 && <ArrowDown size={13} style={{ position: 'absolute', right: 12, bottom: 12, color: 'var(--text-tertiary)' }} />}</div>)}</div>
      </Card>
      <div className="grid grid-3">
        <Card className="card-pad"><Map size={20} style={{ color: 'var(--brand-primary)' }} /><h3>3D Campus</h3><p className="metric-detail">Offene Geodaten, eine Gebäudesuche und Luftbilder machen den Campus räumlich erkundbar. Die Mensa zeigt zusätzlich Auslastung und Prognosen.</p></Card>
        <Card className="card-pad"><BarChart3 size={20} style={{ color: 'var(--brand-primary)' }} /><h3>Data Science</h3><p className="metric-detail">Zeitreihen, Referenzprofile, Heatmaps und Modellmetriken bleiben nachvollziehbar statt dekorativ.</p></Card>
        <Card className="card-pad"><EyeOff size={20} style={{ color: 'var(--brand-primary)' }} /><h3>Privacy by design</h3><p className="metric-detail">Das Zielsystem arbeitet mit aggregierten Zählwerten und benötigt keine Gesichtserkennung.</p></Card>
      </div>
    </div>
  );
}

