from __future__ import annotations

import numpy as np
import pandas as pd


def previous_value(current_values: pd.Series) -> np.ndarray:
    return current_values.to_numpy(dtype=float)


def historical_mean(train_target: pd.Series, size: int) -> np.ndarray:
    return np.full(size, float(train_target.mean()), dtype=float)


def same_time_last_week(series: pd.Series, target_index: pd.DatetimeIndex) -> np.ndarray:
    values = []
    for timestamp in target_index:
        prior = timestamp - pd.Timedelta(days=7)
        values.append(float(series.get(prior, np.nan)))
    return np.asarray(values, dtype=float)
