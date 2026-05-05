import { writable } from 'svelte/store';

/** True while the EpisodeControls bar (catalog section header) is in the viewport. */
export const isAtCatalog = writable(false);
