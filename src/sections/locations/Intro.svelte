<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import Lenis from 'lenis';
  import LocationsScreen3 from './LocationsScreen3.svelte';

  /** @type {gsap.MatchMedia | undefined} */
  let mm;

  onMount(() => {
    gsap.set('#locations p', { translateY: 100, opacity: 0 });

    // Text reveals — no pin/scrub, safe on all devices
    const tl1 = gsap.timeline({ scrollTrigger: { trigger: '#locations_screen_1', start: 'top center' } });
    tl1
      .to('#locations_screen_1 p', { translateY: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: { each: 0.3 } })
      .to('#locations_screen_1 .highlight', { webkitTextFillColor: 'transparent', backgroundPosition: '200% center', duration: 2, delay: 1, ease: 'power3.out' }, '<-0.5');

    const tl2 = gsap.timeline({ scrollTrigger: { trigger: '#locations_screen_2', start: 'top top<20%' } });
    tl2
      .to('#locations_screen_2 p', { translateY: 0, opacity: 1, duration: 1, ease: 'power3.out' })
      .to('#locations_screen_2 .highlight', { webkitTextFillColor: 'transparent', backgroundPosition: '200% center', duration: 2, delay: 1, ease: 'power3.out' }, '<-0.5');

    // Lenis smooth scroll — desktop only (conflicts with iOS native momentum scroll)
    mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const lenis = new Lenis();
      let rafId = 0;
      /** @param {number} time */
      function raf(time) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
      rafId = requestAnimationFrame(raf);
      return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
    });
  });

  onDestroy(() => { mm?.revert(); });
</script>

<div id="locations" class="bg-black text-white">
  <!-- Screen 1 -->
  <div id="locations_screen_1" class="md:h-[100dvh] w-screen py-60 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 h-auto lg:h-[100dvh] flex flex-col justify-center">
          <p>
            After examining the use of lead and supporting characters - <span class="highlight"
              >the who</span
            >
            of the show - the next dimension that has an influence on the texture of a sitcom relates
            to the scene locations - <span class="highlight">the where</span> of the show.
          </p>
          <p>
            Classifying locations concerns defining the characteristics and use of different
            settings as the physical backdrop to each scene. Sometimes scenes were set indoors,
            sometimes outdoors: sometimes scenes were shot in a studio, sometimes they were shot on
            location.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 2 -->
  <div id="locations_screen_2" class="md:h-[100dvh] w-screen py-30 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 md:h-[100dvh] flex flex-col justify-center">
          <p>
            Just as the list of characters grew, so too did the spatial ambitions of the storylines.
            Once the show became a fixture in NBC's Fall schedule, from Season Three onwards, it
            gained a significant production budget increase.
          </p>
          <p>
            As Jennifer Keishin Armstrong noted in <a
              href="https://jenniferkarmstrong.com/books/seinfeldia/"
              target="_blank">her book</a
            >, S3E6 "The Parking Garage" marked the first episode in which an outside custom set,
            away from a studio audience, was built and used. This began a pattern of filming
            on-location and off-set that gradually expanded the physicality of the Seinfeld
            universe.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 3 -->
  <LocationsScreen3 />
</div>
