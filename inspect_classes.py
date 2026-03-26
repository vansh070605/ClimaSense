import joblib
import os

model_path = "aqi_classifier.pkl"
if os.path.exists(model_path):
    model = joblib.load(model_path)
    print(f"Model: {type(model)}")
    # If it's a pipeline, we might find the LabelEncoder
    # But often users just save the model and the classes separately.
    # I'll check if the model has classes_
    if hasattr(model, 'classes_'):
        print(f"Classes: {model.classes_}")
    
    # I'll also try to guess from the notebook's text
    # I'll grep for the unique values of AQI_Category
else:
    print("Model not found")
