import sys
import json
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Directory for storing models
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')

# Make sure the models directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# File paths for model persistence
MODEL_PATH = os.path.join(MODEL_DIR, 'rf_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, 'label_encoder.pkl')
FEATURE_NAMES_PATH = os.path.join(MODEL_DIR, 'feature_names.pkl')

# Create or load models
def get_models():
    if os.path.exists(MODEL_PATH):
        # Load existing models
        model = pickle.load(open(MODEL_PATH, 'rb'))
        scaler = pickle.load(open(SCALER_PATH, 'rb'))
        label_encoder = pickle.load(open(LABEL_ENCODER_PATH, 'rb'))
        feature_names = pickle.load(open(FEATURE_NAMES_PATH, 'rb'))
    else:
        # Create new models with default training
        model = create_default_model()
        scaler = StandardScaler()
        label_encoder = LabelEncoder()
        # Default feature names for CICIDS dataset
        feature_names = [
            "Duration", "Protocol", "SrcPort", "DstPort", "FlowDuration", 
            "TotalFwdPackets", "TotalBackwardPackets", "FwdPacketLengthMax",
            "FwdPacketLengthMin", "FwdPacketLengthMean", "FwdPacketLengthStd",
            "BwdPacketLengthMax", "BwdPacketLengthMin", "BwdPacketLengthMean",
            "BwdPacketLengthStd", "FlowPacketsPerSecond", "FlowBytesPerSecond"
        ]
        
        # Save the newly created models
        pickle.dump(model, open(MODEL_PATH, 'wb'))
        pickle.dump(scaler, open(SCALER_PATH, 'wb'))
        pickle.dump(label_encoder, open(LABEL_ENCODER_PATH, 'wb'))
        pickle.dump(feature_names, open(FEATURE_NAMES_PATH, 'wb'))
    
    return model, scaler, label_encoder, feature_names

def create_default_model():
    # Create a default RandomForest model for demonstration
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    # The model would typically be trained here with dataset
    return model

def predict_attack(data_json):
    try:
        # Parse input data
        data = json.loads(data_json)
        
        # Get models
        model, scaler, label_encoder, feature_names = get_models()
        
        # Create a dataframe from input data
        if isinstance(data, dict):
            # Single sample as dictionary
            df = pd.DataFrame([data])
        else:
            # List of samples
            df = pd.DataFrame(data)
        
        # Match feature names and ensure expected format
        expected_features = set(feature_names)
        provided_features = set(df.columns)
        
        # Handle missing features
        missing_features = expected_features - provided_features
        for feature in missing_features:
            df[feature] = 0  # Fill with default value
            
        # Select only expected features and ensure correct order
        X = df[feature_names].copy()
        
        # Scale the features
        X_scaled = scaler.transform(X)
        
        # Make prediction
        attack_proba = model.predict_proba(X_scaled)
        prediction = model.predict(X_scaled)
        
        # Get class labels
        class_labels = list(label_encoder.classes_)
        
        # Get feature importances
        feature_importances = dict(zip(feature_names, model.feature_importances_))
        
        # Calculate anomaly score (simplified approach)
        anomaly_score = np.mean(np.max(attack_proba, axis=1)) * 100
        
        # Format results
        results = {
            "isAttack": prediction[0] != "BENIGN",
            "attackType": prediction[0] if prediction[0] != "BENIGN" else None,
            "confidence": float(np.max(attack_proba[0]) * 100),
            "anomalyScore": float(anomaly_score),
            "predictions": {class_labels[i]: float(attack_proba[0][i] * 100) for i in range(len(class_labels))},
            "featureImportance": {k: float(v) for k, v in feature_importances.items()},
            "modelUsed": "RandomForest"
        }
        
        return json.dumps(results)
        
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "isAttack": False,
            "confidence": 0,
            "attackType": None,
            "modelUsed": "Error"
        })

# For direct execution from Node.js
if __name__ == "__main__":
    # Read input from stdin
    data_json = sys.stdin.read()
    
    # Process and predict
    result = predict_attack(data_json)
    
    # Output result to stdout
    print(result)
