import os
import re
import json

messages_path = "src/i18n/messages.json"
with open(messages_path, 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Regex to match t("...") or t('...')
pattern = re.compile(r't\(\s*["\'](.*?)["\']\s*\)')

missing_keys = set()
files_checked = 0

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            files_checked += 1
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                matches = pattern.findall(content)
                for match in matches:
                    if match not in messages:
                        missing_keys.add(match)

print(f"Checked {files_checked} files.")
print("Missing keys:")
for key in sorted(missing_keys):
    print(key)

with open('missing_keys.json', 'w', encoding='utf-8') as f:
    json.dump(list(missing_keys), f, ensure_ascii=False, indent=2)
