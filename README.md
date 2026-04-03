# Autoimmune Disease Prediction API

This folder contains the data-preparation notebooks, training scripts, saved ML model artifacts, and a FastAPI inference server for your mobile app.

## What each part does

- `cleaned_dataset_notebook.ipynb`: filters and cleans the original Excel dataset.
- `Expand_dataset_notebook.ipynb`: creates a larger balanced dataset with synthetic augmentation.
- `final dataset prepare.ipynb`: notebook version of healthy-class upsampling logic.
- `add_healthy.py`: script to safely append synthetic healthy rows to a dataset file.
- `new_train.py`: trains the hybrid pipeline and saves artifacts into a model folder.
- `model_dir/`: active inference artifacts used by the API.
- `main.py`: FastAPI app that loads the saved artifacts and exposes `/predict`.

## Input flow

The API expects:

- Numeric inputs: `Age`, `ESR`, `CRP`, `RF`, `C3`, `C4`
- Categorical inputs: `Gender`, `Anti_CCP`, `HLA_B27`, `ANA`, `Anti_Ro`, `Anti_La`, `Anti_dsDNA`, `Anti_Sm`

Inside the API, those categorical values are mapped back to the training column names with hyphens, preprocessed with the saved scaler and encoder, passed through the saved TensorFlow encoder, then sent to the saved LightGBM ensemble for final prediction.

## Run locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/docs`

## Docker run

```bash
docker build -t autoimmune-api .
docker run -p 8000:8000 autoimmune-api
```

## Recommended deployment shape

Deploy this as a containerized FastAPI service and then call the public `/predict` endpoint from your React Native app.
