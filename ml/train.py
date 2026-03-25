import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# 📥 LOAD DATASET
df = pd.read_csv("train.csv")

print("✅ Dataset Loaded")
print(df.head())


# 🧠 FEATURES & LABEL
X = df[["temp", "humidity", "wind", "pressure", "rain", "aqi"]]
y = df["label"]


# 🔤 ENCODE LABELS (IMPORTANT)
y = y.astype("category")
label_mapping = dict(enumerate(y.cat.categories))
y_encoded = y.cat.codes


# 🔀 TRAIN-TEST SPLIT
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)


# 🌳 MODEL
model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    random_state=42
)


# 🏋️ TRAIN
model.fit(X_train, y_train)
print("🔥 Model Training Complete")


# 📊 EVALUATE
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"\n🎯 Accuracy: {accuracy * 100:.2f}%")

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))


import os
import joblib

# ✅ CREATE FOLDER (absolute safe)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR)

os.makedirs(MODEL_DIR, exist_ok=True)

# ✅ FULL PATH (IMPORTANT)
model_path = os.path.join(MODEL_DIR, "disaster_model.pkl")
label_path = os.path.join(MODEL_DIR, "label_mapping.pkl")

# 💾 SAVE
joblib.dump(model, model_path)
joblib.dump(label_mapping, label_path)

print(f"\n💾 Model saved at: {model_path}")
print(f"💾 Label mapping saved at: {label_path}")