import type { Unit } from '../api';

type Props = {
  units: Unit[];
  activeUnit: Unit | null;
  onSelectUnit: (u: Unit) => void;
  brushRadius: number;
  onBrushRadius: (v: number) => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
};

function cleanLabel(raw: string) {
  if (!raw) return '(uninterpretable)';
  return raw.replace(/-[a-z]$/, '');
}

export default function Sidebar({
  units,
  activeUnit,
  onSelectUnit,
  brushRadius,
  onBrushRadius,
  onUndo,
  onReset,
  canUndo,
}: Props) {
  return (
    <aside className="w-64 bg-surface border-r border-outline-variant flex flex-col h-full z-20">
      <div className="p-base border-b border-outline-variant">
        <h1 className="text-headline-md text-primary flex items-center gap-sm font-semibold">
          <span className="material-symbols-outlined">analytics</span>
          GANpaint
        </h1>
        <p className="text-label-sm text-on-surface-variant mt-xs">Semantic Unit Editing</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-base">
        <div className="mb-lg">
          <span className="text-label-bold font-semibold text-secondary uppercase tracking-wider block mb-base">
            Semantic Brushes
          </span>
          <div className="space-y-xs">
            {units.map((u) => {
              const active = activeUnit?.unit === u.unit;
              return (
                <button
                  key={u.unit}
                  onClick={() => onSelectUnit(u)}
                  className={`w-full text-left px-base py-md flex items-center justify-between hover:bg-surface-variant transition-colors group ${
                    active ? 'brush-active' : ''
                  }`}
                >
                  <span className="text-label-bold font-semibold uppercase">{cleanLabel(u.label)}</span>
                  <span
                    className={`text-label-sm font-code opacity-70 ${
                      active ? '' : 'text-on-surface-variant'
                    }`}
                  >
                    Unit {String(u.unit).padStart(3, '0')} &middot; {Math.round(u.iou * 100)}%
                  </span>
                </button>
              );
            })}
            {units.length === 0 && (
              <div className="text-label-sm text-on-surface-variant px-base py-md">Loading units&hellip;</div>
            )}
          </div>
        </div>

        <div className="pt-lg border-t border-outline-variant">
          <span className="text-label-bold font-semibold text-secondary uppercase tracking-wider block mb-base">
            Controls
          </span>
          <div className="space-y-lg">
            <div>
              <div className="flex justify-between mb-sm">
                <span className="text-label-sm">BRUSH RADIUS</span>
                <span className="text-label-sm font-code">{brushRadius}px</span>
              </div>
              <input
                className="w-full"
                max={80}
                min={20}
                type="range"
                value={brushRadius}
                onChange={(e) => onBrushRadius(+e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <button
                disabled={!canUndo}
                onClick={onUndo}
                className="w-full py-sm border border-outline text-on-surface text-label-bold font-semibold hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
              >
                UNDO
              </button>
              <button
                onClick={onReset}
                className="w-full py-sm border border-outline text-on-surface text-label-bold font-semibold hover:bg-surface-variant"
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-base border-t border-outline-variant bg-surface-container-low">
        <a
          className="text-primary text-label-sm flex items-center gap-xs hover:underline"
          href="https://gandissect.csail.mit.edu"
          target="_blank"
          rel="noreferrer"
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          Methodology: MIT-IBM Lab
        </a>
      </div>
    </aside>
  );
}
