/** Biographical depth stubs — chapters, turning points, taste atlas. */

export type Chapter = {
  id: string;
  title: string;
  era: string;
  body: string;
  privateDefault: boolean;
};

export type TurningPoint = {
  id: string;
  label: string;
  when: string;
  evidenceIds: string[];
  factIds: string[];
};

export type TasteEntry = {
  id: string;
  domain: string;
  signature: string;
};

export type BioLayers = {
  chapters: Chapter[];
  turning_points: TurningPoint[];
  taste_atlas: TasteEntry[];
};

const KEY = "sc.bio.layers";

export function emptyLayers(): BioLayers {
  return { chapters: [], turning_points: [], taste_atlas: [] };
}

export function stubLayers(): BioLayers {
  return {
    chapters: [
      {
        id: "ch_early",
        title: "Early years",
        era: "formative",
        body: "Stub chapter — edit freely.",
        privateDefault: false,
      },
    ],
    turning_points: [
      {
        id: "tp_1",
        label: "Chose a new path",
        when: "",
        evidenceIds: [],
        factIds: [],
      },
    ],
    taste_atlas: [
      {
        id: "taste_1",
        domain: "music",
        signature: "Late-night albums, lyrics-first",
      },
    ],
  };
}

export function loadLayers(): BioLayers {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return stubLayers();
    const parsed = JSON.parse(raw) as BioLayers;
    return {
      chapters: parsed.chapters ?? [],
      turning_points: parsed.turning_points ?? [],
      taste_atlas: parsed.taste_atlas ?? [],
    };
  } catch {
    return stubLayers();
  }
}

export function saveLayers(layers: BioLayers): void {
  localStorage.setItem(KEY, JSON.stringify(layers));
}

export function addChapter(layers: BioLayers, chapter: Chapter): BioLayers {
  return { ...layers, chapters: [...layers.chapters, chapter] };
}

export function addTurningPoint(layers: BioLayers, tp: TurningPoint): BioLayers {
  return { ...layers, turning_points: [...layers.turning_points, tp] };
}

export function addTaste(layers: BioLayers, entry: TasteEntry): BioLayers {
  return { ...layers, taste_atlas: [...layers.taste_atlas, entry] };
}
