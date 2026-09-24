# Campus Compass ML pipeline

This directory is intentionally separate from the browser app. Models are trained offline / server-side, never in the frontend.

## Expected input

CSV with at least:

- `captured_at` — timestamp
- `occupancy_percent` — 0…100

The pipeline resamples to five-minute buckets and keeps time ordering intact.

## Install

```bash
cd ml
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

## Train

```bash
python train.py --input data/occupancy.csv
```

Training keeps a final chronological test period untouched and performs three-fold **expanding-window** model selection on the earlier development period. Candidate models:

- previous-value baseline
- same-time-last-week baseline
- historical-mean baseline
- Ridge regression
- Random Forest
- Histogram Gradient Boosting

Mean expanding-window MAE selects a model per horizon. The final untouched chronological test split reports MAE, RMSE, sMAPE, R² and empirical interval coverage. No random shuffle is used.

## Predict

```bash
python predict.py --input data/latest_occupancy.csv
```

The resulting JSON contains 15, 30, 60, 90 and 120 minute forecasts with lower/upper uncertainty bounds. A Phase‑3 job can insert these rows into the Supabase `forecasts` table together with a versioned `model_runs` entry.

## Feature flags

The implemented core uses time encodings, lags, rolling means, rolling standard deviation and trend. Optional timestamp-aligned signals are guarded by explicit feature flags for semester phase, university/public holidays, exams, weather, campus events and timetable data. They default to `false`; enabling one without the required input columns fails fast instead of silently fabricating values. See `features/example_feature_flags.json` and pass it with `--feature-flags`.

## Prospective evaluation

Every production forecast should be persisted **when generated** with `generated_at`, `target_at`, horizon and model version. Later evaluation must compare that frozen forecast to what actually happened; it must not reconstruct a historical forecast with information that was unavailable at prediction time.
