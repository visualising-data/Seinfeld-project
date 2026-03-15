<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  let ctx: gsap.Context;

  onMount(() => {
    ctx = gsap.context(() => {
      // Single timeline covers entry (0→0.5) and exit (0.5→1)
      // Trigger spans the full wrapper: top bottom → bottom top
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl
        // Entry: coffee from left, couch from right
        .from('#warning-coffee-bg', { xPercent: -110 }, 0)
        .from('#warning-couch-bg', { xPercent: 110 }, 0)
        // Exit: coffee exits right, couch exits left
        .to('#warning-coffee-bg', { xPercent: 110 }, 0.5)
        .to('#warning-couch-bg', { xPercent: -110 }, 0.5)
        // Text fades out after images are gone
        .to('.warning-text-item', { opacity: 0, duration: 0.1 }, 0.8)
        // Background reveals #F9F5F7
        .to('#warning-bg-fill', { opacity: 1, duration: 0.1 }, 0.9);

      ScrollTrigger.create({
        trigger: '.warning-wrapper',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1.5,
        animation: tl,
        invalidateOnRefresh: true,
      });
    });
  });

  onDestroy(() => ctx?.revert());
</script>

<!-- Outer wrapper: sticky inner + scroll spacer provide entry and exit scroll distance -->
<div class="warning-wrapper relative">
  <div
    id="warning"
    class="sticky top-0 h-dvh overflow-hidden flex flex-col justify-between py-16 text-black"
  >
    <!-- Background: huge illustrations -->
    <div class="absolute inset-0 flex pointer-events-none">
      <div id="warning-coffee-bg" class="relative z-[1] w-1/2 h-full flex items-start justify-end pr-8 pt-8">
        <img
          src="https://amdufour.github.io/hosted-data/apis/illustrations/coffee_cup.png"
          alt=""
          loading="lazy"
          class="h-[60%] w-auto object-contain coffee-rotate"
        />
      </div>
      <div id="warning-couch-bg" class="w-1/2 h-full flex items-center justify-start pl-4">
        <img
          src="https://amdufour.github.io/hosted-data/apis/illustrations/couch.png"
          alt=""
          loading="lazy"
          class="h-[55vh] w-auto max-w-none"
        />
      </div>
    </div>

    <!-- Background fill for exit transition to #F9F5F7 -->
    <div
      id="warning-bg-fill"
      class="absolute inset-0 opacity-0 pointer-events-none"
      style="background: #F9F5F7; z-index: 5;"
    ></div>

    <!-- Top: 2 column labels -->
    <div class="warning-text-item relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-0 w-full px-8 md:px-16 mt-12">
      <div class="warning-label">Grab a coffee</div>
      <div class="warning-label">Take a seat</div>
    </div>

    <!-- Bottom: full-width text over 2 lines -->
    <div class="warning-text-item relative text-center z-10 w-full px-2 leading-[0.85] warning-end-text">
      <div>We have a lot</div>
      <div>to get through!</div>
    </div>
  </div>

  <!-- Scroll spacer: gives the exit animation its scroll distance -->
  <div class="h-dvh"></div>
</div>

<style>
  .warning-label {
    font-size: clamp(1.5rem, 3.5vw, 3.2rem);
  }
  .warning-end-text {
    font-size: 11.5vw;
    font-weight: 700;
  }
  .coffee-rotate {
    transform: rotate(30deg);
  }
</style>
