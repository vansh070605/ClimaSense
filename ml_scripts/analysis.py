import pandas as pd
import numpy as np
from scipy.stats import zscore

# ---------------- LOAD & PREP DATA ---------------- #

df = pd.read_csv("Indian_Climate_Dataset_2024_2025.csv")

# Convert Date column
df["Date"] = pd.to_datetime(df["Date"])

# Sort by City and Date
df = df.sort_values(by=["City", "Date"])

print("Dataset loaded successfully")
print(df.shape)
print(df.head())

# ---------------- CLIMATE STRESS FLAGS ---------------- #

# Heat Stress Day
df["Heat_Stress_Day"] = (
    (df["Temperature_Avg (°C)"] > 35) &
    (df["Humidity (%)"] > 60)
)

# Pollution Stress Day
df["Pollution_Stress_Day"] = df["AQI"] >= 201

# Rainfall Extreme Day (city-wise 95th percentile)
df["Rainfall_Extreme_Day"] = False

for city in df["City"].unique():
    city_mask = df["City"] == city
    threshold = df.loc[city_mask, "Rainfall (mm)"].quantile(0.95)
    df.loc[city_mask, "Rainfall_Extreme_Day"] = (
        df.loc[city_mask, "Rainfall (mm)"] > threshold
    )

# ---------------- CLIMATE ANOMALY DETECTION ---------------- #

df["Temp_Anomaly"] = False
df["AQI_Anomaly"] = False
df["Rainfall_Anomaly"] = False

for city in df["City"].unique():
    city_mask = df["City"] == city

    df.loc[city_mask, "Temp_Anomaly"] = (
        np.abs(zscore(df.loc[city_mask, "Temperature_Avg (°C)"])) > 2
    )

    df.loc[city_mask, "AQI_Anomaly"] = (
        np.abs(zscore(df.loc[city_mask, "AQI"])) > 2
    )

    df.loc[city_mask, "Rainfall_Anomaly"] = (
        np.abs(zscore(df.loc[city_mask, "Rainfall (mm)"])) > 2
    )

# ---------------- SANITY CHECKS ---------------- #

print("\n--- Stress Day Counts Per City ---\n")
print(
    df.groupby("City")[[
        "Heat_Stress_Day",
        "Pollution_Stress_Day",
        "Rainfall_Extreme_Day"
    ]].sum()
)

print("\n--- Anomaly Counts Per City ---\n")
print(
    df.groupby("City")[[
        "Temp_Anomaly",
        "AQI_Anomaly",
        "Rainfall_Anomaly"
    ]].sum()
)

print("\nSample rows with anomalies:\n")
print(
    df[
        (df["Temp_Anomaly"]) |
        (df["AQI_Anomaly"]) |
        (df["Rainfall_Anomaly"])
    ][["City", "Date", "Temperature_Avg (°C)", "AQI", "Rainfall (mm)"]].head()
)

# ---------------- CLIMATE STRESS SCORE (FINAL & CORRECT) ---------------- #

stress_summary = []

for city in df["City"].unique():
    city_df = df[df["City"] == city]
    total_days = len(city_df)

    heat_pct = (city_df["Heat_Stress_Day"].sum() / total_days) * 100
    pollution_pct = (city_df["Pollution_Stress_Day"].sum() / total_days) * 100
    rain_pct = (city_df["Rainfall_Extreme_Day"].sum() / total_days) * 100

    raw_score = (
        0.4 * heat_pct +
        0.4 * pollution_pct +
        0.2 * rain_pct
    )

    stress_summary.append({
        "City": city,
        "Heat_Stress_%": heat_pct,
        "Pollution_Stress_%": pollution_pct,
        "Rainfall_Extreme_%": rain_pct,
        "Raw_Stress_Score": raw_score
    })

stress_df = pd.DataFrame(stress_summary)

# Normalize to 0–100
stress_df["Climate_Stress_Score"] = (
    stress_df["Raw_Stress_Score"] / stress_df["Raw_Stress_Score"].max()
) * 100

# ---------------- QUANTILE-BASED RISK LEVELS (FIXED) ---------------- #

# Use strict ranking instead of close quantiles
stress_df = stress_df.sort_values("Climate_Stress_Score", ascending=False).reset_index(drop=True)

n = len(stress_df)

def risk_label_by_rank(idx):
    if idx < n * 0.33:
        return "High"
    elif idx < n * 0.66:
        return "Moderate"
    else:
        return "Low"

stress_df["Risk_Level"] = stress_df.index.map(risk_label_by_rank)

stress_df = stress_df.round(2)

print("\n--- FINAL CLIMATE STRESS SCORE (RANK + QUANTILE BASED) ---\n")
print(stress_df)
