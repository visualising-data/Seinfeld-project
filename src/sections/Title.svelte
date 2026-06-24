<script>
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  import { scaleLinear } from 'd3-scale';
  import { max } from 'd3-array';
  import * as Tone from 'tone';
  import { soundIsAuth } from '../stores/soundAuthStore';
  import { enterSoundSection, leaveSoundSection } from '../stores/soundSectionIsInView';

  import { seasons } from '$lib/data/seasons';

  const seasonGradient = `conic-gradient(${seasons.map((s) => s.accessibleOverDarkColor).join(', ')}, ${seasons[0].accessibleOverDarkColor})`;

  let innerWidth = $state(1600);
  let innerHeight = $state(800);

  const svgHeight = $derived(Math.max(66, Math.min(132, Math.round(innerHeight * 0.11))));
  const barSpacing = $derived(Math.round((svgHeight / 132) * 12));
  const barHeight = $derived(Math.round((svgHeight / 132) * 8));
  const gridContainer = $derived.by(() => {
    switch (true) {
      case innerWidth >= 1536:
        return 1536;
      case innerWidth >= 1280:
        return 1280;
      case innerWidth >= 1024:
        return 1024;
      case innerWidth >= 768:
        return 768;
      default:
        return 640;
    }
  });
  const padding = 30;

  let svgWidth = $derived(
    innerWidth >= gridContainer
      ? gridContainer + (innerWidth - gridContainer) / 2
      : innerWidth > 0
        ? innerWidth - 2 * padding
        : 0,
  );

  let seasonScale = $derived(
    scaleLinear()
      .domain([0, max(seasons, (/** @type {{ numEpisodes: any; }} */ d) => d.numEpisodes) ?? 0])
      .range([0, svgWidth]),
  );

  const animateBars = () => {
    const tl = gsap.timeline();
    tl.from('.season-rect-0', { width: 0, height: 0, duration: 0.8, ease: 'back.out(1.7)' }, '+=.1')
      .from('.season-rect-1', { width: 0, height: 0, duration: 0.2, ease: 'back.out(1.7)' }, '-=.1')
      .from('.season-rect-2', { width: 0, height: 0, duration: 0.2, ease: 'back.out(1.7)' }, '-=.1')
      .from('.season-rect-3', { width: 0, height: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=.1')
      .from('.season-rect-4', { width: 0, height: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=.1')
      .from('.season-rect-5', { width: 0, height: 0, duration: 0.8, ease: 'back.out(1.7)' }, '+=.2')
      .from(
        '.season-rect-6',
        { width: 0, height: 0, duration: 0.25, ease: 'back.out(1.7)' },
        '-=.15',
      )
      .from('.season-rect-7', { width: 0, height: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=.1')
      .from(
        '.season-rect-8',
        { width: 0, height: 0, duration: 1.5, ease: 'back.out(1.7)' },
        '-=.1',
      );

    return tl;
  };

  const revealContent = () => {
    const tl = gsap.timeline();
    tl.fromTo(
      ['h1'],
      { yPercent: 140, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
    )
      .fromTo(
        ['#subtitle'],
        { yPercent: 140, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
        '-=.5',
      )
      .to(
        '.name',
        {
          webkitTextFillColor: 'transparent',
          backgroundPosition: '10% center',
          duration: 2,
          stagger: 0.3,
          ease: 'power3.out',
        },
        '-=.5',
      );

    return tl;
  };

  // Preload Title jingle
  /**
   * @type {Tone.Player}
   */
  let soundtrack;

  // Tracked via IntersectionObserver — more reliable than GSAP ScrollTrigger on iOS Chrome
  let isTitleInView = $state(false);
  /** @type {IntersectionObserver | undefined} */
  let ioObserver;

  // Guards against the jingle starting before the bar animation fires.
  let barsHaveAnimated = false;

  /** @type {gsap.core.Timeline | undefined} */
  let revealTl;

  const playJingle = () => {
    if (
      $soundIsAuth &&
      isTitleInView &&
      barsHaveAnimated &&
      soundtrack?.loaded &&
      soundtrack.state !== 'started'
    ) {
      soundtrack.start();
    }
  };
  const stopJingle = () => {
    if (soundtrack?.loaded && soundtrack.state === 'started') {
      soundtrack.stop();
    }
  };

  // Play/stop jingle reactively whenever auth state or visibility changes.
  // playJingle() is a no-op until barsHaveAnimated is true, so granting sound
  // auth before the scroll position is reached won't start the music early.
  $effect(() => {
    if (isTitleInView) {
      // Nav fallback: ScrollTrigger.refresh() in the nav handler pre-calculates
      // trigger positions without firing callbacks, so the boundary is never
      // crossed and toggleActions never fires. If the timeline is at t=0 and the
      // section top is at the viewport top, play it explicitly.
      if (revealTl && !revealTl.isActive() && revealTl.progress() < 0.001) {
        const titleEl = document.getElementById('title-screen');
        if (titleEl && titleEl.getBoundingClientRect().top <= 10) {
          barsHaveAnimated = false;
          revealTl.play();
        }
      }
      if ($soundIsAuth) playJingle();
    } else {
      stopJingle();
    }
  });

  /** @type {gsap.core.Timeline | undefined} */
  let barsTl;
  const handleMouseEnterBars = () => {
    if (barsTl?.isActive()) return;
    playJingle();
    barsTl = animateBars();
  };

  /** @type {gsap.MatchMedia | undefined} */
  let mm;

  onMount(() => {
    soundtrack = new Tone.Player(
      'https://amdufour.github.io/hosted-data/apis/sonification/20250925_Seinfeld_Intro_Title_All.mp3',
    ).toDestination();

    const titleEl = document.getElementById('title-screen');
    if (titleEl) {
      ioObserver = new IntersectionObserver(
        ([entry]) => {
          isTitleInView = entry.isIntersecting;
          if (entry.isIntersecting) enterSoundSection();
          else leaveSoundSection();
        },
        { threshold: 0.1 },
      );
      ioObserver.observe(titleEl);
    }

    mm = gsap.matchMedia();

    // Desktop: ScrollTrigger reveal + scrub fan-out.
    mm.add('(min-width: 1024px)', () => {
      const ctx = gsap.context(() => {
        revealTl = gsap
          .timeline({
            scrollTrigger: {
              trigger: '#title-screen',
              start: 'top top',
              end: 'bottom top',
              toggleActions: 'play none restart reset',
              invalidateOnRefresh: true,
              onEnterBack: () => {
                barsHaveAnimated = false;
              },
              onLeaveBack: () => {
                barsHaveAnimated = false;
              },
            },
          })
          .add(revealContent(), 0)
          .call(
            () => {
              barsHaveAnimated = true;
              playJingle();
            },
            [],
            1.5,
          )
          .add(animateBars(), 1.5);

        gsap
          .timeline({
            scrollTrigger: {
              trigger: '#title-screen',
              start: 'top center',
              end: 'bottom bottom',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            ['#title-the', '#title-chronicles', '#title-screen svg', '#subtitle'],
            { opacity: 1, y: 0, immediateRender: false },
            { opacity: 0, y: -80, ease: 'none' },
            1,
          )
          .fromTo(
            '#title-seinfeld-text',
            { opacity: 1 },
            { opacity: 0, ease: 'none', duration: 0.5 },
            2,
          )
          .to('.seinfeld-season-word', { opacity: 1, duration: 0.001 }, 2)
          .fromTo(
            '.seinfeld-season-word',
            { xPercent: 0, scale: 1, x: 0 },
            {
              xPercent: (/** @type {number} */ i) => (i - 4) * 4,
              x: 0,
              scale: (/** @type {number} */ i) => 1 + i * 0.05,
              ease: 'none',
              duration: 1,
            },
            2,
          );
      });
      return () => ctx.revert();
    });

    // Mobile/tablet: one-shot entrance animation, no pin spacer, no scrub.
    mm.add('(max-width: 1023px)', () => {
      let hasRevealed = false;
      /** @type {gsap.core.Timeline | undefined} */
      let mobileTl;
      const revealObs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasRevealed) {
            hasRevealed = true;
            revealObs.disconnect();
            mobileTl = gsap
              .timeline()
              .add(revealContent(), 0)
              .call(
                () => {
                  barsHaveAnimated = true;
                  playJingle();
                },
                [],
                1.5,
              )
              .add(animateBars(), 1.5);
          }
        },
        { threshold: 0.1 },
      );
      const el = document.getElementById('title-screen');
      if (el) revealObs.observe(el);
      return () => {
        revealObs.disconnect();
        mobileTl?.kill();
      };
    });
  });

  onDestroy(() => {
    ioObserver?.disconnect();
    isTitleInView = false;
    mm?.revert();
    soundtrack?.dispose();
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<section id="title-screen" style="--ring-gradient: {seasonGradient}">
  <div
    class="title-container h-[100dvh]"
    style="position: sticky; top: var(--vv-top, 0px); z-index: 10;"
  >
    <svg
      width={svgWidth}
      height={svgHeight}
      onmouseenter={handleMouseEnterBars}
      role="img"
      aria-label="Bar chart showing the number of episodes per season across all 9 seasons of Seinfeld, from 4 episodes in Season 1 to 24 episodes in later seasons."
    >
      {#each seasons as season, i}
        <rect
          class="season-rect season-rect-{i}"
          x={0}
          y={i * barSpacing}
          width={seasonScale(season.numEpisodes)}
          height={barHeight}
          fill={season.accessibleOverDarkColor}
        />
      {/each}
    </svg>
    <div class="container">
      <div style="max-width: 940px;">
        <h1>
          <span id="title-the">The</span>{' '}<span id="title-seinfeld"
            ><span id="title-seinfeld-text">Seinfeld</span><span
              id="seinfeld-seasons"
              aria-hidden="true"
              >{#each seasons as season}<span
                  class="seinfeld-season-word"
                  style="color: {season.accessibleOverDarkColor}">Seinfeld</span
                >{/each}<span class="seinfeld-season-word" style="color: #F9F5F7">Seinfeld</span
              ></span
            ></span
          ><span id="title-chronicles"> Chronicles</span>
        </h1>
      </div>
      <div id="subtitle" class="subtitle number mt-6">
        An unnecessary data exploration by
        <span class="name">
          <span class="highlight">Andy Kirk</span>
          <span class="portrait-ring" id="ring-andy">
            <img
              class="portrait"
              loading="lazy"
              alt="Portrait of Andy Kirk"
              src="https://amdufour.github.io/hosted-data/apis/portraits/andy.jpg"
            />
          </span>
        </span>
        <br />
        <span>...unleashed in digital form by</span>
        <span class="name">
          <span class="highlight">Anne-Marie Dufour</span>
          <span class="portrait-ring" id="ring-am">
            <img
              class="portrait"
              loading="lazy"
              alt="Portrait of Anne-Marie Dufour"
              src="https://amdufour.github.io/hosted-data/apis/portraits/annemarie_square_closeup.jpg"
            />
          </span>
        </span>
        <span> and </span>
        <span class="name">
          <span class="highlight">Miriam Quick</span>
          <span class="portrait-ring" id="ring-mq">
            <img
              class="portrait"
              loading="lazy"
              alt="Portrait of Miriam Quick"
              src="https://amdufour.github.io/hosted-data/apis/portraits/miriam_quick.jpg"
            />
          </span>
        </span>
        <span>/</span>
        <span class="name">
          <span class="highlight">Duncan Geere</span>
          <span class="portrait-ring" id="ring-dg">
            <img
              class="portrait"
              loading="lazy"
              alt="Portrait of Duncan Geere"
              src="https://amdufour.github.io/hosted-data/apis/portraits/duncan_geere.jpeg"
            />
          </span>
        </span>
        <span>{' { '}</span>
        <span class="name">
          <span class="highlight">Loud Numbers</span>
          <span class="portrait-ring" id="ring-ln">
            <img
              class="portrait"
              loading="lazy"
              alt="Loud Numbers logo"
              src="https://amdufour.github.io/hosted-data/apis/portraits/loud_numbers.jpg"
            />
          </span>
        </span>
        <span>{' }'}</span>
      </div>
    </div>
  </div>
</section>

<style>
  h1,
  #subtitle {
    opacity: 0;
  }
  h1 {
    font-size: clamp(2rem, min(12dvh, 14vw), 10rem);
    margin-top: clamp(0.25rem, 2dvh, 2rem);
  }
  #subtitle {
    font-size: clamp(0.7rem, 1.8dvh, 1.1rem);
    line-height: clamp(1.4rem, 3.4dvh, 2.2rem);
  }
  section {
    background: linear-gradient(
      180deg,
      rgba(18, 2, 10, 1) 0%,
      rgba(48, 56, 67, 1) 38%,
      rgba(48, 56, 67, 1) 50%,
      rgba(48, 56, 67, 1) 68%,
      rgba(18, 2, 10, 1) 100%
    );
    min-height: 500dvh;
  }
  @media (max-width: 1023px) {
    section {
      min-height: 100dvh;
    }
  }
  .title-container {
    padding-top: 100px;
  }
  .subtitle {
    font-size: 0.875rem;
    line-height: 2.5;
  }
  @media (min-width: 768px) {
    .subtitle {
      font-size: 1rem;
      line-height: 2;
    }
  }
  .name {
    position: relative;
    z-index: 1;
    transition: color 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
  }
  .name:hover {
    color: transparent;
    -webkit-text-fill-color: 'transparent';
    background-position: '100% center';
    background-size: 100% auto;
  }
  /* Gradient ring wrapper */
  .portrait-ring {
    position: absolute;
    z-index: 2;
    left: 50%;
    top: -50px;
    width: 81px;
    height: 81px;
    padding: 3px;
    border-radius: 60% 40% 50% 50% / 50% 50% 60% 40%;
    background: var(--ring-gradient);
    opacity: 0;
    translate: -50% 0px;
    scale: 1;
    transition:
      opacity 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
      translate 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
      scale 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
    pointer-events: none;
    animation:
      ring-spin 4s linear infinite,
      ring-morph 6s ease-in-out infinite;
  }
  .name:hover .portrait-ring {
    opacity: 1;
    translate: -50% -40px;
    scale: 1.2;
  }
  /* Portrait image: always circular, counter-rotates to stay upright */
  .portrait {
    display: block;
    width: 75px;
    height: 75px;
    object-fit: cover;
    border-radius: 50%;
    border: none;
    animation: counter-spin 4s linear infinite;
  }
  /* Per-portrait position overrides */
  .portrait-ring#ring-am {
    left: 0;
    top: 70px;
    translate: 0% 0%;
  }
  .name:hover .portrait-ring#ring-am {
    translate: 0% -35px;
  }
  .portrait-ring#ring-mq {
    left: auto;
    right: 60px;
    top: -105px;
    translate: 0% 0%;
  }
  .name:hover .portrait-ring#ring-mq {
    translate: 0% -15px;
  }
  .portrait-ring#ring-dg {
    left: 20px;
    top: 0px;
    translate: 0% 0%;
  }
  .name:hover .portrait-ring#ring-dg {
    translate: 0% 75px;
  }
  /* Animations */
  @keyframes ring-spin {
    to {
      rotate: 360deg;
    }
  }
  @keyframes counter-spin {
    to {
      rotate: -360deg;
    }
  }
  @keyframes ring-morph {
    0%,
    100% {
      border-radius: 60% 40% 50% 50% / 50% 50% 60% 40%;
    }
    25% {
      border-radius: 40% 60% 30% 70% / 60% 40% 70% 30%;
    }
    50% {
      border-radius: 70% 30% 60% 40% / 40% 60% 30% 70%;
    }
    75% {
      border-radius: 30% 70% 40% 60% / 70% 30% 50% 50%;
    }
  }
  #title-seinfeld {
    position: relative;
    display: inline-block;
    vertical-align: baseline;
  }
  #seinfeld-seasons {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
  .seinfeld-season-word {
    position: absolute;
    top: 0;
    left: 0;
    white-space: nowrap;
    -webkit-text-stroke: 1px white;
    opacity: 0;
  }
  @media screen and (min-width: 996px) {
    .subtitle {
      font-size: 1.1rem;
    }
  }
</style>
