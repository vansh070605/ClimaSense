import json

with open('ml_scripts/Climate.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        print(f"--- Cell {i} ---\n" + "".join(cell['source']) + "\n")
