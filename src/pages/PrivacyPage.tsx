import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';

export default function PrivacyPage() {
  return (
    <div className="content page-stack">
      <PageHeader eyebrow="Datenschutz" title="So wenig personenbezogene Daten wie möglich." description="Arbeitsstand für das studentische Projekt. Dieser Text ist keine Rechtsberatung und keine Behauptung einer DSGVO-Prüfung." />
      <Card className="card-pad copy-prose">
        <div className="callout"><strong>Wichtig:</strong> Vor einem öffentlichen produktiven Betrieb muss diese Seite anhand der tatsächlich eingesetzten Sensorik, Hosting-/Backend-Dienste, Verantwortlichkeiten und Rechtsgrundlagen final geprüft und ergänzt werden.</div>
        <h2>Geplantes Messprinzip</h2>
        <p>Campus Compass ist so konzipiert, dass Auslastung über aggregierte beziehungsweise anonymisierte Zählwerte verarbeitet wird. Es werden keine Personen identifiziert oder verfolgt.</p>
        <ul><li>Keine Gesichtserkennung.</li><li>Keine Identifikation einzelner Personen.</li><li>Keine Speicherung personenbezogener Bewegungsprofile.</li><li>Keine Service-Role-Credentials im Browser.</li></ul>
        <h2>Technische Daten</h2><p>Im späteren Live-Betrieb können für Systembetrieb und Sicherheit technische Metadaten wie Zeitstempel, Sensorstatus, Latenz und Fehlercodes verarbeitet werden. Welche Logdaten tatsächlich gespeichert werden, muss vor Phase 2 dokumentiert werden.</p>
        <h2>Externe Dienste</h2><p>Firebase Hosting ist für die Auslieferung der Web-App vorgesehen. Supabase ist für Phase 2 als Datenplattform vorbereitet. Konkrete Datenschutzinformationen, Speicherorte und Auftragsverarbeitungsbeziehungen sind vor Live-Betrieb zu vervollständigen.</p>
        <h2>Externe Kartendaten</h2><p>Die Campuskarte und ihre Vorschau laden Grundkarte, Gebäude, Schriften und Kartensymbole von OpenFreeMap. Beim Umschalten auf Luftbild werden zusätzlich Bildkacheln vom LGLN in Niedersachsen geladen. Dabei stellt der Browser direkte Verbindungen zu diesen Diensten her und übermittelt die technisch erforderlichen Verbindungsdaten, darunter die IP-Adresse. Die Suche nach Campusgebäuden wird lokal anhand der mitgelieferten Ortsliste ausgeführt.</p>
        <h2>Kontakt / Verantwortliche Stelle</h2><p><strong>PLATZHALTER:</strong> Projektverantwortliche Person beziehungsweise verantwortliche Stelle noch eintragen. Keine Personendaten wurden erfunden.</p>
      </Card>
    </div>
  );
}
