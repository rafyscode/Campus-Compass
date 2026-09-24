import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CAMPUS_CONFIG } from '../../data/campus';

export function CampusTimeScrubber({ value, onChange, enabled, reducedMotion }: { value: number; onChange: (minute: number) => void; enabled: boolean; reducedMotion: boolean }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const stops = CAMPUS_CONFIG.forecastStops;

  useEffect(() => {
    if (!playing || !enabled) return undefined;
    timer.current = window.setInterval(() => {
      const currentIndex = stops.indexOf(value as (typeof stops)[number]);
      const nextIndex = currentIndex >= stops.length - 1 ? 0 : currentIndex + 1;
      onChange(stops[nextIndex] ?? 0);
    }, reducedMotion ? 2200 : 1450);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [enabled, onChange, playing, reducedMotion, stops, value]);

  useEffect(() => {
    if (!enabled) setPlaying(false);
  }, [enabled]);

  const activeIndex = Math.max(0, stops.indexOf(value as (typeof stops)[number]));
  return (
    <div className={`campus-time-scrubber ${enabled ? '' : 'is-disabled'}`} aria-label="Forecast Zeitleiste">
      <div className="campus-scrubber-topline">
        <div>
          <span className="campus-scrubber-kicker">FORECAST TIME</span>
          <strong>{value === 0 ? 'Jetzt' : `+${value} Minuten`}</strong>
        </div>
        <div className="campus-scrubber-actions">
          <button type="button" className="campus-icon-button" disabled={!enabled} aria-label={playing ? 'Forecast pausieren' : 'Forecast abspielen'} onClick={() => setPlaying((state) => !state)}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
          <button type="button" className="campus-icon-button" disabled={!enabled || value === 0} aria-label="Forecast auf jetzt zurücksetzen" onClick={() => { setPlaying(false); onChange(0); }}><RotateCcw size={14} /></button>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={stops.length - 1}
        step={1}
        value={activeIndex}
        disabled={!enabled}
        aria-label="Forecast-Zeitpunkt"
        onChange={(event) => onChange(stops[Number(event.target.value)] ?? 0)}
      />
      <div className="campus-scrubber-stops" aria-hidden="true">
        {stops.map((stop) => <span key={stop}>{stop === 0 ? 'NOW' : `+${stop}`}</span>)}
      </div>
    </div>
  );
}
