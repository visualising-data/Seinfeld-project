<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { locations } from '$lib/data/locations';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';

  // 11 locations → 3 rows: 4 + 4 + 3
  const mobileRows = [
    locations.slice(0, 4),
    locations.slice(4, 8),
    locations.slice(8),
  ];
  const mobileRowSpeeds = [0.5, 1.5, 3];

  onMount(() => {
    gsap.set('#locations_screen_3 .location-char', { translateY: 100, opacity: 0 });

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#locations_screen_3',
        start: 'top center',
      },
      onComplete: () => {
        gsap.utils.toArray('#locations_screen_3 .location-char').forEach((el) => {
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
      .to('#locations_screen_3 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 },
      })
      .to(
        '#locations_screen_3 .location-char',
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

    // Desktop only: pin text, parallax on individual locations
    mm.add('(min-width: 1024px)', () => {
      ScrollTrigger.create({
        trigger: '#locations_screen_3',
        start: 'top top',
        end: 'bottom top',
        pin: '#locations-3-text',
      });

      /** @type {HTMLElement[]} */
      const parallaxEls = gsap.utils.toArray('.location-desktop-parallax');
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

<div id="locations_screen_3" class="w-screen relative">
  <div class="container">
    <div class="grid grid-cols-12 lg:gap-20">
      <div
        id="locations-3-text"
        class="locations-text-col col-span-12 lg:col-span-7 h-auto lg:h-[100dvh] flex flex-col justify-center"
      >
        <p>
          As with the task of classifying characters, there were challenges with establishing a
          robust taxonomy for distinguishing different types of locations. You don't want too many
          distinct groups, but you want enough to capture the variety of different physical
          settings.
        </p>
        <p>
          The final list of distinct locations would include the <span class="location"
            >homes of the four leads</span
          >, as well as a further <span class="location">family home</span> to cover all and any
          family setting. The <span class="location">diner</span> was another common hangout
          location, but separate from other <span class="location">places of leisure</span>, which
          would include other restaurants as well as cinemas and indoor sports venues. The lead
          characters'
          <span class="location">workplace</span> would be a recurring setting, from Jerry doing his
          stand-up routines to George working at Yankee Stadium. Scenes set in various forms of
          <span class="location">transport</span>, like taxis, planes, or cars, were common, as were
          <span class="location">outside</span>
          locations like visits to the Hamptons or when disputes arose about street-side parking. An
          <span class="location">other location</span> grouping was added to classify the many other unique
          types of locations used infrequently, like hospitals or courtrooms.
        </p>
      </div>
    </div>
  </div>

  <!-- Mobile/tablet locations — 3 rows, static below text -->
  <div class="block lg:hidden w-full py-12">
    <div class="flex flex-col gap-12 px-6">
      {#each mobileRows as row, rowIndex}
        <div class="location-mobile-row flex justify-around" data-speed={mobileRowSpeeds[rowIndex]}>
          {#each row as location, i}
            <div
              class="location-char flex flex-col items-center"
              style="position: relative; top: {i % 2 === 0 ? '0' : '30px'};"
            >
              <div
                class="character rounded-full bg-contain bg-center"
                style="background-color: #12020A; background-image: url('{getLocationIconPath(
                  location.id,
                )}'); width: 60px; height: 60px;"
              ></div>
              <div class="mid pt-1 text-center text-sm">{location.label}</div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <!-- Desktop locations — single row, parallax per location -->
  <div
    class="container absolute hidden lg:block"
    style="height: 1400px; top: 100vh; left: 0; right: 0;"
  >
    <div class="grid grid-cols-12 gap-4">
      <div class="lg:col-span-1"></div>
      <div class="col-span-12 lg:col-span-11 h-[100dvh] flex flex-col justify-center">
        <ul class="flex justify-between">
          {#each locations as location, i}
            <li class="my-2">
              <div
                class="location-desktop-parallax relative flex flex-col items-center"
                style="top: {i % 2 === 0 ? '0' : '160px'};"
                data-speed={i % 2 === 0 ? 3 : 0.5}
              >
                <div class="location-char flex flex-col items-center">
                  <div
                    class="character rounded-full bg-contain bg-center shadow-md w-[75px] h-[75px] lg:w-[100px] lg:h-[100px]"
                    style="background-color: #12020A; background-image: url('{getLocationIconPath(location.id)}');"
                  ></div>
                  <div class="mid pt-2 text-center">{location.label}</div>
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
  #locations_screen_3 {
    padding-bottom: 100vh;
  }
  @media (max-width: 1023px) {
    #locations_screen_3 {
      padding-bottom: 2rem;
    }
  }

  .location {
    padding: 0 4px;
    font-weight: 600;
    color: #12020a;
    background-color: #f9f5f7;
    border-radius: 8px;
  }
</style>
