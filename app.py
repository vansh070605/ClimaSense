import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


def risk_color(level):
    if level == "High":
        return "🔴 High Risk"
    elif level == "Moderate":
        return "🟡 Moderate Risk"
    else:
        return "🟢 Low Risk"

from scipy.stats import zscore

# ---------------- PAGE CONFIG ---------------- #
st.set_page_config(
    page_title="Climate Stress & Anomaly Intelligence",
    layout="wide"
)

st.title("🌍 Climate Stress & Anomaly Intelligence Dashboard")
st.write("Analyze long-term climate stress and extreme events across Indian cities.")

# ---------------- LOAD DATA ---------------- #
@st.cache_data
def load_data():
    df = pd.read_csv("Indian_Climate_Dataset_2024_2025.csv")
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(by=["City", "Date"])
    return df

df = load_data()

# ---------------- FEATURE ENGINEERING ---------------- #

# Climate Stress Flags
df["Heat_Stress_Day"] = (
    (df["Temperature_Avg (°C)"] > 35) &
    (df["Humidity (%)"] > 60)
)

df["Pollution_Stress_Day"] = df["AQI"] >= 201

df["Rainfall_Extreme_Day"] = False
for city in df["City"].unique():
    mask = df["City"] == city
    threshold = df.loc[mask, "Rainfall (mm)"].quantile(0.95)
    df.loc[mask, "Rainfall_Extreme_Day"] = (
        df.loc[mask, "Rainfall (mm)"] > threshold
    )

# ---------------- ANOMALY DETECTION ---------------- #

df["Temp_Anomaly"] = False
df["AQI_Anomaly"] = False
df["Rainfall_Anomaly"] = False

for city in df["City"].unique():
    mask = df["City"] == city

    df.loc[mask, "Temp_Anomaly"] = (
        np.abs(zscore(df.loc[mask, "Temperature_Avg (°C)"])) > 2
    )

    df.loc[mask, "AQI_Anomaly"] = (
        np.abs(zscore(df.loc[mask, "AQI"])) > 2
    )

    df.loc[mask, "Rainfall_Anomaly"] = (
        np.abs(zscore(df.loc[mask, "Rainfall (mm)"])) > 2
    )

# ---------------- CLIMATE STRESS SCORE ---------------- #

summary = []

for city in df["City"].unique():
    city_df = df[df["City"] == city]
    total_days = len(city_df)

    heat_pct = (city_df["Heat_Stress_Day"].sum() / total_days) * 100
    pollution_pct = (city_df["Pollution_Stress_Day"].sum() / total_days) * 100
    rain_pct = (city_df["Rainfall_Extreme_Day"].sum() / total_days) * 100

    raw_score = 0.4*heat_pct + 0.4*pollution_pct + 0.2*rain_pct

    summary.append({
        "City": city,
        "Heat_Stress_%": heat_pct,
        "Pollution_Stress_%": pollution_pct,
        "Rainfall_Extreme_%": rain_pct,
        "Raw_Score": raw_score
    })

stress_df = pd.DataFrame(summary)

stress_df["Climate_Stress_Score"] = (
    stress_df["Raw_Score"] / stress_df["Raw_Score"].max()
) * 100

stress_df = stress_df.sort_values("Climate_Stress_Score", ascending=False).reset_index(drop=True)

n = len(stress_df)

def risk_label(idx):
    if idx < n * 0.33:
        return "High"
    elif idx < n * 0.66:
        return "Moderate"
    else:
        return "Low"

stress_df["Risk_Level"] = stress_df.index.map(risk_label)
stress_df = stress_df.round(2)

# ---------------- SIDEBAR ---------------- #
st.sidebar.header("🔍 Select City")
selected_city = st.sidebar.selectbox("City", stress_df["City"])

city_data = stress_df[stress_df["City"] == selected_city].iloc[0]

# ---------------- MAIN DASHBOARD ---------------- #

st.markdown(f"## 📍 City: **{selected_city}**")

# Score Card
st.markdown("### 🚨 Climate Stress Score")
st.progress(int(city_data["Climate_Stress_Score"]))
st.metric(
    label="Overall Risk Score",
    value=f"{city_data['Climate_Stress_Score']} / 100",
    delta=risk_color(city_data["Risk_Level"])
)

st.divider()

# Stress Breakdown
st.markdown("### 📊 Stress Breakdown")

col1, col2, col3 = st.columns(3)

col1.metric("🌡️ Heat Stress (%)", city_data["Heat_Stress_%"])
col2.metric("🫁 Pollution Stress (%)", city_data["Pollution_Stress_%"])
col3.metric("🌧️ Rainfall Extreme (%)", city_data["Rainfall_Extreme_%"])

st.divider()

# Insights
st.markdown("### 🧠 Key Insights")
st.write(
    f"""
    • **{selected_city}** falls under **{city_data['Risk_Level']} climate risk**  
    • Pollution stress is a major contributor  
    • Heat stress is persistent across seasons  
    • Risk score is **relative to other Indian cities**
    """
)

st.divider()

# Footer
st.markdown(
    """
    ---
    📘 **Climate Stress & Anomaly Intelligence Web App**  
    Built using Python, Pandas, Streamlit  
    Data-driven climate risk analysis for Indian cities
    """
)

# ---------------- INSIGHTS ---------------- #
st.markdown("### 🧠 Insights")
st.write(
    f"""
    **{selected_city}** shows a **{city_data['Risk_Level']} climate risk**.
    
    - Heat stress affects **{city_data['Heat_Stress_%']}%** of days  
    - Pollution stress affects **{city_data['Pollution_Stress_%']}%** of days  
    - Extreme rainfall events occur on **{city_data['Rainfall_Extreme_%']}%** of days  

    This risk score is computed **relative to other major Indian cities**.
    """
)

# ---------------- RAW TABLE ---------------- #
with st.expander("📊 View City-wise Climate Stress Table"):
    st.dataframe(stress_df)

# ---------------- ANOMALY VISUALIZATION ---------------- #

st.markdown("## ⚠️ Climate Anomaly Detection")

city_df = df[df["City"] == selected_city]

# --- Temperature ---
st.markdown("### 🌡️ Temperature Anomalies")
fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(city_df["Date"], city_df["Temperature_Avg (°C)"], alpha=0.7)
ax.scatter(
    city_df[city_df["Temp_Anomaly"]]["Date"],
    city_df[city_df["Temp_Anomaly"]]["Temperature_Avg (°C)"],
    color="red",
    s=15
)
ax.set_ylabel("°C")
plt.tight_layout()
st.pyplot(fig)

# --- AQI ---
st.markdown("### 🫁 AQI Anomalies")
fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(city_df["Date"], city_df["AQI"], alpha=0.7)
ax.scatter(
    city_df[city_df["AQI_Anomaly"]]["Date"],
    city_df[city_df["AQI_Anomaly"]]["AQI"],
    color="red",
    s=15
)
ax.set_ylabel("AQI")
plt.tight_layout()
st.pyplot(fig)

# --- Rainfall ---
st.markdown("### 🌧️ Rainfall Anomalies")
fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(city_df["Date"], city_df["Rainfall (mm)"], alpha=0.7)
ax.scatter(
    city_df[city_df["Rainfall_Anomaly"]]["Date"],
    city_df[city_df["Rainfall_Anomaly"]]["Rainfall (mm)"],
    color="red",
    s=15
)
ax.set_ylabel("mm")
plt.tight_layout()
st.pyplot(fig)
