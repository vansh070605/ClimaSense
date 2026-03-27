import json
import sys

with open('ml_scripts/Climate.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Set stdout to utf-8 if on Windows and it's not already
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        print(f"--- Cell {i} ---")
        print("".join(cell['source']))
        print("\n")
