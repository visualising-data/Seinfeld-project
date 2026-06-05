<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { characters } from '$lib/data/characters';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';

  const supportingChars = characters.slice(4, characters.length - 1);

  const mobileRows = [
    supportingChars.slice(0, 3),
    supportingChars.slice(3, 6),
    supportingChars.slice(6),
  ];
  const mobileRowSpeeds = [0.5, 1.5, 3];

  onMount(() => {
    gsap.set('#supporting_chars_screen_3 .supporting-char', { translateY: 100, opacity: 0 });

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#supporting_chars_screen_3',
        start: 'top center',
      },
      onComplete: () => {
        gsap.utils.toArray('#supporting_chars_screen_3 .supporting-char').forEach((el) => {
          gsap.to(el, {
            y: -(Math.random() * 3 + 3),
            duration: 2.5 + Math.random() * 1.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 2,
          });
        });
      },
    });
    tl3
      .to('#supporting_chars_screen_3 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 },
      })
      .to(
        '#supporting_chars_screen_3 .highlight',
        {
          webkitTextFillColor: 'transparent',
          backgroundPosition: '200% center',
          duration: 2,
          delay: 1,
          ease: 'power3.out',
        },
        '<-0.5',
      )
      .to(
        '#supporting_chars_screen_3 .supporting-char',
        {
          translateY: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          stagger: { each: 0.2, from: 'random' },
        },
        '<-0.5',
      );

    const mm = gsap.matchMedia();

    // Mobile/tablet: pin text, parallax on rows
    mm.add('(max-width: 1023px)', () => {
      ScrollTrigger.create({
        trigger: '#supporting_chars_screen_3',
        start: 'top top',
        end: 'bottom top',
        pin: '#supporting-chars-3-text',
      });

      /** @type {HTMLElement[]} */
      const mobileRowEls = gsap.utils.toArray('.mobile-char-row');
      mobileRowEls.forEach((el) => {
        gsap.to(el, {
          yPercent: Number(el.dataset.speed) * 50,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', scrub: true },
        });
      });
    });

    // Desktop: pin text, parallax on individual chars
    mm.add('(min-width: 1024px)', () => {
      ScrollTrigger.create({
        trigger: '#supporting_chars_screen_3',
        start: 'top top',
        end: 'bottom top',
        pin: '#supporting-chars-3-text',
      });

      /** @type {HTMLElement[]} */
      const parallaxEls = gsap.utils.toArray('.desktop-char-parallax');
      parallaxEls.forEach((el) => {
        gsap.to(el, {
          yPercent: Number(el.dataset.speed) * 50,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', scrub: true },
        });
      });
    });

    return () => {
      tl3.scrollTrigger?.kill();
      tl3.kill();
      mm.revert();
    };
  });
</script>

<div id="supporting_chars_screen_3" class="w-screen relative">
  <div class="container">
    <div class="grid grid-cols-12 lg:gap-20">
      <div
        id="supporting-chars-3-text"
        class="supporting-chars-text-col col-span-12 lg:col-span-7 h-[100dvh] flex flex-col justify-center"
      >
        <p>
          The ultimate decision was to create categories for the four respective <span
            class="color color-family">families of the lead characters</span
          >, as well as groupings for acquaintances - specifically,
          <span class="color color-acquaintance">love interests</span>,
          <span class="color color-acquaintance">friends</span>,
          <span class="color color-acquaintance">neighbours</span>,
          <span class="color color-acquaintance">colleagues</span> - and then a final
          <span class="color color-other">other persons</span>
          group to sweep up the growing list of transient characters.
        </p>
        <p>
          When recording the involvement of supporting characters, it was <span class="highlight"
            >their central purpose in that episode</span
          > that informed their grouping, e.g. a friend of Elaine's who dates George would be considered
          a love interest, rather than a friend. Some supporting characters were therefore alternated
          into different groupings across the show (e.g. a former love interest may shift to become a
          friend, and vice-versa).
        </p>
      </div>
    </div>
  </div>

  <!-- Mobile/tablet characters — 3 rows of 3, parallax per row -->
  <div class="absolute block lg:hidden w-full" style="height: 800px; top: 100dvh;">
    <div class="h-full flex flex-col justify-center gap-20 px-6">
      {#each mobileRows as row, rowIndex}
        <div class="mobile-char-row flex justify-around" data-speed={mobileRowSpeeds[rowIndex]}>
          {#each row as char, i}
            <div
              class="supporting-char flex flex-col items-center"
              style="position: relative; top: {i % 2 === 0 ? '0' : '30px'};"
            >
              <div
                class="character rounded-full bg-contain bg-center"
                style="background-image: url('{getCharacterImagePath(
                  char.id,
                )}'); width: 60px; height: 60px;"
              ></div>
              <div class="mid pt-1 text-center text-sm">{char.label}</div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <!-- Desktop characters — single row, parallax per char -->
  <div
    class="container absolute hidden lg:block"
    style="height: 1400px; top: 100vh; left: 0; right: 0;"
  >
    <div class="grid grid-cols-12 gap-4">
      <div class="lg:col-span-1"></div>
      <div class="col-span-12 lg:col-span-11 h-[100dvh] flex flex-col justify-center">
        <ul class="flex justify-between">
          {#each supportingChars as char, i}
            <li class="my-2">
              <div
                class="desktop-char-parallax relative flex flex-col items-center"
                style="top: {i % 2 === 0 ? '0' : '160px'};"
                data-speed={i % 2 === 0 ? 3 : 0.5}
              >
                <div class="supporting-char flex flex-col items-center">
                  <div
                    class="character rounded-full bg-contain bg-center shadow-md w-[75px] h-[75px] lg:w-[100px] lg:h-[100px]"
                    style="background-image: url('{getCharacterImagePath(char.id)}');"
                  ></div>
                  <div class="mid pt-2 text-center">{char.label}</div>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  #supporting_chars_screen_3 {
    padding-bottom: 100vh;
  }

  .color {
    font-weight: 600;
  }
  .color-family {
    color: #835330;
  }
  .color-acquaintance {
    color: #b3478b;
  }
  .color-other {
    color: #5443b0;
  }
</style>
