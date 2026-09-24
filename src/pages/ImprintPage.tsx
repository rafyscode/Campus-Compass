import { LegalOriginalNote } from '../i18n/LegalOriginalNote';
import { PageHeader } from '../components/ui/PageHeader';
import { Link } from 'react-router-dom';
export default function ImprintPage() {
  return <div className="content page-stack"><LegalOriginalNote /><div lang="de" className="legal-original">
    <PageHeader eyebrow="Projektangaben" title="Impressum" description="Campus Compass · Studentisches Smart-Campus-Projekt" />
    <div className="legal-layout"><aside className="legal-aside">Campus Compass<Link to="/privacy">Datenschutz →</Link></aside><div className="legal-copy">
      <section><h2>Inhaltlich verantwortlich / Ansprechpartner</h2><address>Nick Bennet Kühl<br /><a href="mailto:Nick.B.Kuehl@stud.leuphana.de">Nick.B.Kuehl@stud.leuphana.de</a><br /><br />Rafael Bollmann Robles<br /><a href="mailto:rafael.robles@stud.leuphana.de">rafael.robles@stud.leuphana.de</a></address></section>
      <section><h2>Projektkontext / Campusanschrift</h2><address>Leuphana Universität Lüneburg<br />Universitätsallee 1<br />21335 Lüneburg<br />Deutschland</address><p>Die Campusanschrift beschreibt den Projektkontext. Sie ist keine bestätigte persönliche ladungsfähige Anschrift des Projektverantwortlichen.</p></section>
      <section><h2>Studentisches Projekt</h2><p>Campus Compass ist ein studentisches Projekt und kein offiziell freigegebener Dienst der Leuphana Universität Lüneburg.</p><p>Die Anwendung dient der Forschung und der Präsentation realer historischer Sensormessungen, eines Forecast-Systems und eines interaktiven Digital Twin.</p></section>
      <section><h2>Inhalte und externe Links</h2><p>Die Inhalte wurden mit Sorgfalt erstellt. Vollständigkeit und Aktualität können nicht gewährleistet werden. Historische Messungen und Modelloutputs beschreiben keine aktuelle Auslastung.</p><p>Die Inhalte verlinkter externer Seiten liegen außerhalb unseres Einflussbereichs. Gesetzliche Haftungspflichten bleiben unberührt.</p></section>
    </div></div>
  </div></div>;
}

