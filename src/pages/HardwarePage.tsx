import { useTranslation } from '../i18n/context';
import { PageHeader } from '../components/ui/PageHeader';
import { Github, Mail, Server, Cpu, Database } from 'lucide-react';

export default function HardwarePage() {
  const { t } = useTranslation();
  return <div className="content page-stack">
    <PageHeader 
      eyebrow={t("Hardware & Sensoren")} 
      title={t("Unser modulares Sensorsystem.")} 
      description={t("Die Hardware hinter Campus Compass. Offen, modular und datenschutzfreundlich.")} 
    />
    
    <section className="editorial-split">
      <div>
        <span className="eyebrow">{t("Funktionsweise")}</span>
        <h2>{t("Vom Sensor")}<br />{t("in die Cloud.")}</h2>
      </div>
      <div>
        <p className="large-copy">
          {t("Campus Compass nutzt das Open-Source-Projekt Paxcounter, um die Auslastung von Räumen datenschutzkonform zu messen. Es werden keine persönlichen Daten gespeichert, sondern lediglich WLAN- und Bluetooth-Signale aggregiert gezählt.")}
        </p>
        <p>
          {t("Ein ESP32-Microcontroller agiert als Sensor und zählt die Geräte in der Umgebung. Ein Raspberry Pi dient als Host, aggregiert die Messwerte über ein Zeitfenster (z.B. 3 Minuten) und übermittelt die Durchschnittswerte sicher an unsere Supabase-Datenbank.")}
        </p>
      </div>
    </section>

    <section>
      <span className="eyebrow">{t("Systemarchitektur")}</span>
      <div className="hardware-diagram" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem', alignItems: 'center', justifyContent: 'space-between', padding: '2rem', background: 'var(--surface-color, #f4f4f5)', borderRadius: '12px' }}>
        <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
          <Cpu size={48} style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h3>1. Sensor (ESP32)</h3>
          <p>{t("Erfasst WLAN & BLE Signale anonym.")}</p>
        </div>
        <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>→</div>
        <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
          <Server size={48} style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h3>2. Host (Raspberry Pi)</h3>
          <p>{t("Sammelt Daten via Serial, aggregiert und sendet sie.")}</p>
        </div>
        <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>→</div>
        <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
          <Database size={48} style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h3>3. Cloud (Supabase)</h3>
          <p>{t("Speichert die Auslastungswerte für Forecast & Live-Ansicht.")}</p>
        </div>
      </div>
    </section>

    <section className="editorial-split" style={{ marginTop: '4rem' }}>
      <div>
        <span className="eyebrow">{t("Open Source")}</span>
        <h2>{t("Universell einsetzbar.")}</h2>
      </div>
      <div>
        <p className="large-copy">
          {t("Unsere Firmware und Host-Software stehen auf GitHub zur Verfügung. Du kannst sie herunterladen, anpassen und für deine eigenen Projekte verwenden.")}
        </p>
        <a href="https://github.com/rafyscode/Campus-Compass" target="_blank" rel="noopener noreferrer" className="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--text-color, #111)', color: 'var(--bg-color, #fff)', borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, marginTop: '1rem' }}>
          <Github size={20} />
          {t("Quellcode auf GitHub ansehen")}
        </a>
      </div>
    </section>

    <section className="editorial-split" style={{ marginTop: '4rem' }}>
      <div>
        <span className="eyebrow">{t("Mitmachen")}</span>
        <h2>{t("Neuen Standort")}<br />{t("einrichten.")}</h2>
      </div>
      <div>
        <p className="large-copy">
          {t("Möchtest du Campus Compass in deinem Gebäude einsetzen? Wir helfen dir gerne bei der Einrichtung der Datenbank und stellen dir die nötigen API-Keys zur Verfügung.")}
        </p>
        <p>
          {t("Lade einfach den Quellcode herunter, flashe den ESP32 und kontaktiere uns, um deinen Sensor im System zu registrieren.")}
        </p>
        <a href="mailto:info@campus-compass.org?subject=Neuer%20Sensor-Standort" className="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: '1px solid var(--text-color, #111)', borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, marginTop: '1rem' }}>
          <Mail size={20} />
          {t("Kontaktiere uns")}
        </a>
      </div>
    </section>
  </div>;
}
