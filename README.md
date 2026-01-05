<div align="center">

# 🌍 Climate Stress & Anomaly Intelligence  
### *Because weather apps are boring.*

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=22&pause=1000&color=00E5FF&center=true&vCenter=true&width=650&lines=Climate+Stress+Analysis+but+Make+it+Smart;Detecting+Extreme+Weather+Like+a+Boss;Data+Science+%2B+Visualization+%2B+Web+App" />

<br/>

🚀 **LIVE APP**  
👉 https://climate-stress-anomaly.streamlit.app/

<br/>

<img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Built%20With-Python-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Framework-Streamlit-red?style=for-the-badge" />
<img src="https://img.shields.io/badge/Data-Climate-orange?style=for-the-badge" />

</div>

---

## 🤔 What is this thing?

Most weather apps tell you:  
> *“It’s hot today.”*  

This app says:  
> **“This city has been stressed for months… and here’s the data to prove it.”**

### ⚡ TL;DR
This is a **Climate Intelligence Dashboard** that:
- Detects **heat, pollution & rainfall stress**
- Finds **extreme climate anomalies**
- Ranks cities using a **custom Climate Stress Index**
- Visualizes everything in a **clean, interactive web app**

---

## 🧠 Big Brain Features

### 🔥 Climate Stress Detection
We define **stress days** using real thresholds:
- 🌡️ Heat Stress → Temp > 35°C & Humidity > 60%
- 🫁 Pollution Stress → AQI ≥ 201
- 🌧️ Rainfall Extremes → Top 5% rainfall days (city-wise)

---

### ⚠️ Climate Anomaly Detection (Stats go brrr 📈)
Using **Z-score based anomaly detection**:
- Temperature spikes
- AQI pollution surges
- Abnormal rainfall events  

Red dots = *“yeah… this day was NOT normal.”*

---

### 📊 Climate Stress Score™ (0–100)
A **custom-built index**, not copied from anywhere:

```

40% Heat Stress
40% Pollution Stress
20% Rainfall Extremes

```

Then we **rank cities relative to each other**, because absolute numbers lie.

🔴 High Risk  
🟡 Moderate Risk  
🟢 Low Risk  

---

## 🖥️ The Dashboard (aka the cool part)

✨ What you get:
- City selector
- Animated score bar
- Risk badges
- Stress breakdown cards
- Compact anomaly plots
- Dark theme (because obviously)

All running live in the browser.

---

## 🏗️ How it works (Architecture)

```

CSV Climate Data
↓
Data Cleaning & Processing
↓
Stress Flags + Anomaly Detection
↓
Climate Stress Index Calculation
↓
Interactive Streamlit Dashboard
↓
Deployed on Streamlit Cloud 🌍

```

---

## 🛠️ Tech Stack (no fluff)

- 🐍 Python
- 📊 Pandas & NumPy
- 📉 SciPy (statistical anomaly detection)
- 📈 Matplotlib
- 🌐 Streamlit (frontend + deployment)

---

## 📂 Project Structure

```

├── app.py                  # Streamlit Web App
├── analysis.py             # Core data analysis
├── Indian_Climate_Dataset_2024_2025.csv
├── requirements.txt
├── .streamlit/
│   └── config.toml         # Dark theme config
└── README.md               # You are here 😄

````

---

## 🚀 Run Locally (if you’re curious)

```bash
pip install -r requirements.txt
streamlit run app.py
````

---

## 🎯 Why this project is different

❌ Not a weather clone
❌ Not a tutorial project
❌ Not “just charts”

✅ End-to-end data science
✅ Custom metrics
✅ Explainable logic
✅ Deployed & usable
✅ Resume-worthy

---

## 🔮 Future Ideas (if I feel unstoppable)

* Seasonal trend analysis
* Climate risk forecasting
* More cities & datasets
* Policy impact simulations
* Exportable reports (PDF)

---

## 👨‍💻 Author

**Vansh Agrawal**
Engineering Student • Data Science • AI

🔗 GitHub: [https://github.com/vansh070605](https://github.com/vansh070605)
🔗 Live App: [https://climate-stress-anomaly.streamlit.app/](https://climate-stress-anomaly.streamlit.app/)

---

<div align="center">

### ⭐ If this project impressed you, star the repo.

### The climate may be stressed, but this code isn’t.

</div>