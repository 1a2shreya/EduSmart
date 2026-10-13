"""
career_model.py
---------------
Loads the pre-trained career prediction model from ml/career_model.pkl.

HOW TO TRAIN THE MODEL (run once):
    Set CAREER_CSV in your .env to the path of your dataset CSV, then run:
        python ml/career_model.py

After training, the .pkl files are saved next to this file and Django
loads them automatically on startup — no blocking, no re-training.
"""

import os
import pickle
from pathlib import Path

import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

# Load .env so CAREER_CSV is available when running this file directly
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

from api.roadmap import get_roadmap, get_salary
from scraper.intershala_scraper import scrape_internshala_jobs

# Paths are always relative to this file — works on any machine
_DIR = Path(__file__).resolve().parent
MODEL_PATH = _DIR / "career_model.pkl"
ENCODERS_PATH = _DIR / "label_encoders.pkl"


# ─────────────────────────────────────────
# Training (run directly, not on startup)
# ─────────────────────────────────────────
def train_and_save():
    """
    Train the model from the CSV defined in CAREER_CSV env variable
    and persist the pkl files next to this script.
    """
    csv_path = os.getenv("CAREER_CSV")
    if not csv_path or not Path(csv_path).exists():
        raise FileNotFoundError(
            f"Dataset CSV not found.\n"
            f"Set CAREER_CSV in your .env to the full path of the CSV file.\n"
            f"Got: {csv_path!r}"
        )

    df = pd.read_csv(csv_path)
    df = df.drop(columns=["student_id"], errors="ignore")

    label_encoders = {}
    for column in df.columns:
        if df[column].dtype == "object":
            le = LabelEncoder()
            df[column] = le.fit_transform(df[column])
            label_encoders[column] = le

    X = df.drop("career_path", axis=1)
    y = df["career_path"]

    trained_model = DecisionTreeClassifier(max_depth=6)
    trained_model.fit(X, y)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(trained_model, f)
    with open(ENCODERS_PATH, "wb") as f:
        pickle.dump(label_encoders, f)

    print(f"✅ Model trained and saved to {MODEL_PATH}")
    return trained_model, label_encoders


# ─────────────────────────────────────────
# Load model — fail with a clear message if pkl files are missing
# ─────────────────────────────────────────
if not MODEL_PATH.exists() or not ENCODERS_PATH.exists():
    raise RuntimeError(
        "\n"
        "❌ Career model .pkl files not found.\n"
        "   Run the following command ONCE to train and save the model:\n"
        "       python ml/career_model.py\n"
        "   Make sure CAREER_CSV is set in your .env file first.\n"
    )

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(ENCODERS_PATH, "rb") as f:
    label_encoders = pickle.load(f)


# ─────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────
def predict_career(user_input: dict) -> list:
    """
    Predict top 3 career paths for the given user_input dict.
    Returns:
        [
            {
                "career": str,
                "confidence": float,
                "roadmap": {"salary": str, "roadmap": dict},
                "jobs": list,
                "saveable": True
            },
            ...
        ]
    """
    input_df = pd.DataFrame([user_input])

    # Encode categorical columns
    for column in input_df.columns:
        le = label_encoders.get(column)
        if le:
            try:
                input_df[column] = le.transform(input_df[column].astype(str))
            except ValueError:
                input_df[column] = -1   # unseen value → -1

    # Ensure column order matches training; fill any missing columns with -1
    trained_features = list(model.feature_names_in_)
    for col in trained_features:
        if col not in input_df.columns:
            input_df[col] = -1
    input_df = input_df[trained_features]

    probabilities = model.predict_proba(input_df)[0]
    top_indices = probabilities.argsort()[-3:][::-1]
    class_labels = model.classes_
    le_career = label_encoders.get("career_path")

    recommendations = []
    for idx in top_indices:
        career_label = class_labels[idx]
        try:
            career_name = (
                le_career.inverse_transform([career_label])[0]
                if le_career else career_label
            )
        except Exception:
            career_name = str(career_label)

        try:
            jobs = scrape_internshala_jobs(career_name)
        except Exception:
            jobs = []

        recommendations.append({
            "career": career_name,
            "confidence": float(probabilities[idx]),
            "roadmap": {
                "salary": get_salary(career_name),
                "roadmap": get_roadmap(career_name),
            },
            "jobs": jobs,
            "saveable": True,
        })

    return recommendations


# ─────────────────────────────────────────
# Run directly to train
# ─────────────────────────────────────────
if __name__ == "__main__":
    train_and_save()