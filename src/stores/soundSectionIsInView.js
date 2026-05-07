import { writable, derived } from 'svelte/store';

const soundSectionCount = writable(0);

export const soundSectionIsInView = derived(soundSectionCount, ($count) => $count > 0);

export function enterSoundSection() {
  soundSectionCount.update((n) => n + 1);
}

export function leaveSoundSection() {
  soundSectionCount.update((n) => Math.max(0, n - 1));
}
