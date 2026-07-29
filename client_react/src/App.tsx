import { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import PaintCanvas from './components/PaintCanvas';
import {
  fetchAllProjects,
  fetchUnits,
  generateImage,
  generateThumbnails,
  type Unit,
  type Stroke,
} from './api';

const THUMB_COUNT = 9;
const BRUSH_PALETTE = ['tree', 'grass', 'door', 'sky', 'cloud', 'brick', 'dome'];

function cleanLabel(raw: string) {
  return (raw || '').replace(/-[a-z]$/, '');
}

function curateBrushes(units: Unit[]): Unit[] {
  const byLabel = new Map<string, Unit>();
  for (const u of units) {
    const key = cleanLabel(u.label);
    if (!key || key === '(uninterpretable)') continue;
    const existing = byLabel.get(key);
    if (!existing || u.iou > existing.iou) byLabel.set(key, u);
  }
  return BRUSH_PALETTE.map((label) => byLabel.get(label)).filter((u): u is Unit => !!u);
}

function randomIds(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 5000));
}

export default function App() {
  const [project, setProject] = useState<string | null>(null);
  const [layer, setLayer] = useState<string | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [mode, setMode] = useState<'draw' | 'remove'>('draw');
  // layer4's feature grid is 8x8 over a 256px image (32px/cell) -- keep the
  // brush at least that big so a stroke reliably covers a full cell.
  const [brushRadius, setBrushRadius] = useState(32);

  const [thumbnails, setThumbnails] = useState<{ id: number; url: string }[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genToken = useRef(0);

  const regenerate = useCallback(
    async (id: number, strokeList: Stroke[]) => {
      if (!project) return;
      const token = ++genToken.current;
      setLoading(true);
      try {
        const url = await generateImage(project, id, strokeList);
        if (token === genToken.current) setImageUrl(url);
      } catch (e: any) {
        setError(e.message);
      } finally {
        if (token === genToken.current) setLoading(false);
      }
    },
    [project]
  );

  // Bootstrap: project -> layer -> units
  useEffect(() => {
    fetchAllProjects()
      .then((projects) => {
        if (!projects.length) throw new Error('No dissected projects found on the server.');
        setProject(projects[0].project);
        setLayer(projects[0].info.layers[0]);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!project || !layer) return;
    fetchUnits(project, layer)
      .then((all) => {
        const brushes = curateBrushes(all);
        setUnits(brushes);
        setActiveUnit(brushes[0] ?? null);
      })
      .catch((e) => setError(e.message));
  }, [project, layer]);

  // Load a fresh thumbnail set once we know the project
  const shuffleThumbnails = useCallback(() => {
    if (!project) return;
    const ids = randomIds(THUMB_COUNT);
    generateThumbnails(project, ids)
      .then((urls) => {
        const thumbs = ids.map((id, i) => ({ id, url: urls[i] }));
        setThumbnails(thumbs);
        setCurrentId(thumbs[0].id);
        setStrokes([]);
        regenerate(thumbs[0].id, []);
      })
      .catch((e) => setError(e.message));
  }, [project, regenerate]);

  useEffect(() => {
    if (project) shuffleThumbnails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const selectThumbnail = (id: number) => {
    setCurrentId(id);
    setStrokes([]);
    regenerate(id, []);
  };

  const handleStroke = (maskDataUrl: string) => {
    if (!activeUnit || currentId === null) return;
    const stroke: Stroke = {
      ablations: [
        {
          layer: layer!,
          unit: activeUnit.unit,
          alpha: 1,
          value: mode === 'remove' ? 0 : activeUnit.level,
        },
      ],
      mask: { bitstring: maskDataUrl },
    };
    const next = [...strokes, stroke];
    setStrokes(next);
    regenerate(currentId, next);
  };

  const undo = () => {
    if (!strokes.length || currentId === null) return;
    const next = strokes.slice(0, -1);
    setStrokes(next);
    regenerate(currentId, next);
  };

  const reset = () => {
    if (currentId === null) return;
    setStrokes([]);
    regenerate(currentId, []);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        units={units}
        activeUnit={activeUnit}
        onSelectUnit={setActiveUnit}
        brushRadius={brushRadius}
        onBrushRadius={setBrushRadius}
        onUndo={undo}
        onReset={reset}
        canUndo={strokes.length > 0}
      />

      <main className="flex-1 h-full flex flex-col bg-surface-container-low overflow-hidden">
        <section className="flex-1 p-xl flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-lg">
            <div className="bg-surface border border-outline-variant p-base">
              <div className="flex items-center justify-between mb-base">
                <div className="flex items-center gap-base">
                  <span className="material-symbols-outlined text-primary">brush</span>
                  <span className="text-label-bold font-semibold">
                    CURRENT LAYER: {layer ? layer.toUpperCase() : '—'}
                    {activeUnit ? ` · ${cleanLabel(activeUnit.label).toUpperCase()}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-sm">
                  <button
                    onClick={() => setMode('draw')}
                    className={`px-base py-1 border text-label-bold font-semibold ${
                      mode === 'draw'
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    DRAW
                  </button>
                  <button
                    onClick={() => setMode('remove')}
                    className={`px-base py-1 border text-label-bold font-semibold ${
                      mode === 'remove'
                        ? 'border-remove bg-remove text-on-primary'
                        : 'border-outline text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    REMOVE
                  </button>
                </div>
              </div>

              <PaintCanvas
                imageUrl={imageUrl}
                loading={loading}
                brushRadius={brushRadius}
                disabled={!activeUnit || currentId === null}
                onStrokeComplete={handleStroke}
              />

              <div className="mt-base flex justify-center gap-xl text-on-surface-variant italic text-center text-body-sm">
                {error
                  ? <span className="text-error not-italic">{error}</span>
                  : '"#GANpaint draws with object-level control using a deep network. Each brush activates a set of neurons in a GAN."'}
              </div>
            </div>
          </div>
        </section>

        <Gallery
          thumbnails={thumbnails}
          activeId={currentId}
          onSelect={selectThumbnail}
          onShuffle={shuffleThumbnails}
        />
      </main>
    </div>
  );
}
