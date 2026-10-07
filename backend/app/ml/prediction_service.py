"""ML category prediction service."""
import os
import joblib
from app.ml.train_model import train

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.joblib")


class PredictionService:
    _model = None

    @classmethod
    def get_model(cls):
        """Load the model, training it if not found."""
        if cls._model is None:
            if not os.path.exists(MODEL_PATH):
                print("Model not found. Training...")
                train()
            try:
                cls._model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"Error loading model: {e}. Retraining...")
                train()
                cls._model = joblib.load(MODEL_PATH)
        return cls._model

    @classmethod
    def predict_category(cls, text: str) -> str:
        """Predict complaint category from description text."""
        if not text or not text.strip():
            return "Other"
        model = cls.get_model()
        if model is None:
            return "Other"
        try:
            return model.predict([text.lower()])[0]
        except Exception as e:
            print(f"Prediction error: {e}")
            return "Other"
