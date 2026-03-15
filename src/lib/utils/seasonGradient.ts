import { seasons } from '$lib/data/seasons';

export const seasonGradient = `linear-gradient(135deg, ${seasons.map((s) => s.accessibleOverDarkColor).join(', ')})`;
