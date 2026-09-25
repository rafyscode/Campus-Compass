import json

with open("src/i18n/messages.json", "r", encoding="utf-8") as f:
    messages = json.load(f)

new_keys = {
    "Campus Compass nutzt spezielle Sensor-Software, um die Auslastung von Räumen datenschutzkonform zu messen. Es werden keine persönlichen Daten gespeichert, sondern lediglich WLAN- und Bluetooth-Signale aggregiert gezählt.": {
        "en": "Campus Compass uses special sensor software to measure room occupancy in a privacy-compliant way. No personal data is stored; only WiFi and Bluetooth signals are counted in aggregate.",
        "es": "Campus Compass utiliza software de sensores especial para medir la ocupación de las habitaciones de forma respetuosa con la privacidad. No se almacenan datos personales, solo se cuentan de forma agregada las señales de WiFi y Bluetooth.",
        "fr": "Campus Compass utilise un logiciel de capteur spécial pour mesurer l'occupation des salles dans le respect de la vie privée. Aucune donnée personnelle n'est stockée, seuls les signaux WiFi et Bluetooth sont comptés sous forme agrégée."
    },
    "Die Hardware hinter Campus Compass. Offen, modular und datenschutzfreundlich.": {
        "en": "The hardware behind Campus Compass. Open, modular, and privacy-friendly.",
        "es": "El hardware detrás de Campus Compass. Abierto, modular y respetuoso con la privacidad.",
        "fr": "Le matériel derrière Campus Compass. Ouvert, modulaire et respectueux de la vie privée."
    },
    "Ein ESP32-Microcontroller agiert als Sensor und zählt die Geräte in der Umgebung. Ein Raspberry Pi dient als Host, aggregiert die Messwerte über ein Zeitfenster (z.B. 3 Minuten) und übermittelt die Durchschnittswerte sicher an unsere Supabase-Datenbank.": {
        "en": "An ESP32 microcontroller acts as a sensor and counts devices in the vicinity. A Raspberry Pi serves as the host, aggregates the measurements over a time window (e.g. 3 minutes), and securely transmits the average values to our Supabase database.",
        "es": "Un microcontrolador ESP32 actúa como sensor y cuenta los dispositivos cercanos. Una Raspberry Pi sirve de host, agrega las mediciones durante un intervalo de tiempo (p. ej. 3 minutos) y transmite de forma segura los valores promedio a nuestra base de datos de Supabase.",
        "fr": "Un microcontrôleur ESP32 agit comme capteur et compte les appareils à proximité. Un Raspberry Pi sert d'hôte, agrège les mesures sur une fenêtre temporelle (par ex. 3 minutes) et transmet les valeurs moyennes en toute sécurité à notre base de données Supabase."
    },
    "Erfasst WLAN & BLE Signale anonym.": {
        "en": "Records WiFi & BLE signals anonymously.",
        "es": "Registra señales WiFi y BLE de forma anónima.",
        "fr": "Enregistre anonymement les signaux WiFi et BLE."
    },
    "Funktionsweise": {
        "en": "How it works",
        "es": "Cómo funciona",
        "fr": "Fonctionnement"
    },
    "Hardware & Sensoren": {
        "en": "Hardware & Sensors",
        "es": "Hardware y Sensores",
        "fr": "Matériel et Capteurs"
    },
    "Kontaktiere uns": {
        "en": "Contact us",
        "es": "Contáctanos",
        "fr": "Contactez-nous"
    },
    "Lade einfach den Quellcode herunter, flashe den ESP32 und kontaktiere uns, um deinen Sensor im System zu registrieren.": {
        "en": "Simply download the source code, flash the ESP32, and contact us to register your sensor in the system.",
        "es": "Simplemente descarga el código fuente, flashea el ESP32 y contáctanos para registrar tu sensor en el sistema.",
        "fr": "Téléchargez simplement le code source, flashez l'ESP32 et contactez-nous pour enregistrer votre capteur dans le système."
    },
    "Mitmachen": {
        "en": "Join in",
        "es": "Participar",
        "fr": "Participer"
    },
    "Möchtest du Campus Compass in deinem Gebäude einsetzen? Wir helfen dir gerne bei der Einrichtung der Datenbank und stellen dir die nötigen API-Keys zur Verfügung.": {
        "en": "Would you like to use Campus Compass in your building? We will gladly help you set up the database and provide the necessary API keys.",
        "es": "¿Te gustaría utilizar Campus Compass en tu edificio? Estaremos encantados de ayudarte a configurar la base de datos y proporcionarte las claves API necesarias.",
        "fr": "Souhaitez-vous utiliser Campus Compass dans votre bâtiment ? Nous serons ravis de vous aider à configurer la base de données et de vous fournir les clés API nécessaires."
    },
    "Neuen Standort": {
        "en": "New location",
        "es": "Nueva ubicación",
        "fr": "Nouvel emplacement"
    },
    "einrichten.": {
        "en": "set up.",
        "es": "configurar.",
        "fr": "configurer."
    },
    "Open Source": {
        "en": "Open Source",
        "es": "Código Abierto",
        "fr": "Open Source"
    },
    "Quellcode auf GitHub ansehen": {
        "en": "View source code on GitHub",
        "es": "Ver código fuente en GitHub",
        "fr": "Voir le code source sur GitHub"
    },
    "Sammelt Daten via Serial, aggregiert und sendet sie.": {
        "en": "Collects data via serial, aggregates and sends it.",
        "es": "Recopila datos a través del puerto serie, los agrega y los envía.",
        "fr": "Collecte les données via le port série, les agrège et les envoie."
    },
    "Speichert die Auslastungswerte für Forecast & Live-Ansicht.": {
        "en": "Stores occupancy values for forecast & live view.",
        "es": "Almacena valores de ocupación para previsión y vista en vivo.",
        "fr": "Stocke les valeurs d'occupation pour les prévisions et la vue en direct."
    },
    "Systemarchitektur": {
        "en": "System Architecture",
        "es": "Arquitectura del Sistema",
        "fr": "Architecture du Système"
    },
    "Universell einsetzbar.": {
        "en": "Universally applicable.",
        "es": "De aplicación universal.",
        "fr": "Application universelle."
    },
    "Unser modulares Sensorsystem.": {
        "en": "Our modular sensor system.",
        "es": "Nuestro sistema de sensores modular.",
        "fr": "Notre système de capteurs modulaire."
    },
    "Unsere Firmware und Host-Software stehen auf GitHub zur Verfügung. Du kannst sie herunterladen, anpassen und für deine eigenen Projekte verwenden.": {
        "en": "Our firmware and host software are available on GitHub. You can download, adapt, and use them for your own projects.",
        "es": "Nuestro firmware y software de host están disponibles en GitHub. Puedes descargarlos, adaptarlos y utilizarlos en tus propios proyectos.",
        "fr": "Notre micrologiciel et notre logiciel hôte sont disponibles sur GitHub. Vous pouvez les télécharger, les adapter et les utiliser pour vos propres projets."
    },
    "in die Cloud.": {
        "en": "to the cloud.",
        "es": "a la nube.",
        "fr": "vers le cloud."
    }
}

for k, v in new_keys.items():
    if k not in messages:
        messages[k] = v

with open("src/i18n/messages.json", "w", encoding="utf-8") as f:
    json.dump(messages, f, indent=2, ensure_ascii=False)

print("Updated HardwarePage translations.")
