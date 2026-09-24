import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';

export default function ImprintPage() {
  return (
    <div className="content page-stack">
      <PageHeader eyebrow="Impressum" title="Projektangaben." description="Platzhalter für die rechtlich erforderlichen Angaben des tatsächlichen Betreibers." />
      <Card className="card-pad copy-prose">
        <div className="callout"><strong>PLATZHALTER:</strong> Vor öffentlicher Veröffentlichung mit rechtlich korrekten Betreiberangaben ersetzen.</div>
        <h2>Angaben gemäß geltendem Recht</h2><p>[Name / Projektverantwortliche Person]<br />[Anschrift]<br />[E-Mail-Adresse]<br />[weitere erforderliche Angaben]</p>
        <h2>Projektstatus</h2><p>Campus Compass ist ein studentisches Projekt an der Leuphana Universität Lüneburg. Diese Anwendung ist nicht automatisch ein offiziell freigegebener Dienst der Leuphana Universität Lüneburg.</p>
        <h2>Haftung / Inhalte</h2><p>[Rechtlich geprüften Text einsetzen.] Die bereitgestellten Auslastungs- und Prognosewerte dienen Informationszwecken und bieten keine Gewähr auf absolute Genauigkeit.</p>
      </Card>
    </div>
  );
}
