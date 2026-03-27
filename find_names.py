import json

with open('ml_scripts/Climate.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        src = "".join(cell['source'])
        if 'xgb_clf' in src or 'joblib' in src:
            print(f"--- Cell {i} ---")
            print(src)
            print("-" * 20)
