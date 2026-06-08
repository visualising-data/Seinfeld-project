<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import Lenis from 'lenis';
  import SupportingCharsScreen3 from './SupportingCharsScreen3.svelte';

  gsap.registerPlugin(ScrollTrigger);

  const screen1 = '#supporting_chars_screen_1';
  const screen2 = '#supporting_chars_screen_2';

  /** @type {gsap.MatchMedia | undefined} */
  let mm;

  onMount(() => {
    gsap.set('#supporting_chars p', { translateY: 100, opacity: 0 });

    // Text reveals — no pin/scrub, safe on all devices
    const tl1 = gsap.timeline({ scrollTrigger: { trigger: screen1, start: 'top center' } });
    tl1
      .to(`${screen1} p`, { translateY: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: { each: 0.3 } })
      .to(`${screen1} .highlight`, { webkitTextFillColor: 'transparent', backgroundPosition: '200% center', duration: 2, delay: 1, ease: 'power3.out' }, '<-0.5');

    const tl2 = gsap.timeline({ scrollTrigger: { trigger: screen2, start: 'top top<20%' } });
    tl2
      .to(`${screen2} p`, { translateY: 0, opacity: 1, duration: 1, ease: 'power3.out' })
      .to(`${screen2} .highlight`, { webkitTextFillColor: 'transparent', backgroundPosition: '200% center', duration: 2, delay: 1, ease: 'power3.out' }, '<-0.5');

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

<div id="supporting_chars" class="bg-black text-white">
  <!-- Screen 1 -->
  <div id="supporting_chars_screen_1" class="md:h-[100dvh] w-screen py-60 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 h-auto lg:h-[100dvh] flex flex-col justify-center">
          <p>
            As a show grows, it is inevitable that so does the universe of different characters. And
            as the list of potential characters grows, so too does the temptation to use them more
            to deliver the storylines.
          </p>
          <p>
            <span class="highlight">Supporting characters</span> come and go but will appear quite frequently,
            are quite popular, and are usually played by the same actors for continuity. Transient characters
            tend to appear just once, are often unnamed, and primarily exist to help progress a single
            strand of an episode story.
          </p>
          <p>
            In any sitcom, you will have permanent lead characters, supporting or recurring
            characters, and transient characters. At the start of the data-gathering exercise, it
            wasn't necessarily obvious how to best categorise and distinguish those non-lead
            characters.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 2 -->
  <div id="supporting_chars_screen_2" class="md:h-[100dvh] w-screen py-30 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 md:h-[100dvh] flex flex-col justify-center">
          <p>
            The main struggle was to strike a balance between creating enough distinct character
            categories, with sufficient individuality for those who warrant it, but not carving out
            too many that the list becomes excessive. For instance, recurring characters like Jerry
            and Kramer's neighbour, <span class="highlight">Newman</span>, or Elaine's boss,
            <span class="highlight">J. Peterman</span>, have a cult following that made it tempting
            to mark them out as distinct individual characters.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 3 -->
  <SupportingCharsScreen3 />
</div>
