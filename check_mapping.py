import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Reconstruct the LabelEncoder from the dataset to be sure
df = pd.read_csv("Indian_Climate_Dataset_2024_2025.csv")
le = LabelEncoder()
le.fit(df['AQI_Category'].dropna())

model = joblib.load("aqi_classifier.pkl")
print(f"Model classes: {model.classes_}")
print(f"LabelEncoder classes: {le.classes_}")

for i, label in enumerate(le.classes_):
    print(f"{i}: {label}")
