const fs = require('fs');

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const replacements = [
  ['Know before<br />you <span>go.</span>', "{t('Know before')}<br />{t('you')} <span>{t('go.')}</span>"],
  ['Campus Compass verbindet Auslastung, Zeitreihen und Prognosen zu einer klaren Entscheidung: Wann ist ein guter Zeitpunkt für die Mensa?', "{t('Campus Compass verbindet Auslastung, Zeitreihen und Prognosen zu einer klaren Entscheidung: Wann ist ein guter Zeitpunkt für die Mensa?')}"]
];

for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
}

fs.writeFileSync('src/pages/HomePage.tsx', content);
