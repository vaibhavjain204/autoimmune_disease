"""
train_model_explicit.py

Trains a hybrid model (autoencoder -> LightGBM) using explicit columns:
Numeric: Age, ESR, CRP, RF, C3, C4
Categorical: Gender, Anti-CCP, HLA-B27, ANA, Anti-Ro, Anti-La, Anti-dsDNA, Anti-Sm
Label: Disease

Usage:
python train_model_explicit.py --input "C:\path\to\expanded_medical_dataset.xlsx" --output_dir "C:\path\to\model_dir"
"""

import os
import argparse
import pandas as pd
import numpy as np
import joblib
import gc
from collections import Counter

from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import accuracy_score, f1_score, classification_report
import lightgbm as lgb
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks

# -------------------------
# Columns & settings
# -------------------------
NUMERIC_COLS = ["Age","ESR","CRP","RF","C3","C4"]
CATEGORICAL_COLS = ["Gender","Anti-CCP","HLA-B27","ANA","Anti-Ro","Anti-La","Anti-dsDNA","Anti-Sm"]
LABEL_COL = "Disease"

TOP_K = 10   # keep top K frequent categories per column, rest => "OTHER"
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# -------------------------
# Autoencoder Builder
# -------------------------
def build_autoencoder(input_dim, latent_dim=16):
    inp = layers.Input(shape=(input_dim,))
    x = layers.Dense(max(64, input_dim*2), activation='relu')(inp)
    x = layers.Dense(max(32, input_dim), activation='relu')(x)
    latent = layers.Dense(latent_dim, activation='relu', name='latent')(x)
    x = layers.Dense(max(32, input_dim), activation='relu')(latent)
    x = layers.Dense(max(64, input_dim*2), activation='relu')(x)
    out = layers.Dense(input_dim, activation='linear')(x)

    model = models.Model(inputs=inp, outputs=out)
    encoder = models.Model(inputs=inp, outputs=latent)
    model.compile(optimizer='adam', loss='mse')
    return model, encoder

# -------------------------
# Load Dataset
# -------------------------
def load_dataset(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in ['.xls', '.xlsx']:
        return pd.read_excel(path)
    elif ext == '.csv':
        return pd.read_csv(path)
    else:
        raise ValueError("Unsupported file extension.")

# -------------------------
# Main
# -------------------------
def main(args):
    os.makedirs(args.output_dir, exist_ok=True)

    df = load_dataset(args.input)
    print("Loaded:", len(df), "rows")

    # check columns
    expected = NUMERIC_COLS + CATEGORICAL_COLS + [LABEL_COL]
    missing = [c for c in expected if c not in df.columns]
    if missing:
        raise ValueError(f"Missing expected columns: {missing}")

    df = df[expected].copy()

    # Cleaning
    df[NUMERIC_COLS] = df[NUMERIC_COLS].apply(pd.to_numeric, errors='coerce')
    df[NUMERIC_COLS] = df[NUMERIC_COLS].fillna(df[NUMERIC_COLS].median())
    df[CATEGORICAL_COLS] = df[CATEGORICAL_COLS].fillna("NA_MISSING").astype(str)
    df[LABEL_COL] = df[LABEL_COL].astype(str).fillna("unknown")

    # -------------------------
    # Top-K category compression
    # -------------------------
    df_cat = df[CATEGORICAL_COLS].copy()
    for col in CATEGORICAL_COLS:
        counts = Counter(df_cat[col])
        top_values = set([v for v,_ in counts.most_common(TOP_K)])
        df_cat[col] = df_cat[col].apply(lambda x: x if x in top_values else "OTHER")

    # OneHotEncoder (handle sklearn versions)
    try:
        ohe = OneHotEncoder(handle_unknown='ignore', sparse=False)
    except TypeError:
        # newer sklearn uses sparse_output
        ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)

    X_cat_encoded = ohe.fit_transform(df_cat)
    feature_names_cat = ohe.get_feature_names_out(CATEGORICAL_COLS).tolist()

    # Numeric Scaling
    scaler = StandardScaler()
    X_num_scaled = scaler.fit_transform(df[NUMERIC_COLS])

    # Free df_cat to save memory
    del df_cat
    gc.collect()

    # Final base features
    X_model = np.hstack([X_num_scaled, X_cat_encoded])

    # Labels encode
    classes = sorted(df[LABEL_COL].unique().tolist())
    class_to_idx = {c:i for i,c in enumerate(classes)}
    idx_to_class = {i:c for c,i in class_to_idx.items()}
    y = df[LABEL_COL].map(class_to_idx).values

    # split for autoencoder training (unsupervised)
    X_train, X_val, y_train, y_val = train_test_split(
        X_model, y, test_size=0.2, stratify=y, random_state=RANDOM_SEED
    )

    # -------------------------
    # Autoencoder Training
    # -------------------------
    input_dim = X_train.shape[1]
    latent_dim = min(32, max(8, input_dim // 4))

    ae, encoder = build_autoencoder(input_dim, latent_dim)
    es = callbacks.EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True)

    ae.fit(
        X_train, X_train,
        validation_data=(X_val, X_val),
        epochs=200,
        batch_size=256,
        callbacks=[es],
        verbose=1
    )

    # Latent features for full data
    latent_all = encoder.predict(X_model, batch_size=256)

    # Combine original + latent
    X_final = np.hstack([X_model, latent_all])

    # free some memory
    del X_model, X_num_scaled, X_cat_encoded, latent_all
    gc.collect()

    # -------------------------
    # LightGBM CV Training (callback-safe)
    # -------------------------
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    preds_proba = np.zeros((len(X_final), max(2, len(classes))))
    models_lgb = []

    for fold, (tr, te) in enumerate(skf.split(X_final, y)):
        print(f"Starting fold {fold+1}/5")
        X_tr, X_te = X_final[tr], X_final[te]
        y_tr, y_te = y[tr], y[te]

        params = {
            "objective": "multiclass" if len(classes) > 2 else "binary",
            "num_class": len(classes) if len(classes) > 2 else 1,
            "learning_rate": 0.05,
            "num_leaves": 31,
            "verbosity": -1,
            "seed": RANDOM_SEED + fold
        }

        train_ds = lgb.Dataset(X_tr, label=y_tr)
        val_ds = lgb.Dataset(X_te, label=y_te)

        # Try standard API first, fallback to callback method if needed
        try:
            model = lgb.train(
                params,
                train_ds,
                valid_sets=[train_ds, val_ds],
                early_stopping_rounds=30,
                num_boost_round=2000,
                verbose_eval=100
            )
        except TypeError:
            # use callback-based early stopping & logging (more cross-version compatible)
            callbacks_list = []
            try:
                callbacks_list.append(lgb.callback.early_stopping(stopping_rounds=30))
                callbacks_list.append(lgb.callback.log_evaluation(period=100))
            except Exception:
                # older wrappers might have different names; try alternative attribute
                try:
                    callbacks_list.append(lgb.early_stopping(stopping_rounds=30))
                except Exception:
                    callbacks_list = None

            if callbacks_list:
                model = lgb.train(
                    params,
                    train_ds,
                    valid_sets=[train_ds, val_ds],
                    callbacks=callbacks_list,
                    num_boost_round=2000
                )
            else:
                # Last-resort: fixed small number of rounds (safe fallback)
                model = lgb.train(params, train_ds, num_boost_round=500)

        models_lgb.append(model)
        preds_proba += model.predict(X_final)

    preds_proba /= skf.n_splits

    if preds_proba.shape[1] == 1:
        preds = (preds_proba.ravel() > 0.5).astype(int)
    else:
        preds = np.argmax(preds_proba, axis=1)

    # Metrics
    print("Accuracy:", accuracy_score(y, preds))
    print("Weighted F1:", f1_score(y, preds, average='weighted'))
    print("Report:")
    print(classification_report(y, preds, target_names=classes))

    # -------------------------
    # Save artifacts
    # -------------------------
    joblib.dump(scaler, os.path.join(args.output_dir, "scaler.joblib"))
    joblib.dump(ohe, os.path.join(args.output_dir, "ohe.joblib"))
    joblib.dump(class_to_idx, os.path.join(args.output_dir, "class_to_idx.joblib"))
    joblib.dump(idx_to_class, os.path.join(args.output_dir, "idx_to_class.joblib"))
    encoder.save(os.path.join(args.output_dir, "encoder.keras"), include_optimizer=False)
    joblib.dump(models_lgb, os.path.join(args.output_dir, "lgb_models.joblib"))

    print("Saved model to:", args.output_dir)
    print("Done!")

# -------------------------
# CLI
# -------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", "-i", required=True, help="Input .xlsx/.csv")
    parser.add_argument("--output_dir", "-o", required=True, help="Directory to save models")
    args = parser.parse_args()
    main(args)
