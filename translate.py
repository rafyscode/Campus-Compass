import re
import os
import json

files_to_check = [
    "src/pages/HomePage.tsx",
    "src/pages/CampusPage.tsx",
    "src/pages/ForecastPage.tsx",
    "src/pages/LivePage.tsx",
    "src/pages/AboutPage.tsx",
    "src/components/dashboard/BestTimeCard.tsx",
    "src/components/dashboard/MetricCard.tsx",
    "src/components/ui/SectionHeading.tsx"
]

messages_path = "src/i18n/messages.json"
with open(messages_path, 'r', encoding='utf-8') as f:
    messages = json.load(f)

def add_translation(key, en="", es="", fr=""):
    if key not in messages:
        messages[key] = {}
    if en and "en" not in messages[key]: messages[key]["en"] = en
    if es and "es" not in messages[key]: messages[key]["es"] = es
    if fr and "fr" not in messages[key]: messages[key]["fr"] = fr

# For now, let's just make sure all german strings are wrapped in t('') and we'll auto-translate using a simple prompt or just leave the json to be updated later.
print("Script ready")
