from __future__ import annotations

import numpy as np
import pandas as pd

from features.feature_flags import FeatureFlags, OPTIONAL_FEATURES

BASE_FEATURES = [
    "minute_sin", "minute_cos", "hour_sin", "hour_cos", "dow_sin", "dow_cos",
    "week_of_year", "time_since_opening", "lag_5", "lag_15", "lag_30", "lag_60",
    "rolling_mean_15", "rolling_mean_30", "rolling_mean_60", "rolling_std_30", "trend_15"
]


def feature_names(flags: FeatureFlags | None = None) -> list[str]:
    flags = flags or FeatureFlags()
    names = list(BASE_FEATURES)
    for flag_name, columns in OPTIONAL_FEATURES.items():
        if getattr(flags, flag_name):
            names.extend(columns)
    return names


def prepare_series(frame: pd.DataFrame, frequency: str = "5min") -> pd.DataFrame:
    required = {"captured_at", "occupancy_percent"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    data = frame.copy()
    data["captured_at"] = pd.to_datetime(data["captured_at"], utc=True, format="mixed", errors="coerce")
    data["occupancy_percent"] = pd.to_numeric(data["occupancy_percent"], errors="coerce")
    data = data.dropna(subset=["captured_at", "occupancy_percent"]).sort_values("captured_at")
    data = data.drop_duplicates("captured_at", keep="last").set_index("captured_at")

    # Optional exogenous inputs are accepted only as numeric, timestamp-aligned columns.
    numeric_columns = ["occupancy_percent"]
    for columns in OPTIONAL_FEATURES.values():
        for column in columns:
            if column in data.columns:
                data[column] = pd.to_numeric(data[column], errors="coerce")
                numeric_columns.append(column)

    data = data[numeric_columns].resample(frequency).mean()
    data["occupancy_percent"] = data["occupancy_percent"].interpolate(limit=2).clip(0, 100)
    for column in numeric_columns:
        if column != "occupancy_percent":
            data[column] = data[column].ffill(limit=12)
    return data.dropna(subset=["occupancy_percent"])


def build_features(
    series: pd.DataFrame,
    opening_hour: int = 8,
    flags: FeatureFlags | None = None,
) -> pd.DataFrame:
    if not isinstance(series.index, pd.DatetimeIndex):
        raise TypeError("Expected DatetimeIndex")
    flags = flags or FeatureFlags()
    frame = series.copy()
    index = frame.index
    minute_of_day = index.hour * 60 + index.minute
    frame["minute_sin"] = np.sin(2 * np.pi * minute_of_day / 1440)
    frame["minute_cos"] = np.cos(2 * np.pi * minute_of_day / 1440)
    frame["hour_sin"] = np.sin(2 * np.pi * index.hour / 24)
    frame["hour_cos"] = np.cos(2 * np.pi * index.hour / 24)
    frame["dow_sin"] = np.sin(2 * np.pi * index.dayofweek / 7)
    frame["dow_cos"] = np.cos(2 * np.pi * index.dayofweek / 7)
    frame["week_of_year"] = index.isocalendar().week.astype(int).to_numpy()
    frame["time_since_opening"] = np.maximum(0, minute_of_day - opening_hour * 60)

    for minutes in (5, 15, 30, 60):
        frame[f"lag_{minutes}"] = frame["occupancy_percent"].shift(minutes // 5)
    frame["rolling_mean_15"] = frame["occupancy_percent"].shift(1).rolling(3).mean()
    frame["rolling_mean_30"] = frame["occupancy_percent"].shift(1).rolling(6).mean()
    frame["rolling_mean_60"] = frame["occupancy_percent"].shift(1).rolling(12).mean()
    frame["rolling_std_30"] = frame["occupancy_percent"].shift(1).rolling(6).std()
    frame["trend_15"] = frame["lag_5"] - frame["lag_15"]

    for flag_name, columns in OPTIONAL_FEATURES.items():
        if not getattr(flags, flag_name):
            continue
        missing = [column for column in columns if column not in frame.columns]
        if missing:
            raise ValueError(
                f"Feature flag '{flag_name}' is enabled but input columns are missing: {missing}"
            )
    return frame


def make_supervised(
    series: pd.DataFrame,
    horizon_minutes: int,
    flags: FeatureFlags | None = None,
) -> tuple[pd.DataFrame, pd.Series]:
    if horizon_minutes % 5 != 0:
        raise ValueError("Horizon must be divisible by the 5-minute base frequency")
    flags = flags or FeatureFlags()
    names = feature_names(flags)
    features = build_features(series, flags=flags)
    target = features["occupancy_percent"].shift(-(horizon_minutes // 5)).rename("target")
    dataset = pd.concat([features[names], target], axis=1).dropna()
    return dataset[names], dataset["target"]
