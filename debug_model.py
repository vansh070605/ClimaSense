import joblib
import os
import numpy as np

model_path = "aqi_classifier.pkl"
if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
        print(f"Model loaded successfully from {os.path.abspath(model_path)}")
        if hasattr(model, 'n_features_in_'):
            print(f"Expected number of features: {model.n_features_in_}")
        else:
            print("Model does not have n_features_in_ attribute.")
        
        # Try a dummy prediction with 6 features
        dummy = np.array([[25.0, 50.0, 0.0, 10.0, 1013.0, 20.0]])
        try:
            pred = model.predict(dummy)
            print(f"Dummy prediction (6 features) successful: {pred}")
        except Exception as e:
            print(f"Dummy prediction (6 features) FAILED: {e}")
            
        # Try a dummy prediction with 3 features
        dummy3 = np.array([[25.0, 50.0, 10.0]])
        try:
            pred3 = model.predict(dummy3)
            print(f"Dummy prediction (3 features) successful: {pred3}")
        except Exception as e:
            print(f"Dummy prediction (3 features) FAILED: {e}")
            
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Model file NOT found at {os.path.abspath(model_path)}")
