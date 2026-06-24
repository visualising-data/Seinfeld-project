const SECTION_IDS = [
  'data-gathering',
  'lead-chars',
  'supporting-chars',
  'locations',
  'laughs-exploration',
  'methodology',
];

/**
 * On mobile: records the document-relative position (BCR.top + scrollY) of the
 * section element nearest to the viewport top. Document-relative position is immune
 * to user scrolling between capture and restore, unlike viewport-relative BCR.top.
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
      best = { el, docTop: top + window.scrollY };
    }
  }
  return best;
}

/**
 * After mounting new content above the viewport, corrects scroll position if
 * iOS Chrome's scroll anchoring failed to compensate for the layout shift.
 * Only corrects positive drift (anchor pushed down = content inserted above).
 * Negative drift (anchor moved up = content below) is never corrected.
 */
export function restoreMobileScrollAnchor(anchor) {
  if (!anchor) return;
  requestAnimationFrame(() => {
    const newDocTop = anchor.el.getBoundingClientRect().top + window.scrollY;
    const drift = newDocTop - anchor.docTop;
    // Only correct if content was inserted above (pushes anchor down in document)
    if (drift > 20) {
      window.scrollTo({ top: window.scrollY + drift, behavior: 'instant' });
    }
  });
}
