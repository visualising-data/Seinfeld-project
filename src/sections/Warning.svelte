<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);
  import { navBarColor } from '../stores/navbarColor';

  let ctx: gsap.Context;

  onMount(() => {
    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      const buildAnimation = (isMobile: boolean) => {
        // On mobile/tablet, delay exit to 0.65 so there's dwell time to read the text
        // before the images leave and the white background fades in
        const exitStart = isMobile ? 0.65 : 0.5;
        const tl = gsap.timeline({ defaults: { ease: 'none' } });
        tl
          // Entry: coffee from left, couch from right; labels fade+slide up simultaneously
          .from('#warning-coffee-bg', { xPercent: -110 }, 0)
          .from('#warning-couch-bg', { xPercent: 110 }, 0)
          .from('.warning-label', { opacity: 0, y: 30, duration: 0.2 }, 0)
          // Exit: coffee exits right, couch exits left
          .to('#warning-coffee-bg', { xPercent: 110, duration: isMobile ? 0.3 : 0.5 }, exitStart)
          .to(
            '#warning-couch-bg',
            { xPercent: isMobile ? -350 : -350, duration: isMobile ? 0.25 : 0.5 },
            exitStart,
          );

        ScrollTrigger.create({
          trigger: '.warning-wrapper',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1.5,
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: (self: { progress: number }) => {
            navBarColor.set(self.progress >= 0.9 ? 'pink' : 'white');
          },
        });
      };

      mm.add('(max-width: 767px)', () => buildAnimation(true));
      mm.add('(min-width: 768px)', () => buildAnimation(false));
    });
  });

  onDestroy(() => ctx?.revert());
</script>

<!-- Outer wrapper: sticky inner + scroll spacer provide entry and exit scroll distance -->
<div class="warning-wrapper relative" style="background: #12020A;">
  <div
    id="warning"
    class="sticky top-0 h-dvh overflow-hidden flex flex-col justify-between py-16 text-white"
    style="z-index: 5;"
  >
    <!-- Background: huge illustrations -->
    <div class="absolute inset-0 flex pointer-events-none">
      <div
        id="warning-coffee-bg"
        class="relative z-[1] w-1/2 h-full flex items-start justify-end pr-8 pt-8"
      >
        <img
          src="https://amdufour.github.io/hosted-data/apis/illustrations/coffee_cup.png"
          alt=""
          loading="lazy"
          class="h-[40%] w-auto mt-40 object-contain coffee-rotate"
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
    <div
      class="warning-text-item relative z-10 container grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
    >
      <div class="warning-label">Grab a coffee</div>
      <div class="warning-label">Take a seat</div>
    </div>

    <!-- Bottom: full-width text over 2 lines -->
    <div
      class="warning-text-item relative text-center z-10 w-full px-2 leading-[0.85] warning-end-text"
    >
      <div>We have a lot</div>
      <div>to get through!</div>
    </div>
  </div>

  <!-- Scroll spacer: gives the exit animation its scroll distance -->
  <div class="h-dvh"></div>
</div>

<style>
  .warning-label {
    font-size: clamp(1.5rem, 3.5vw, 3rem);
    font-weight: 600;
  }
  .warning-end-text {
    font-size: 11.5vw;
    font-weight: 700;
  }
  .coffee-rotate {
    transform: rotate(30deg);
  }
</style>
