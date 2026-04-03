#!/usr/bin/env python3
"""
add_healthy.py

Safely append synthetic 'healthy' samples to a medical dataset (Excel or CSV).
Features:
 - Makes a backup of the original file.
 - Detects label/target column (common names) or accepts user-specified label column.
 - Adds healthy samples by sampling existing rows and perturbing numeric columns.
 - Handles categorical columns by sampling existing categories.
 - Adds configurable numeric noise and optional label flips (label noise).
 - Saves modified dataset to specified output path.

Usage example:
python add_healthy.py --input expanded_medical_dataset.xlsx --output expanded_medical_dataset_modified.xlsx \
    --healthy_frac 0.2 --noise 0.05 --label_col Disease --label_noise 0.03 --seed 42
"""
import argparse
import os
import shutil
import pandas as pd
import numpy as np

COMMON_LABELS = ['label','target','diagnosis','class','Outcome','outcome','disease','Disease','status','Status','y','Y']

def detect_label_column(df):
    for c in df.columns:
        if c in COMMON_LABELS:
            return c
    # fallback: last column
    return df.columns[-1]

def load_dataset(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in ['.xls', '.xlsx']:
        return pd.read_excel(path)
    elif ext == '.csv':
        return pd.read_csv(path)
    else:
        raise ValueError("Unsupported file extension. Use .xlsx, .xls or .csv")

def save_dataset(df, path):
    ext = os.path.splitext(path)[1].lower()
    if ext in ['.xls', '.xlsx']:
        df.to_excel(path, index=False)
    elif ext == '.csv':
        df.to_csv(path, index=False)
    else:
        raise ValueError("Unsupported file extension for saving. Use .xlsx or .csv")

def make_healthy_rows(df, label_col, n_new, noise_level, rng):
    # Determine numeric & categorical columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [c for c in df.columns if c not in numeric_cols and c != label_col]

    # Prefer sampling existing healthy-like rows; otherwise sample from majority
    mask_healthy_like = df[label_col].astype(str).str.contains('healthy|normal|control|neg|negative', case=False, na=False)
    if mask_healthy_like.sum() >= 1:
        base = df[mask_healthy_like].sample(n=n_new, replace=True, random_state=rng.integers(0,2**31-1))
    else:
        # sample from the majority class minus minority to avoid amplifying a disease
        base = df.sample(n=n_new, replace=True, random_state=rng.integers(0,2**31-1))

    new = base.copy().reset_index(drop=True)
    new[label_col] = 'healthy'

    # Perturb numeric columns
    for col in numeric_cols:
        col_vals = new[col].astype(float).values
        std = float(df[col].std(ddof=0)) if df[col].dtype.kind in 'fiu' else np.std(col_vals)
        if np.isnan(std) or std == 0:
            scale = noise_level * 0.01
        else:
            scale = noise_level * std
        noise = rng.normal(loc=0.0, scale=scale, size=len(new))
        # Safely add noise even if some values are missing
        col_vals = np.where(np.isnan(col_vals), col_vals, col_vals + noise)
        new[col] = col_vals

    # Fill categorical columns by sampling their values
    for col in categorical_cols:
        vals = df[col].dropna().unique()
        if len(vals) > 0:
            new[col] = rng.choice(vals, size=len(new))
        else:
            # leave as is (may be all NaN)
            pass

    return new

def main(args):
    # 1) Validate files and backup
    if not os.path.exists(args.input):
        raise FileNotFoundError(f"Input file not found: {args.input}")

    backup_path = os.path.splitext(args.input)[0] + "_backup" + os.path.splitext(args.input)[1]
    if not os.path.exists(backup_path):
        shutil.copy2(args.input, backup_path)
        print(f"Backup created: {backup_path}")
    else:
        print(f"Backup already exists: {backup_path}")

    # 2) Load dataset
    df = load_dataset(args.input)
    orig_n = len(df)
    print(f"Loaded {orig_n} rows, columns: {list(df.columns)}")

    # 3) Determine label column
    label_col = args.label_col if args.label_col else detect_label_column(df)
    if label_col not in df.columns:
        raise ValueError(f"Label column '{label_col}' not found in dataset columns.")
    print(f"Using label column: {label_col}")
    df[label_col] = df[label_col].astype(str)

    # 4) Compute how many healthy rows to add
    n_new = max(1, int(args.healthy_frac * orig_n))
    print(f"Adding {n_new} healthy rows ({args.healthy_frac*100:.1f}% of original)")

    # 5) Prepare RNG
    rng = np.random.default_rng(args.seed if args.seed is not None else None)

    # 6) Make healthy rows
    healthy_rows = make_healthy_rows(df, label_col, n_new, args.noise, rng)

    # 7) Append and optionally flip some labels (label noise)
    df_mod = pd.concat([df, healthy_rows], ignore_index=True)
    total_after = len(df_mod)
    print(f"Total rows after append: {total_after}")

    # 8) Optionally add label noise by flipping some original labels
    if args.label_noise > 0:
        n_flip = max(1, int(args.label_noise * orig_n))
        orig_indices = np.arange(orig_n)
        if len(orig_indices) > 0:
            flip_idx = rng.choice(orig_indices, size=min(n_flip, len(orig_indices)), replace=False)
            unique_labels = df_mod[label_col].unique().tolist()
            if len(unique_labels) >= 2:
                for idx in flip_idx:
                    current = df_mod.at[idx, label_col]
                    choices = [l for l in unique_labels if str(l) != str(current)]
                    if len(choices) > 0:
                        df_mod.at[idx, label_col] = str(rng.choice(choices))
            print(f"Flipped labels for {len(flip_idx)} original rows (label_noise={args.label_noise})")

    # 9) Shuffle rows to avoid blocks
    df_mod = df_mod.sample(frac=1, random_state=args.seed if args.seed is not None else None).reset_index(drop=True)

    # 10) Save
    save_dataset(df_mod, args.output)
    print(f"Modified dataset saved to: {args.output}")
    print("Done.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Append synthetic healthy samples to a dataset.")
    parser.add_argument("--input", "-i", required=True, help="Input dataset (Excel .xlsx/.xls or .csv)")
    parser.add_argument("--output", "-o", required=True, help="Output path for modified dataset (.xlsx/.csv)")
    parser.add_argument("--healthy_frac", type=float, default=0.2,
                        help="Fraction of original rows to add as 'healthy' (default 0.2)")
    parser.add_argument("--noise", type=float, default=0.05,
                        help="Numeric noise level (as fraction of column std). Default 0.05")
    parser.add_argument("--label_col", type=str, default=None,
                        help="Label column name if auto-detection is wrong")
    parser.add_argument("--label_noise", type=float, default=0.0,
                        help="Fraction of ORIGINAL labels to flip to other labels (label noise). Default 0.0")
    parser.add_argument("--seed", type=int, default=42, help="Random seed (int) for reproducibility")
    args = parser.parse_args()
    main(args)
