const LIST_ITEM_MAX = 80;

/** Strip employer, location, and long explanatory tails from a raw role string. */
export function stripOccupationClause(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  s = s.replace(/\*\*/g, "");
  s = s.replace(/\s+(?:at|for|with|operating in|since)\s+.+$/i, "");
  s = s.replace(/\s*[—–]\s*.+$/u, "");
  s = s.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  s = s.replace(/^professional\s+driver\b/i, "Race car driver");
  s = s.replace(/^professional\s+(photographer|model|actor)\b/i, "$1");
  s = s.replace(/^professional\s+(?!driver|photographer|model|actor)/i, "");
  s = s.replace(/^pr-based\s+/i, "");
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > LIST_ITEM_MAX) s = s.slice(0, LIST_ITEM_MAX - 1).trim();
  return s;
}

/** Split compound occupation strings on common joiners. */
export function splitOccupationCompound(raw: string): string[] {
  return raw
    .split(/\s*(?:;\s*|,\s*|\s*&\s*|\s+and\s+|\s*\/\s*)\s*/i)
    .map(stripOccupationClause)
    .filter(Boolean);
}

const CANONICAL_TITLES: [RegExp, string][] = [
  [/^photographer$/i, "Photographer"],
  [/^tour\s+guide$/i, "Tour guide"],
  [/^race\s+car\s+driver$|^professional\s+driver$|^racing\s+driver$|^drift\s+driver$|^driver$/i, "Race car driver"],
  [/^android\s+developer$/i, "Android developer"],
  [/^software\s+developer$/i, "Software developer"],
  [/^web\s+developer$/i, "Web developer"],
  [/^python\s+developer$/i, "Python developer"],
  [/^technical\s+writer$/i, "Technical writer"],
  [/^foss\s+contributor$|^open-?source\s+builder$|^foss\s+builder$/i, "FOSS contributor"],
  [/^business\s+owner$/i, "Business owner"],
  [/^crypto\s+(?:trader|developer)$|^cryptocurrency\s+developer$/i, "Crypto developer"],
  [/^amateur\s+radio(?:\s+operator|\s+enthusiast)?$|^radio\s+enthusiast$/i, "Amateur radio operator"],
  [/^ai\s+developer$|^ai\s+agent\s+developer$/i, "AI developer"],
  [/^filmmaker$|^film\s+maker$/i, "Filmmaker"],
  [/^freelancer$/i, "Freelancer"],
  [/^audio\s+editor$/i, "Audio editor"],
  [/^field\s+manager$/i, "Field manager"],
  [/^off-?roader$/i, "Off-roader"],
  [/^automotive\s+enthusiast$/i, "Automotive enthusiast"],
  [/^gamer$/i, "Gamer"],
  [/^fisher$|^angler$/i, "Fisher"],
  [/^parent$|^father$|^mother$/i, "Parent"],
  [/^diy\s+enthusiast$/i, "DIY enthusiast"],
  [/^maker$/i, "Maker"],
  [/^model(\s+actor|\s*\/\s*actor)?$/i, "Model"],
  [/^actor$/i, "Actor"],
  [/^teacher$/i, "Teacher"],
  [/^engineer$/i, "Engineer"],
  [/^writer$/i, "Writer"],
  [/^developer$/i, "Developer"],
];

export function canonicalizeTitle(title: string): string {
  const s = stripOccupationClause(title);
  if (!s) return "";
  for (const [re, canon] of CANONICAL_TITLES) {
    if (re.test(s)) return canon;
  }
  if (s.length <= 40) return s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

export function scanProseRoles(text: string, add: (title: string) => void): void {
  if (/photographer|photography/i.test(text)) add("Photographer");
  if (/tour\s+guide|provides\s+tours|ihprt|i\s+heart\s+pr\s+tours/i.test(text)) add("Tour guide");
  if (/race\s+car\s+driver|professional\s+driver|racing\s+team|formula\s+drift|\bdrift\b/i.test(text)) {
    add("Race car driver");
  }
  if (/android\s+developer|android\s*\(\s*kotlin\s*\)|android\s*\/\s*foss/i.test(text)) add("Android developer");
  if (/software\s+developer/i.test(text)) add("Software developer");
  if (/web\s+developer|three\.js|progressive\s+web\s+app|\bpwa\b/i.test(text)) add("Web developer");
  if (/python\s+developer|python[^.\n]{0,48}\bandroid\b|\bandroid\b[^.\n]{0,48}\bpython\b/i.test(text)) {
    add("Python developer");
  }
  if (/technical\s+writer/i.test(text)) add("Technical writer");
  if (/foss\s+contributor|open-?source\s+builder|foss\s+builder|foss\s+android/i.test(text)) {
    add("FOSS contributor");
  }
  if (/business\s+owner|subcontractor\s+hiring|llc\s+formation/i.test(text)) add("Business owner");
  if (/amateur\s+radio|gmrs|cb\s+radio|\bcb\b.*\btx\b|walkie-talkie/i.test(text)) add("Amateur radio operator");
  if (/crypto\s+trad|cryptocurrency|algorithmic\s+bot|freqtrade|octobot/i.test(text)) {
    add("Crypto developer");
  }
  if (/ai\s+agent|cursor\s+agent|agent-project-bootstrap/i.test(text)) add("AI developer");
  if (/filmmaker|4k\s+cinema|cinema\s+cam/i.test(text)) add("Filmmaker");
  if (/freelancer|upwork/i.test(text)) add("Freelancer");
  if (/audio\s+edit/i.test(text)) add("Audio editor");
  if (/field\s+manager/i.test(text)) add("Field manager");
  if (/off-?road|all-terrain\s+tire|vehicle\s+mod|roof\s+rack|transfer\s+case/i.test(text)) add("Off-roader");
  if (/vehicle\s+mainten|self-maintain|obd-ii|obdforge|head\s+unit|automotive/i.test(text)) {
    add("Automotive enthusiast");
  }
  if (/steam|gaming|achievement\s+collector|gamer/i.test(text)) add("Gamer");
  if (/shore\s+fishing|fishing\s+licen|\bfisher/i.test(text)) add("Fisher");
  if (/\bfather\b|\bmother\b|\bparent\b|expecting\s+baby/i.test(text)) add("Parent");
  if (/diy\s+repair|self-sufficiency|self-maintain/i.test(text)) add("DIY enthusiast");
  if (/model\s+actor|model\/actor/i.test(text)) {
    add("Model");
    add("Actor");
  } else {
    if (/\bprofessional\s+model\b|\bmodel\b/i.test(text) && !/modeling/i.test(text)) add("Model");
    if (/\bactor\b/i.test(text) && !/model\s+actor/i.test(text) && /imdb|film|screen\s+role|acting/i.test(text)) {
      add("Actor");
    }
  }
}
