from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model_dir"

app = FastAPI(title="Autoimmune Disease Prediction API")

# Columns must stay aligned with training.
NUMERIC_COLS = ["Age", "ESR", "CRP", "RF", "C3", "C4"]
CATEGORICAL_COLS = [
    "Gender",
    "Anti-CCP",
    "HLA-B27",
    "ANA",
    "Anti-Ro",
    "Anti-La",
    "Anti-dsDNA",
    "Anti-Sm",
]


def _load_artifacts():
    scaler = joblib.load(MODEL_DIR / "scaler.joblib")
    ohe = joblib.load(MODEL_DIR / "ohe.joblib")
    models = joblib.load(MODEL_DIR / "lgb_models.joblib")
    idx_to_class = joblib.load(MODEL_DIR / "idx_to_class.joblib")
    encoder = tf.keras.models.load_model(MODEL_DIR / "encoder.keras")
    return scaler, ohe, models, idx_to_class, encoder


def _ensure_2d_probs(prediction_output: np.ndarray) -> np.ndarray:
    probs = np.asarray(prediction_output)
    if probs.ndim == 1:
        probs = probs.reshape(-1, 1)
    return probs


scaler, ohe, models, idx_to_class, encoder = _load_artifacts()


class PatientData(BaseModel):
    Age: float
    ESR: float
    CRP: float
    RF: float
    C3: float
    C4: float
    Gender: str
    Anti_CCP: str
    HLA_B27: str
    ANA: str
    Anti_Ro: str
    Anti_La: str
    Anti_dsDNA: str
    Anti_Sm: str


@app.get("/")
def home():
    return {"message": "Autoimmune Disease Prediction API running"}


@app.get("/health")
def health():
    return {"status": "ok", "model_dir": str(MODEL_DIR)}


@app.post("/predict")
def predict(data: PatientData):
    try:
        row_num = pd.DataFrame(
            [
                {
                    "Age": data.Age,
                    "ESR": data.ESR,
                    "CRP": data.CRP,
                    "RF": data.RF,
                    "C3": data.C3,
                    "C4": data.C4,
                }
            ]
        )

        row_cat = pd.DataFrame(
            [
                {
                    "Gender": data.Gender,
                    "Anti-CCP": data.Anti_CCP,
                    "HLA-B27": data.HLA_B27,
                    "ANA": data.ANA,
                    "Anti-Ro": data.Anti_Ro,
                    "Anti-La": data.Anti_La,
                    "Anti-dsDNA": data.Anti_dsDNA,
                    "Anti-Sm": data.Anti_Sm,
                }
            ]
        )

        row_num_scaled = scaler.transform(row_num[NUMERIC_COLS])
        cat_enc = ohe.transform(row_cat[CATEGORICAL_COLS])
        x_base = np.hstack([row_num_scaled, cat_enc])

        latent = encoder.predict(x_base, verbose=0)
        x_final = np.hstack([x_base, latent])

        probs = None
        for model in models:
            current_probs = _ensure_2d_probs(model.predict(x_final))
            probs = current_probs if probs is None else probs + current_probs

        probs = probs / len(models)

        pred_idx = int(np.argmax(probs, axis=1)[0])
        pred_label = idx_to_class[pred_idx]

        return {
            "prediction": pred_label,
            "confidence": float(np.max(probs)),
        }
    except Exception as exc:
        return {"error": str(exc)}
