import pandas as pd
import numpy as np
import json

def generate_3year_forecast():
    import os
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "Indian_Climate_Dataset_2024_2025.csv")
    df = pd.read_csv(data_path)
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Calculate daily stress scores
    df['Heat_Score'] = (df['Temperature_Avg (°C)'] > 35).astype(int) * 100
    df['Pollution_Score'] = (df['AQI'] > 150).astype(int) * 100
    rain_threshold = df['Rainfall (mm)'].quantile(0.95)
    df['Rainfall_Score'] = (df['Rainfall (mm)'] > rain_threshold).astype(int) * 100
    
    # Yearly split
    cities = df['City'].unique()
    results = {}
    
    for city in cities:
        city_results = {}
        # Historical Data
        for year in [2024, 2025]:
            mask = (df['City'] == city) & (df['Date'].dt.year == year)
            subset = df[mask]
            
            heat = subset['Heat_Score'].mean()
            poll = subset['Pollution_Score'].mean()
            rain = subset['Rainfall_Score'].mean()
            score = (0.4 * heat + 0.4 * poll + 0.2 * rain)
            
            city_results[str(year)] = {
                "heat": float(heat),
                "pollution": float(poll),
                "rainfall": float(rain),
                "score": float(score)
            }
        
        # 3-Year Prediction (2026, 2027, 2028)
        y24 = city_results["2024"]
        y25 = city_results["2025"]
        
        # Calculate yearly delta (Growth Rate)
        d_heat = y25["heat"] - y24["heat"]
        d_poll = y25["pollution"] - y24["pollution"]
        d_rain = y25["rainfall"] - y24["rainfall"]
        
        for forecast_year in [2026, 2027, 2028]:
            # Simple linear extrapolation for each year ahead
            step = forecast_year - 2025
            
            y_heat = np.clip(y25["heat"] + (d_heat * step), 0, 100)
            y_poll = np.clip(y25["pollution"] + (d_poll * step), 0, 100)
            y_rain = np.clip(y25["rainfall"] + (d_rain * step), 0, 100)
            y_score = (0.4 * y_heat + 0.4 * y_poll + 0.2 * y_rain)
            
            risk = "High" if y_score > 60 else "Moderate" if y_score > 40 else "Low"
            trend = "Worsening" if y_score > y25["score"] else "Improving" if y_score < y25["score"] else "Stable"
            
            city_results[str(forecast_year)] = {
                "heat": float(y_heat),
                "pollution": float(y_poll),
                "rainfall": float(y_rain),
                "score": float(y_score),
                "risk": risk,
                "trend": trend
            }
        
        results[city] = city_results
        
    import os
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "predictions_extended.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=4)
    print(f"SUCCESS: {out_path} (2024-2028) generated")

if __name__ == "__main__":
    generate_3year_forecast()
