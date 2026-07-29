export const API = 'http://localhost:5001';

export type Project = {
  project: string;
  info: { layers: string[] };
};

export type Unit = {
  unit: number;
  img: string;
  label: string;
  iou: number;
  level: number;
};

export type Ablation = {
  layer: string;
  unit: number;
  alpha: number;
  value: number;
};

export type MaskRecord = {
  bitstring: string; // data:image/png;base64,...
  shape?: [number, number];
};

export type Stroke = {
  ablations: Ablation[];
  mask: MaskRecord;
};

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(API + path, opts);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${path} -> ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

export function fetchAllProjects(): Promise<Project[]> {
  return api('/api/all_projects');
}

export async function fetchUnits(project: string, layer: string): Promise<Unit[]> {
  const [unitsRes, rankRes, levelsRes] = await Promise.all([
    api<{ res: { unit: number; img: string; label: string }[] }>(
      `/api/units?project=${project}&layer=${layer}`
    ),
    api<{ res: { name: string; scores: number[] }[] }>(
      `/api/rankings?project=${project}&layer=${layer}`
    ),
    api<{ res: number[][] }>(
      `/api/levels?project=${project}&layer=${layer}&quantiles=0.99`
    ),
  ]);

  const iouRanking = rankRes.res.find((r) => r.name === 'max iou');
  const iouScores = iouRanking ? iouRanking.scores : [];
  const levels = levelsRes.res.map((l) => l[0]);

  return unitsRes.res.map((u, i) => ({
    unit: u.unit,
    img: API + u.img,
    label: u.label,
    iou: iouScores[i] ?? 0,
    // Raw p99 activation is often too weak to produce a visible change
    // when forced over just a brush-sized region; amplify for a visible "draw".
    level: (levels[i] ?? 1) * 2,
  }));
}

export async function generateImage(
  project: string,
  id: number,
  strokes: Stroke[]
): Promise<string> {
  const body: any = { project, ids: [id], return_urls: true };
  if (strokes.length) {
    body.interventions = strokes.map((s) => ({ ablations: s.ablations, mask: s.mask }));
  }
  const result = await api<{ res: { d: string }[] }>('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return API + result.res[0].d;
}

export async function generateThumbnails(project: string, ids: number[]): Promise<string[]> {
  const result = await api<{ res: { d: string }[] }>('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, ids, return_urls: true }),
  });
  return result.res.map((r) => API + r.d);
}
