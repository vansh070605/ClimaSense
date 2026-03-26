from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import json
import os
from datetime import datetime

app = FastAPI(title="ClimaSense Intelligence API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "aqi_classifier.pkl")
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

# AQI Category Mapping (from LabelEncoder in Climate.ipynb)
AQI_MAPPING = {
    0: "Good",
    1: "Moderate",
    2: "Poor",
    3: "Satisfactory",
    4: "Very Poor"
}

@app.get("/")
async def root():
    return {"status": "online", "engine": "Quantum Monitoring v4.2"}

@app.get("/live")
async def get_live_data():
    try:
        live_data_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "data", "live_data.json")
        with open(live_data_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Live data not found. Please run fetch_live_data.py")

@app.get("/forecast")
async def get_forecast():
    try:
        predictions_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "data", "predictions.json")
        with open(predictions_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Forecast data not found. Please run Climate.ipynb")

@app.post("/predict")
async def predict_aqi(data: dict):
    if not model:
        raise HTTPException(status_code=500, detail="AI Model not loaded")
    
    try:
        # aqi_classifier.pkl expects 3 features [Temp, Humidity, Wind]
        features = [
            float(data.get("temp", 25.0)),
            float(data.get("humidity", 50.0)),
            float(data.get("wind", 10.0))
        ]
        
        # XGBClassifier expects a 2D array
        prediction_idx = model.predict([features])[0]
        
        # Resolve label
        aqi_label = AQI_MAPPING.get(int(prediction_idx), f"Unknown ({prediction_idx})")
        
        return {
            "aqi_level": int(prediction_idx), 
            "aqi_category": aqi_label,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
