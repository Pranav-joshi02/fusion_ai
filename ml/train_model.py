import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# 📥 LOAD DATA
df = pd.read_csv("data/disaster_dataset.csv")

X = df[["temp", "humidity", "wind", "pressure", "rain", "aqi"]]
y = df["label"]

# 🔀 SPLIT
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 🧠 TRAIN
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 💾 SAVE MODEL
joblib.dump(model, "ml/disaster_model.pkl")

print("Model trained and saved!")