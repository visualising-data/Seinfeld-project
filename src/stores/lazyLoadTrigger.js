import { writable } from 'svelte/store';

/** When set to true, +page.svelte loads all lazy sections immediately
 *  (used by MainMenu and SectionProgressBar to handle deep-link navigation
 *  before sections have been scrolled into view). */
export const lazyLoadAll = writable(false);
