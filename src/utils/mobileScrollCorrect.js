const SECTION_IDS = [
  'data-gathering',
  'lead-chars',
  'supporting-chars',
  'locations',
  'laughs-exploration',
  'methodology',
];

/**
 * On mobile: records the viewport-relative position of the section element nearest
 * to the viewport top. Pass the returned anchor to restoreMobileScrollAnchor after
 * mounting new content — if iOS Chrome failed to scroll-anchor, the drift is corrected.
 * Returns null on desktop (no correction needed).
 */
export function captureMobileScrollAnchor() {
  if (!window.matchMedia('(max-width: 1023px)').matches) return null;
  let best = null;
  let bestDist = Infinity;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    const dist = Math.abs(top);
    if (dist < bestDist) {
      bestDist = dist;
      best = { el, top };
    }
  }
  return best;
}

/**
 * After mounting new content above the viewport, corrects scroll position if
 * iOS Chrome's scroll anchoring failed to compensate for the layout shift.
 * Safe to call even if scroll anchoring worked — drift will be ~0, no correction fires.
 */
export function restoreMobileScrollAnchor(anchor) {
  if (!anchor) return;
  requestAnimationFrame(() => {
    const drift = anchor.el.getBoundingClientRect().top - anchor.top;
    if (Math.abs(drift) > 20) {
      window.scrollTo({ top: window.scrollY + drift, behavior: 'instant' });
    }
  });
}
