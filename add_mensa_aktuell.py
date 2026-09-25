import json

with open("src/i18n/messages.json", "r", encoding="utf-8") as f:
    messages = json.load(f)

new_keys = {
    "Mensa · aktuell": {
        "en": "Canteen · current",
        "es": "Comedor · actual",
        "fr": "Restaurant U · actuel"
    }
}

for k, v in new_keys.items():
    if k not in messages:
        messages[k] = v

with open("src/i18n/messages.json", "w", encoding="utf-8") as f:
    json.dump(messages, f, indent=2, ensure_ascii=False)

