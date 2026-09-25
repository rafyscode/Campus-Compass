import json

with open("src/i18n/messages.json", "r", encoding="utf-8") as f:
    messages = json.load(f)

new_keys = {
    "vor {count} Sek.": {
        "en": "{count} sec ago",
        "es": "hace {count} seg.",
        "fr": "il y a {count} s"
    },
    "vor {count} Min.": {
        "en": "{count} min ago",
        "es": "hace {count} min.",
        "fr": "il y a {count} min"
    },
    "vor {count} Std.": {
        "en": "{count} hr ago",
        "es": "hace {count} h.",
        "fr": "il y a {count} h"
    },
    "Offline": {
        "en": "Offline",
        "es": "Sin conexión",
        "fr": "Hors ligne"
    },
    "Aktualisiert": {
        "en": "Updated",
        "es": "Actualizado",
        "fr": "Mis à jour"
    }
}

for k, v in new_keys.items():
    if k not in messages:
        messages[k] = v

with open("src/i18n/messages.json", "w", encoding="utf-8") as f:
    json.dump(messages, f, indent=2, ensure_ascii=False)

print("Updated messages.json")
