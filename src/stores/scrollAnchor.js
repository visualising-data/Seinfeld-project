import { writable } from 'svelte/store';
/** @type {import('svelte/store').Writable<string | null>} */
export const pendingScrollAnchor = writable(null);
export const isScrollLoading = writable(false);
// Set to the anchor id while a menu-navigation scroll is in progress.
// Child sections check this after their own ScrollTrigger.refresh() calls to
// re-scroll to the anchor's updated position (pin spacer resizing can shift it).
/** @type {import('svelte/store').Writable<string | null>} */
export const navigationAnchor = writable(null);
