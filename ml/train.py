from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from evaluate import interval_coverage, metrics
from features.build_features import feature_names, make_supervised, prepare_series
from features.feature_flags import FeatureFlags

HORIZONS = [15, 30, 60, 90, 120]


def candidate_models(seed: int):
    return {
        "ridge": Pipeline([("scale", StandardScaler()), ("model", Ridge(alpha=3.0))]),
        "random_forest": RandomForestRegressor(
            n_estimators=240, max_depth=12, min_samples_leaf=3, random_state=seed, n_jobs=-1
        ),
        "hist_gradient_boosting": HistGradientBoostingRegressor(
            learning_rate=0.06, max_iter=220, max_leaf_nodes=24, l2_regularization=1.0, random_state=seed
        ),
    }


def same_time_last_week_prediction(
    series: pd.DataFrame,
    origin_index: pd.DatetimeIndex,
    horizon_minutes: int,
    fallback: float,
) -> np.ndarray:
    values = series["occupancy_percent"]
    predictions: list[float] = []
    for origin in origin_index:
        reference_at = origin + pd.Timedelta(minutes=horizon_minutes) - pd.Timedelta(days=7)
        value = values.get(reference_at, np.nan)
        predictions.append(float(fallback if pd.isna(value) else value))
    return np.asarray(predictions, dtype=float)


def expanding_window_folds(n_samples: int, n_folds: int = 3):
    """Yield chronological expanding-train / forward-validation index ranges."""
    if n_samples < 120:
        raise ValueError("Not enough development samples for expanding-window evaluation")
    initial_train = max(80, int(n_samples * 0.50))
    remaining = n_samples - initial_train
    fold_size = max(20, remaining // n_folds)
    folds = []
    train_end = initial_train
    for fold in range(n_folds):
        val_start = train_end
        val_end = n_samples if fold == n_folds - 1 else min(n_samples, val_start + fold_size)
        if val_end - val_start < 10:
            break
        folds.append((0, train_end, val_start, val_end))
        train_end = val_end
    if len(folds) < 2:
        raise ValueError("Could not construct at least two expanding-window folds")
    return folds


def baseline_predictions(
    name: str,
    series: pd.DataFrame,
    X_val: pd.DataFrame,
    y_train: pd.Series,
    horizon: int,
) -> np.ndarray:
    if name == "baseline_previous":
        return X_val["lag_5"].to_numpy(dtype=float)
    if name == "baseline_historical_mean":
        return np.full(len(X_val), float(y_train.mean()), dtype=float)
    if name == "baseline_same_time_last_week":
        return same_time_last_week_prediction(
            series,
            X_val.index,
            horizon_minutes=horizon,
            fallback=float(y_train.mean()),
        )
    raise KeyError(name)


def train_horizon(series: pd.DataFrame, horizon: int, seed: int, flags: FeatureFlags):
    X, y = make_supervised(series, horizon, flags=flags)
    if len(X) < 250:
        raise ValueError(f"Not enough samples for {horizon} min horizon: {len(X)}. Collect more history.")

    # The final 17% is untouched until model selection is complete.
    test_start = max(1, int(len(X) * 0.83))
    X_dev, y_dev = X.iloc[:test_start], y.iloc[:test_start]
    X_test, y_test = X.iloc[test_start:], y.iloc[test_start:]
    if len(X_test) < 20:
        raise ValueError("Test split too small. Collect more history.")

    baseline_names = [
        "baseline_previous",
        "baseline_same_time_last_week",
        "baseline_historical_mean",
    ]
    model_templates = candidate_models(seed)
    candidate_names = baseline_names + list(model_templates)
    fold_scores: dict[str, list[dict[str, float]]] = {name: [] for name in candidate_names}
    fold_residuals: dict[str, list[np.ndarray]] = {name: [] for name in candidate_names}

    for _, train_end, val_start, val_end in expanding_window_folds(len(X_dev), n_folds=3):
        X_train, y_train = X_dev.iloc[:train_end], y_dev.iloc[:train_end]
        X_val, y_val = X_dev.iloc[val_start:val_end], y_dev.iloc[val_start:val_end]

        for name in baseline_names:
            prediction = np.clip(baseline_predictions(name, series, X_val, y_train, horizon), 0, 100)
            fold_scores[name].append(metrics(y_val.to_numpy(), prediction))
            fold_residuals[name].append(y_val.to_numpy() - prediction)

        for name, template in model_templates.items():
            model = clone(template)
            model.fit(X_train, y_train)
            prediction = np.clip(model.predict(X_val), 0, 100)
            fold_scores[name].append(metrics(y_val.to_numpy(), prediction))
            fold_residuals[name].append(y_val.to_numpy() - prediction)

    validation_candidates = {
        name: {
            metric_name: float(np.mean([fold[metric_name] for fold in scores]))
            for metric_name in scores[0]
        }
        for name, scores in fold_scores.items()
    }
    winner = min(validation_candidates, key=lambda name: validation_candidates[name]["mae"])

    final_model = None
    if winner not in baseline_names:
        final_model = clone(model_templates[winner])
        final_model.fit(X_dev, y_dev)

    if winner in baseline_names:
        test_pred = baseline_predictions(winner, series, X_test, y_dev, horizon)
    else:
        test_pred = final_model.predict(X_test)
    test_pred = np.clip(test_pred, 0, 100)

    calibration_residuals = np.concatenate(fold_residuals[winner])
    half_width = float(np.quantile(np.abs(calibration_residuals), 0.90))
    lower = np.clip(test_pred - half_width, 0, 100)
    upper = np.clip(test_pred + half_width, 0, 100)
    test_metrics = metrics(y_test.to_numpy(), test_pred)
    test_metrics["interval_coverage"] = interval_coverage(y_test.to_numpy(), lower, upper)

    return {
        "winner": winner,
        "model": final_model,
        "historical_mean": float(y_dev.mean()),
        "interval_half_width": half_width,
        "validation_candidates": validation_candidates,
        "validation_method": "3-fold expanding-window on chronological development data",
        "test_metrics": test_metrics,
        "n_development": len(X_dev),
        "n_test": len(X_test),
        "test_start": X_test.index.min().isoformat(),
        "test_end": X_test.index.max().isoformat(),
    }


def main():
    parser = argparse.ArgumentParser(description="Chronological Campus Compass occupancy model training")
    parser.add_argument("--input", required=True, help="CSV with captured_at, occupancy_percent")
    parser.add_argument("--output", default="models/artifacts/campus_compass.joblib")
    parser.add_argument("--report", default="models/artifacts/training_report.json")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--feature-flags", help="Optional JSON file with exogenous feature switches")
    args = parser.parse_args()

    flag_values = {}
    if args.feature_flags:
        flag_values = json.loads(Path(args.feature_flags).read_text(encoding="utf-8"))
    flags = FeatureFlags.from_dict(flag_values)
    selected_features = feature_names(flags)
    series = prepare_series(pd.read_csv(args.input))
    artifacts = {}
    report = {
        "frequency": "5min",
        "features": selected_features,
        "feature_flags": flags.to_dict(),
        "evaluation": "chronological holdout + expanding-window model selection; no shuffle",
        "horizons": {},
    }
    for horizon in HORIZONS:
        result = train_horizon(series, horizon, args.seed + horizon, flags)
        artifacts[horizon] = {
            "winner": result["winner"],
            "model": result["model"],
            "historical_mean": result["historical_mean"],
            "interval_half_width": result["interval_half_width"],
        }
        report["horizons"][str(horizon)] = {key: value for key, value in result.items() if key != "model"}
        print(f"{horizon:>3} min -> {result['winner']} | test MAE={result['test_metrics']['mae']:.3f}")

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"horizons": artifacts, "features": selected_features, "feature_flags": flags.to_dict(), "frequency": "5min"}, output)
    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Saved model artifact to {output}")
    print(f"Saved report to {report_path}")


if __name__ == "__main__":
    main()
