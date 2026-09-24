from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class FeatureFlags:
    """Feature switches for signals that are only safe once timestamp-aligned data exists."""

    semester_period: bool = False
    university_holidays: bool = False
    public_holidays: bool = False
    exam_period: bool = False
    weather: bool = False
    campus_events: bool = False
    lecture_timetable: bool = False

    @classmethod
    def from_dict(cls, values: dict[str, object] | None) -> "FeatureFlags":
        values = values or {}
        known = {field for field in cls.__dataclass_fields__}
        unknown = set(values) - known
        if unknown:
            raise ValueError(f"Unknown feature flags: {sorted(unknown)}")
        return cls(**{key: bool(value) for key, value in values.items()})

    def to_dict(self) -> dict[str, bool]:
        return asdict(self)


OPTIONAL_FEATURES = {
    "semester_period": ["semester_period"],
    "university_holidays": ["university_holiday"],
    "public_holidays": ["public_holiday"],
    "exam_period": ["exam_period"],
    "weather": ["weather_temperature", "weather_precipitation"],
    "campus_events": ["campus_event_load"],
    "lecture_timetable": ["lecture_load"],
}
