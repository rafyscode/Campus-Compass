import { useTranslation } from '../../i18n/context';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Compass, Menu, Moon, Sun, X } from 'lucide-react';
import { Footer } from './Footer';
import { LanguageSelect } from '../../i18n/LanguageSelect';

const NAV = [{ to: '/', label: 'Overview' }, { to: '/campus', label: 'Campus' }, { to: '/live', label: 'Live' }, { to: '/forecast', label: 'Forecast' }, { to: '/hardware', label: 'Hardware' }, { to: '/about', label: 'Über das Projekt' }];
function ThemeToggle() {
  const { t } = useTranslation();
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('cc-theme') === 'dark'; } catch { return false; } });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('cc-theme', dark ? 'dark' : 'light'); } catch { /* Storage is optional. */ }
  }, [dark]);
  return <button className="icon-button" type="button" onClick={() => setDark(value => !value)} aria-label={dark ? t("Helles Design aktivieren") : t("Dunkles Design aktivieren")}>{dark ? <Sun /> : <Moon />}</button>;
}
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [menuForPath, setMenuForPath] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const open = menuForPath === pathname;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  useEffect(() => {
    const label = NAV.find(item => item.to === pathname)?.label ?? ({ '/imprint': 'Impressum', '/privacy': 'Datenschutz', '/status': 'Systemstatus' }[pathname] ?? 'Seite nicht gefunden');
    document.title = pathname === '/' ? 'Campus Compass | Smart Campus · Leuphana' : t(label) + ' | Campus Compass';
  }, [pathname, t]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">{t("Zum Inhalt")}</a>
    <header className="site-header">
      <Link to="/" className="site-brand" aria-label={t("Campus Compass Startseite")}><Compass aria-hidden="true" /><span>Campus Compass<small>Leuphana · Lüneburg</small></span></Link>
      <nav className="desktop-navigation" aria-label={t("Hauptnavigation")}>{NAV.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'}>{t(item.label)}</NavLink>)}</nav>
      <div className="header-actions"><div className="desktop-language"><LanguageSelect /></div><ThemeToggle /><button type="button" className="icon-button menu-button" aria-label={open ? t("Menü schließen") : t("Menü öffnen")} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setMenuForPath(open ? null : pathname)}>{open ? <X /> : <Menu />}</button></div>
      {open && <nav id="mobile-menu" className="mobile-menu" aria-label={t("Mobile Navigation")} onKeyDown={event => { if (event.key === 'Escape') { setMenuForPath(null); document.querySelector<HTMLButtonElement>('.menu-button')?.focus(); } }}>{NAV.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMenuForPath(null)}>{t(item.label)}</NavLink>)}<div className="mobile-language"><LanguageSelect /></div></nav>}
    </header>
    {!online && <div className="network-note" role="status">{t("Offline · Bereits geladene Inhalte bleiben sichtbar. Karten und neue Datenabrufe benötigen eine Verbindung.")}</div>}
    <main id="main-content" tabIndex={-1}>{children}</main>
    <Footer />
  </div>;
}

