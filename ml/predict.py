from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from features.build_features import build_features, feature_names, prepare_series
from features.feature_flags import FeatureFlags


def main():
    parser = argparse.ArgumentParser(description="Generate multi-horizon occupancy forecast")
    parser.add_argument("--input", required=True, help="Latest CSV history with captured_at, occupancy_percent")
    parser.add_argument("--model", default="models/artifacts/campus_compass.joblib")
    parser.add_argument("--output", default="models/artifacts/latest_forecast.json")
    args = parser.parse_args()

    artifact = joblib.load(args.model)
    series = prepare_series(pd.read_csv(args.input))
    flags = FeatureFlags.from_dict(artifact.get("feature_flags", {}))
    selected_features = artifact.get("features", feature_names(flags))
    feature_frame = build_features(series, flags=flags).dropna(subset=selected_features)
    if feature_frame.empty:
        raise ValueError("Not enough recent history to build features")
    latest = feature_frame.iloc[[-1]][selected_features]
    generated_at = latest.index[0]
    rows = []
    for horizon, config in sorted(artifact["horizons"].items()):
        winner = config["winner"]
        if winner == "baseline_previous":
            prediction = float(latest["lag_5"].iloc[0])
        elif winner == "baseline_same_time_last_week":
            reference_at = generated_at + pd.Timedelta(minutes=int(horizon)) - pd.Timedelta(days=7)
            reference_value = series["occupancy_percent"].get(reference_at, np.nan)
            prediction = float(config["historical_mean"] if pd.isna(reference_value) else reference_value)
        elif winner == "baseline_historical_mean":
            prediction = float(config["historical_mean"])
        else:
            prediction = float(config["model"].predict(latest)[0])
        prediction = float(np.clip(prediction, 0, 100))
        half = float(config["interval_half_width"])
        rows.append({
            "generated_at": generated_at.isoformat(),
            "target_at": (generated_at + pd.Timedelta(minutes=int(horizon))).isoformat(),
            "horizon_minutes": int(horizon),
            "predicted_occupancy": round(prediction, 2),
            "lower_bound": round(max(0, prediction - half), 2),
            "upper_bound": round(min(100, prediction + half), 2),
            "model_name": winner,
        })

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(rows, indent=2), encoding="utf-8")
    print(json.dumps(rows, indent=2))


if __name__ == "__main__":
    main()
