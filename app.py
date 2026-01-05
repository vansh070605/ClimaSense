import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import zscore

# ===================== CONFIG ===================== #

st.set_page_config(
    page_title="Climate Stress & Anomaly Intelligence",
    layout="wide"
)

# ---------------- STYLE ---------------- #
st.markdown(
    """
    <style>
    .stMetric {
        background-color: #161B22;
        padding: 15px;
        border-radius: 10px;
    }
    div[data-testid="stMetricValue"] {
        font-size: 28px;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# ===================== HELPERS ===================== #

def risk_badge(level):
    return {
        "High": "🔴 High Risk",
        "Moderate": "🟡 Moderate Risk",
        "Low": "🟢 Low Risk"
    }[level]

# ===================== DATA ===================== #

@st.cache_data
def load_data():
    df = pd.read_csv("Indian_Climate_Dataset_2024_2025.csv")
    df["Date"] = pd.to_datetime(df["Date"])
    return df.sort_values(["City", "Date"])

df = load_data()

# ===================== FEATURE ENGINEERING ===================== #

def add_stress_flags(df):
    df = df.copy()

    df["Heat_Stress_Day"] = (
        (df["Temperature_Avg (°C)"] > 35) &
        (df["Humidity (%)"] > 60)
    )

    df["Pollution_Stress_Day"] = df["AQI"] >= 201
    df["Rainfall_Extreme_Day"] = False

    for city in df["City"].unique():
        mask = df["City"] == city
        threshold = df.loc[mask, "Rainfall (mm)"].quantile(0.95)
        df.loc[mask, "Rainfall_Extreme_Day"] = df.loc[mask, "Rainfall (mm)"] > threshold

    return df

def add_anomalies(df):
    df = df.copy()
    df[["Temp_Anomaly", "AQI_Anomaly", "Rainfall_Anomaly"]] = False

    for city in df["City"].unique():
        mask = df["City"] == city
        df.loc[mask, "Temp_Anomaly"] = abs(zscore(df.loc[mask, "Temperature_Avg (°C)"])) > 2
        df.loc[mask, "AQI_Anomaly"] = abs(zscore(df.loc[mask, "AQI"])) > 2
        df.loc[mask, "Rainfall_Anomaly"] = abs(zscore(df.loc[mask, "Rainfall (mm)"])) > 2

    return df

df = add_stress_flags(df)
df = add_anomalies(df)

# ===================== STRESS SCORE ===================== #

@st.cache_data
def compute_stress_scores(df):
    rows = []

    for city in df["City"].unique():
        cdf = df[df["City"] == city]
        total = len(cdf)

        heat = cdf["Heat_Stress_Day"].sum() / total * 100
        pollution = cdf["Pollution_Stress_Day"].sum() / total * 100
        rain = cdf["Rainfall_Extreme_Day"].sum() / total * 100

        raw = 0.4 * heat + 0.4 * pollution + 0.2 * rain

        rows.append({
            "City": city,
            "Heat_Stress_%": heat,
            "Pollution_Stress_%": pollution,
            "Rainfall_Extreme_%": rain,
            "Raw_Score": raw
        })

    stress_df = pd.DataFrame(rows)
    stress_df["Climate_Stress_Score"] = (
        stress_df["Raw_Score"] / stress_df["Raw_Score"].max()
    ) * 100

    stress_df = stress_df.sort_values("Climate_Stress_Score", ascending=False).reset_index(drop=True)

    n = len(stress_df)
    stress_df["Risk_Level"] = [
        "High" if i < n*0.33 else "Moderate" if i < n*0.66 else "Low"
        for i in range(n)
    ]

    return stress_df.round(2)

stress_df = compute_stress_scores(df)

# ===================== UI ===================== #

st.title("🌍 Climate Stress & Anomaly Intelligence Dashboard")
st.write("Data-driven analysis of climate stress and extreme events in Indian cities.")

# ---------------- SIDEBAR ---------------- #
st.sidebar.header("🔍 Select City")
selected_city = st.sidebar.selectbox("City", stress_df["City"])

city_score = stress_df[stress_df["City"] == selected_city].iloc[0]
city_df = df[df["City"] == selected_city]

# ---------------- DASHBOARD ---------------- #

st.markdown(f"## 📍 {selected_city}")

st.markdown("### 🚨 Climate Stress Score")
st.progress(int(city_score["Climate_Stress_Score"]))
st.metric(
    "Overall Risk",
    f"{city_score['Climate_Stress_Score']} / 100",
    risk_badge(city_score["Risk_Level"])
)

st.divider()

col1, col2, col3 = st.columns(3)
col1.metric("🌡️ Heat Stress (%)", city_score["Heat_Stress_%"])
col2.metric("🫁 Pollution Stress (%)", city_score["Pollution_Stress_%"])
col3.metric("🌧️ Rainfall Extreme (%)", city_score["Rainfall_Extreme_%"])

st.markdown("### 🧠 Insights")
st.write(
    f"""
    **{selected_city}** falls under **{city_score['Risk_Level']} climate risk**.
    Pollution is the dominant contributor, followed by heat stress.
    Scores are **relative across major Indian cities**.
    """
)

# ---------------- ANOMALIES ---------------- #

st.markdown("## ⚠️ Climate Anomaly Detection")

def anomaly_plot(x, y, mask, ylabel):
    fig, ax = plt.subplots(figsize=(7, 2.2))
    ax.plot(x, y, alpha=0.5, linewidth=1)
    ax.scatter(x[mask], y[mask], color="red", s=12)
    ax.set_ylabel(ylabel)
    plt.tight_layout()
    st.pyplot(fig)

with st.expander("🌡️ Temperature Anomalies"):
    anomaly_plot(
        city_df["Date"],
        city_df["Temperature_Avg (°C)"],
        city_df["Temp_Anomaly"],
        "°C"
    )

with st.expander("🫁 AQI Anomalies"):
    anomaly_plot(
        city_df["Date"],
        city_df["AQI"],
        city_df["AQI_Anomaly"],
        "AQI"
    )

with st.expander("🌧️ Rainfall Anomalies"):
    anomaly_plot(
        city_df["Date"],
        city_df["Rainfall (mm)"],
        city_df["Rainfall_Anomaly"],
        "mm"
    )

# ---------------- TABLE ---------------- #

with st.expander("📊 View City-wise Climate Stress Table"):
    st.dataframe(stress_df)

# ---------------- FOOTER ---------------- #

st.markdown(
    """
    ---
    📘 **Climate Stress & Anomaly Intelligence Web App**  
    Built with Python • Pandas • Streamlit  
    Focused on long-term climate risk & extreme event analysis
    """
)
