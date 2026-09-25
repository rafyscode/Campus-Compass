import json

with open("src/i18n/messages.json", "r", encoding="utf-8") as f:
    messages = json.load(f)

new_keys = {
    "beste Zeit in den nächsten 2 Stunden": {
        "en": "best time in the next 2 hours",
        "es": "mejor momento en las próximas 2 horas",
        "fr": "meilleur moment dans les 2 prochaines heures"
    }
}

for k, v in new_keys.items():
    if k not in messages:
        messages[k] = v

with open("src/i18n/messages.json", "w", encoding="utf-8") as f:
    json.dump(messages, f, indent=2, ensure_ascii=False)

