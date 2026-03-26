<div align="center">

# 🌍 Climate Stress & Anomaly Intelligence  
### *Because weather apps are boring.*

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=22&pause=1000&color=00E5FF&center=true&vCenter=true&width=650&lines=Climate+Stress+Analysis+but+Make+it+Smart;Detecting+Extreme+Weather+Like+a+Boss;Data+Science+%2B+Visualization+%2B+Web+App" />

<br/>

🚀 **LIVE CLIMASENSE HUB (Vite/React)**  
👉 Currently running on **http://localhost:5175/**

<br/>

<img src="https://img.shields.io/badge/Status-Complete-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Built%20With-React%2019-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/ML-Linear%20Regression-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/GIS-Esri%20Satellite-emerald?style=for-the-badge" />

</div>

---

## 🏆 ClimaSense Intelligence Hub (Overhaul)

The project has been transformed from a basic Streamlit app into a **premium, high-fidelity climate monitoring station**. It features:

- **📅 3-Year Forecasting (2026–2028)**: ML-driven projections for climate stress across major Indian cities.
- **🛰️ Immersive Satellite HUD**: Real-time geospatial monitoring using Esri World Imagery with an interactive, high-tech telemetry overlay.
- **📟 "Crazy Tech" Anomalies HUD**: Dynamic Radar Spectrum Analysis and live binary data-decryption streams for anomaly detection.
- **🏔️ Pristine Light UI**: A professional, airy "Control Room" aesthetic with glassmorphism, soft palettes, and premium animations.
- **⚡ Real-Time Simulation**: Simulated metric jitter and a "Scenario Simulation" mode to visualize internal calibration processes.

---

## 🏗️ Architecture

```
CSV Data (2024-25)
↓
regenerate_forecast.py (ML Extrapolation)
↓
predictions.json (Data Store)
↓
React 19 Frontend (Vite)
↓
Immersive Dashboard UI
```

---

## 🛠️ Tech Stack

- **ML Backend**: Python (Scikit-Learn, Pandas)
- **Frontend**: React 19, Vite, Tailwind CSS (v3)
- **Visuals**: Framer Motion (Animations), Recharts (Analytics), Lucide-React (Icons)
- **Geospatial**: Leaflet + Esri World Imagery

---

## 📂 Project Structure

```bash
ClimaSense/
├── frontend/                 # React/Vite Frontend Web App
│   └── src/data/             # Static configurations & data for UI
├── backend/                  # API Services & Streamlit Web App
│   ├── main.py               # FastAPI backend serving AI intelligence
│   └── app.py                # Streamlit Dashboard implementation
├── data/                     # Centralized Datasets & JSON stores
│   ├── Indian_Climate_Dat... # Raw telemetry data (2024-25)
│   └── predictions_exten...  # Forecasted intelligence outputs
├── ml_scripts/               # ML, Notebooks, and generator scripts
│   ├── Climate.ipynb         # Model training notebook
│   ├── analysis.py           # Evaluation analysis script
│   ├── regenerate_forecas... # Generates future AI predictions
│   └── generate_ppt.py       # Automated PPT generation
├── models/                   # Pickled AI Models
│   └── aqi_classifier.pkl    # Trained XGBoost AQI classification model
├── utils/                    # Internal debugging and inspection tools
└── launch_all.ps1            # Unified launch script
```

---

## 🚀 How to Start the Project

### 1. Unified Launch (Recommended)
You can spawn all three core services (FastAPI Backend, Streamlit Dashboard, React Frontend) simultaneously using the provided PowerShell script. Just run this at the project root:
```powershell
.\launch_all.ps1
```

### 2. Manual Launch
If you prefer starting them individually, use separate terminal windows:

**FastAPI Backend**
```bash
python backend/main.py
```

**Streamlit Dashboard**
```bash
streamlit run backend/app.py
```

**React Frontend**
Navigate to the `frontend` folder, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

### 3. (Optional) Regenerate Forecast Data
If you change the raw dataset or model logic, run this script to update the forecast data files:
```bash
python ml_scripts/regenerate_forecast.py
```

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