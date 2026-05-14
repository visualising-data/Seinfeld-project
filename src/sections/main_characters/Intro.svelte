<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import Lenis from 'lenis';
  import { characters } from '$lib/data/characters';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';

  const mainChars = characters.slice(0, 4);

  onMount(() => {
    gsap.set('#lead-chars-intro p', { translateY: 100, opacity: 0 });

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#lead-chars-intro',
        start: 'top top',
        end: 'bottom top',
        pin: '#lead-chars-intro-text-container',
      },
    });
    tl1
      .to('#lead-chars-intro p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 },
      })
      .to('#lead-chars-intro .color-jerry', {
        color: '#5FA8D3',
        duration: 1,
        ease: 'back.out(1.7)',
      })
      .to(
        '#lead-chars-intro .color-george',
        {
          color: '#EB6447',
          duration: 1,
          ease: 'back.out(1.7)',
        },
        '-=0.5',
      )
      .to(
        '#lead-chars-intro .color-elaine',
        {
          color: '#FBBA3A',
          duration: 1,
          ease: 'back.out(1.7)',
        },
        '-=0.8',
      )
      .to(
        '#lead-chars-intro .color-kramer',
        {
          color: '#83C8C3',
          duration: 1,
          ease: 'back.out(1.7)',
        },
        '-=0.9',
      )
      .to('#lead-chars-intro .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out',
        stagger: { each: 0.5 },
      });

    // Add parallax effect to characters
    /** @type {gsap.core.Tween[]} */
    const parallaxTweens = [];
    /** @type {HTMLElement[]} */
    const chars = gsap.utils.toArray('.lead-char-parallax');
    chars.forEach((char) => {
      parallaxTweens.push(
        gsap.to(char, {
          yPercent: Number(char.dataset.speed) * 50,
          ease: 'none',
          scrollTrigger: {
            trigger: char,
            start: 'top bottom',
            scrub: true,
          },
        }),
      );
    });

    // Smooth scroll — drive Lenis through GSAP's ticker so ScrollTrigger stays in sync
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      tl1.scrollTrigger?.kill();
      tl1.kill();
      parallaxTweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  });
</script>

<div id="lead-chars-intro" class="bg-black text-white relative" style="padding-bottom: 100vh;">
  <div class="container">
    <div class="grid grid-cols-12 gap-4">
      <div
        id="lead-chars-intro-text-container"
        class="col-span-12 md:col-span-7 h-[100dvh] flex flex-col justify-center"
      >
        <p>
          We begin with a look at the lead characters. It was no surprise to find the majority of
          screen-time was dominated by the four leading characters - <span class="color color-jerry"
            >Jerry</span
          >, <span class="color color-george">George</span>,
          <span class="color color-elaine">Elaine</span>, and
          <span class="color color-kramer">Kramer</span>. They were the stars who delivered most of
          the lines, acted out the stories, and ultimately caused the majority of the laughs.
        </p>
        <p>
          In this section we’ll explore how much these characters were used in scenes across each
          episode’s run-time - <span class="highlight">screen time</span> - how funny they were
          during those appearances - <span class="highlight">laughter rate</span> - and what
          proportion of the total laughs they caused in each episode -
          <span class="highlight">laughter share</span>.
        </p>
      </div>
    </div>

    <!-- Characters -->
    <div class="container absolute" style="height: 1400px; top: 100vh; left: 0; right: 0;">
      <div class="grid grid-cols-12 gap-4">
        <div class="md:col-span-1"></div>
        <div class="col-span-12 md:col-span-11 h-[100dvh] flex flex-col justify-center">
          <ul class="flex justify-between mt-4">
            {#each mainChars as char, i}
              <li class="my-2">
                <div
                  class="lead-char-parallax relative flex flex-col items-center"
                  style="top: {i % 2 === 0 ? 0 : '160px'};"
                  data-speed={i % 2 === 0 ? 3 : 0.5}
                >
                  <div
                    class="relative character rounded-full bg-contain bg-center shadow-md w-[60px] h-[60px] md:w-[100px] md:h-[100px]"
                    style="
                        background-image: url('{getCharacterImagePath(char.id)}');
                      "
                  ></div>
                  <div style="background-color: rgba(18, 2, 10, 0.8);">{char.label}</div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .color {
    font-weight: 600;
  }
</style>
