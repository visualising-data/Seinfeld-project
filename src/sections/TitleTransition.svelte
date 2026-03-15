<script>
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { seasonGradient as gradient } from '$lib/utils/seasonGradient';

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl
        .to('#tt-text', { scale: 14, ease: 'power2.in' })
        .to('#tt-bg', { opacity: 1, duration: 0.25 }, '-=0.2')
        .to('#tt-text', { opacity: 0, duration: 0.15 }, '-=0.15');

      ScrollTrigger.create({
        trigger: '#title-transition',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
      });
    });
  });

  onDestroy(() => ctx?.revert());
</script>

<!-- Gradient extends to cover the slot content (Warning) below -->
<div id="title-transition" class="relative" style="background: {gradient}">
  <div class="sticky top-0 h-[100dvh] overflow-hidden flex items-center justify-center bg-black">
    <!-- Gradient fill that reveals at end of zoom -->
    <div id="tt-bg" class="absolute inset-0 opacity-0" style="background: {gradient}"></div>
    <!-- Seinfeld text: gradient-colored, zooms in on scroll -->
    <div
      id="tt-text"
      class="tt-seinfeld relative z-10"
      style="background: {gradient}; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
    >
      Seinfeld
    </div>
  </div>
  <!-- Scroll spacer: provides the scroll distance for the zoom animation -->
  <div class="h-[400vh]"></div>
  <!-- Slot: content (e.g. Warning) scrolls over the gradient background -->
  <slot />
</div>

<style>
  .tt-seinfeld {
    font-size: 18vw;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
  }
</style>
