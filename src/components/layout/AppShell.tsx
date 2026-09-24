import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  Boxes,
  CircleGauge,
  Compass,
  Home,
  Info,
  Map,
  Moon,
  Radio,
  ShieldCheck,
  Sun,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import { ROUTE_PATHS } from '../../app/routes';
import { useCampusData } from '../../hooks/useCampusData';
import { DataSourceBadge } from '../dashboard/DataSourceBadge';

const NAV: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: ROUTE_PATHS.home, label: 'Overview', icon: Home, end: true },
  { to: ROUTE_PATHS.live, label: 'Live Auslastung', icon: Radio },
  { to: ROUTE_PATHS.forecast, label: 'Prognose', icon: CircleGauge },
  { to: ROUTE_PATHS.campus, label: 'Campus', icon: Map },
  { to: ROUTE_PATHS.status, label: 'System Status', icon: Activity },
  { to: ROUTE_PATHS.about, label: 'Über das Projekt', icon: Info },
];

const MOBILE_NAV = NAV.slice(0, 5);

function Brand() {
  return (
    <Link to={ROUTE_PATHS.home} className="brand-lockup" aria-label="Campus Compass Startseite">
      <span className="brand-mark"><Compass size={19} aria-hidden="true" /></span>
      <span className="brand-copy"><strong>CAMPUS COMPASS</strong><span>Leuphana Universität Lüneburg</span></span>
    </Link>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('cc-theme') === 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('cc-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return <button className="icon-button" type="button" onClick={() => setDark((value) => !value)} aria-label={dark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}>{dark ? <Sun /> : <Moon />}</button>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data, online } = useCampusData();
  const currentLabel = NAV.find((item) => item.to === location.pathname)?.label ?? 'Campus Compass';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="nav-group" aria-label="Hauptnavigation">
          <div className="nav-label">Navigation</div>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} key={to} to={to} end={end}><Icon />{label}</NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mode-card">
            <div className="mode-card-title"><Boxes size={14} /><span>Architektur</span></div>
            <div style={{ marginTop: 9 }}>{data && <DataSourceBadge mode={data.mode} />}</div>
            <p>Echtzeit-Digital-Twin für smarte Campus-Logistik.</p>
          </div>
          <div className="mode-card">
            <div className="mode-card-title"><ShieldCheck size={14} /><span>Privacy by design</span></div>
            <p>Aggregierte Zählwerte statt Gesichtserkennung oder Bewegungsprofilen.</p>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left"><span className="breadcrumb">Campus Compass / {currentLabel}</span></div>
          <div className="topbar-right">{data && <DataSourceBadge mode={data.mode} />}<ThemeToggle /></div>
        </header>
        <header className="mobile-header"><Brand /><div className="topbar-right">{data && <DataSourceBadge mode={data.mode} />}<ThemeToggle /></div></header>
        {!online && <div className="offline-banner" role="status"><WifiOff />Offline · letzte Live-Daten werden nicht als aktuell behandelt</div>}
        <main>{children}</main>
        <footer className="footer">
          <span>Studentisches Projekt an der Leuphana Universität Lüneburg. Kein offiziell freigegebener Leuphana-Dienst.</span>
          <span className="footer-links"><Link to={ROUTE_PATHS.privacy}>Datenschutz</Link><Link to={ROUTE_PATHS.imprint}>Impressum</Link></span>
        </footer>
        <nav className="mobile-nav" aria-label="Mobile Navigation">
          {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}><Icon />{label}</NavLink>)}
        </nav>
      </div>
    </div>
  );
}

