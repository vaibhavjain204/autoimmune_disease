import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import joblib
import jwt
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel
from pymongo import MongoClient

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "model_dir"

MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "aionova_health").strip()
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-jwt-secret-in-render").strip()
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

mongo_client = MongoClient(MONGODB_URI) if MONGODB_URI else None
db = mongo_client[MONGODB_DB_NAME] if mongo_client else None

app = FastAPI(title="Autoimmune Disease Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


def _db_required():
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database is not configured yet. Add MONGODB_URI and MONGODB_DB_NAME in Render environment variables.",
        )
    return db


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _user_public_payload(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "age": user.get("age", ""),
        "gender": user.get("gender", ""),
        "created_at": user.get("created_at"),
    }


def _get_current_user(authorization: str | None) -> dict[str, Any] | None:
    if not authorization:
        return None

    token = authorization.replace("Bearer ", "", 1).strip()
    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") from exc

    database = _db_required()
    user = database.users.find_one({"_id": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    return user


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


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    name: str = ""
    age: str = ""
    gender: str = ""


@app.get("/")
def home():
    return {"message": "Autoimmune Disease Prediction API running"}


@app.get("/health")
def health():
    return {
        "database_configured": bool(db),
        "model_dir": str(MODEL_DIR),
        "status": "ok",
    }


@app.post("/auth/signup")
def signup(data: SignupRequest):
    database = _db_required()
    email = data.email.strip().lower()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing_user = database.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = {
        "_id": email,
        "email": email,
        "name": data.name.strip(),
        "password_hash": _hash_password(data.password),
        "age": "",
        "gender": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    database.users.insert_one(user)

    token = _create_access_token(user["_id"], email)
    return {
        "token": token,
        "user": _user_public_payload(user),
    }


@app.post("/auth/login")
def login(data: LoginRequest):
    database = _db_required()
    email = data.email.strip().lower()
    user = database.users.find_one({"email": email})

    if not user or not _verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = _create_access_token(str(user["_id"]), user["email"])
    return {
        "token": token,
        "user": _user_public_payload(user),
    }


@app.get("/auth/me")
def me(authorization: str | None = Header(default=None)):
    user = _get_current_user(authorization)
    if user is None:
        raise HTTPException(status_code=401, detail="Authorization token is required.")
    return {"user": _user_public_payload(user)}


@app.put("/auth/profile")
def update_profile(data: ProfileUpdateRequest, authorization: str | None = Header(default=None)):
    user = _get_current_user(authorization)
    if user is None:
        raise HTTPException(status_code=401, detail="Authorization token is required.")

    database = _db_required()
    update_data = {
        "name": data.name.strip(),
        "age": data.age.strip(),
        "gender": data.gender.strip(),
    }
    database.users.update_one({"_id": user["_id"]}, {"$set": update_data})
    updated_user = database.users.find_one({"_id": user["_id"]})
    return {"user": _user_public_payload(updated_user)}


@app.get("/predictions/history")
def prediction_history(authorization: str | None = Header(default=None)):
    user = _get_current_user(authorization)
    if user is None:
        raise HTTPException(status_code=401, detail="Authorization token is required.")

    database = _db_required()
    records = list(
        database.predictions.find({"user_id": str(user["_id"])}).sort("created_at", -1).limit(20)
    )
    return {
        "items": [
            {
                "id": str(item.get("_id")),
                "prediction": item.get("prediction"),
                "confidence": item.get("confidence"),
                "created_at": item.get("created_at"),
                "inputs": item.get("inputs", {}),
            }
            for item in records
        ]
    }


@app.post("/predict")
def predict(data: PatientData, authorization: str | None = Header(default=None)):
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
        confidence = float(np.max(probs))

        user = _get_current_user(authorization)
        if user is not None and db is not None:
            db.predictions.insert_one(
                {
                    "user_id": str(user["_id"]),
                    "prediction": pred_label,
                    "confidence": confidence,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "inputs": data.model_dump(),
                }
            )

        return {
            "prediction": pred_label,
            "confidence": confidence,
        }
    except HTTPException:
        raise
    except Exception as exc:
        return {"error": str(exc)}
