import json
import re
import os

with open("src/i18n/messages.json", "r", encoding="utf-8") as f:
    messages = json.load(f)

pattern = re.compile(r'\bt\(\s*["\'](.*?)["\']\s*\)')
missing = set()

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                matches = pattern.findall(content)
                for match in matches:
                    if match not in messages:
                        missing.add(match)

for m in sorted(missing):
    print(m)
