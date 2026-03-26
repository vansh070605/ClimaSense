import joblib
import xgboost as xgb
import os

model_path = 'e:/CODING/ClimaSense/aqi_classifier.pkl'

if not os.path.exists(model_path):
    print(f"Error: Model not found at {model_path}")
else:
    try:
        model = joblib.load(model_path)
        print(f"Model type: {type(model)}")
        
        # Method 1: Sklearn wrapper attributes
        if hasattr(model, 'n_features_in_'):
            print(f"n_features_in_: {model.n_features_in_}")
        
        # Method 2: Sklearn feature names
        if hasattr(model, 'feature_names_in_'):
            print(f"feature_names_in_: {model.feature_names_in_}")
        
        # Method 3: Booster attributes
        if hasattr(model, 'get_booster'):
            booster = model.get_booster()
            print(f"Booster feature names: {booster.feature_names}")
            if booster.feature_names:
                print(f"Number of features (booster): {len(booster.feature_names)}")
            
            # Check number of features in the booster directly
            # The booster might not have names but has a count
            print(f"Booster num_features: {booster.num_features()}")

    except Exception as e:
        print(f"Error: {e}")
