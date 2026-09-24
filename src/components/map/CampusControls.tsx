import { Building2, Eye, Flame, Footprints, Layers3, Leaf, MapPinned, Moon, RotateCcw, Sun, Sunset, Tags } from 'lucide-react';
import type { CampusLayerKey, CampusVisualMode } from '../../data/campus';
import type { CampusLayersState } from './mapTypes';

const LAYER_OPTIONS: readonly { key: CampusLayerKey; label: string; icon: typeof Building2 }[] = [
  { key: 'buildings', label: 'Buildings', icon: Building2 },
  { key: 'occupancy', label: 'Occupancy', icon: Eye },
  { key: 'forecast', label: 'Forecast', icon: MapPinned },
  { key: 'heatmap', label: 'Heatmap', icon: Flame },
  { key: 'flow', label: 'Flow', icon: Footprints },
  { key: 'labels', label: 'Labels', icon: Tags },
  { key: 'vegetation', label: 'Vegetation', icon: Leaf },
];

export function CampusLayerPanel({ layers, onToggle, visualMode, onVisualMode }: {
  layers: CampusLayersState;
  onToggle: (key: CampusLayerKey) => void;
  visualMode: CampusVisualMode;
  onVisualMode: (mode: CampusVisualMode) => void;
}) {
  const modes = [
    { key: 'day' as const, label: 'Day', icon: Sun },
    { key: 'dusk' as const, label: 'Dusk', icon: Sunset },
    { key: 'night' as const, label: 'Night', icon: Moon },
  ];
  return (
    <div className="campus-layer-panel">
      <div className="campus-panel-title"><Layers3 size={14} /><span>Layers</span><small>Heatmap & Flow = Simulation</small></div>
      <div className="campus-layer-grid">
        {LAYER_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button key={option.key} type="button" className={layers[option.key] ? 'is-active' : ''} onClick={() => onToggle(option.key)} aria-pressed={layers[option.key]}>
              <Icon size={14} /><span>{option.label}</span><i />
            </button>
          );
        })}
      </div>
      <div className="campus-visual-modes" aria-label="Kartendarstellung">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return <button key={mode.key} type="button" className={visualMode === mode.key ? 'is-active' : ''} aria-label={mode.label} onClick={() => onVisualMode(mode.key)}><Icon size={14} /></button>;
        })}
      </div>
    </div>
  );
}

export function CampusViewControls({ onPreset }: { onPreset: (preset: 'campus' | 'mensa' | 'central' | 'top' | 'north') => void }) {
  return (
    <div className="campus-view-controls" aria-label="Kameraperspektiven">
      <button type="button" onClick={() => onPreset('campus')}>Campus</button>
      <button type="button" onClick={() => onPreset('mensa')}>Mensa</button>
      <button type="button" onClick={() => onPreset('central')}>Zentralgebäude</button>
      <button type="button" onClick={() => onPreset('top')}>Top</button>
      <button type="button" className="campus-compass-button" aria-label="Nach Norden ausrichten" title="Nordausrichtung" onClick={() => onPreset('north')}><RotateCcw size={14} /><span>N</span></button>
    </div>
  );
}
