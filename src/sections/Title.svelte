<script>
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  import { scaleLinear } from 'd3-scale';
  import { max } from 'd3-array';
  import * as Tone from 'tone';
  import { soundIsAuth } from '../stores/soundAuthStore';

  import { seasons } from '$lib/data/seasons';

  const seasonGradient = `conic-gradient(${seasons.map((s) => s.accessibleOverDarkColor).join(', ')}, ${seasons[0].accessibleOverDarkColor})`;

  let innerWidth = $state(1600);
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
    tl.from(
      ['h1', '#subtitle'],
      {
        yPercent: 140,
        duration: 1.5,
        stagger: 0.07,
        opacity: 0,
        ease: 'power3.out',
      },
      '-=2.5',
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
      )
      .to(
        '.name',
        {
          webkitTextFillColor: 'inherit',
          duration: 5,
          ease: 'sine.out',
        },
        '+=.3',
      );

    return tl;
  };

  // Preload Title jingle
  /**
   * @type {Tone.Player}
   */
  let soundtrack;
  let isTitleInView = false;

  const playJingle = () => {
    if ($soundIsAuth && isTitleInView && soundtrack?.loaded && soundtrack.state !== 'started') {
      soundtrack.start();
    }
  };
  const stopJingle = () => {
    if (soundtrack?.loaded && soundtrack.state === 'started') {
      soundtrack.stop();
    }
  };

  // When sound auth is granted while already in the title section, start the jingle.
  $effect(() => {
    if ($soundIsAuth) {
      playJingle();
    }
  });

  /** @type {gsap.core.Timeline | undefined} */
  let barsTl;
  const handleMouseEnterBars = () => {
    if (barsTl?.isActive()) return;
    playJingle();
    barsTl = animateBars();
  };

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    soundtrack = new Tone.Player(
      'https://amdufour.github.io/hosted-data/apis/sonification/20250925_Seinfeld_Intro_Title_All.mp3',
    ).toDestination();

    ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: '#title-screen',
            start: 'top 30%',
            end: 'bottom top',
            onEnter: () => { isTitleInView = true; playJingle(); },
            onEnterBack: () => { isTitleInView = true; playJingle(); },
            onLeave: () => { isTitleInView = false; stopJingle(); },
            onLeaveBack: () => { isTitleInView = false; stopJingle(); },
            toggleActions: 'play reset play reset',
            invalidateOnRefresh: true,
          },
        })
        .add(revealContent())
        .add(animateBars(), 0);
    });
  });

  onDestroy(() => {
    isTitleInView = false;
    ctx?.revert();
    soundtrack?.dispose();
  });
</script>

<svelte:window bind:innerWidth />

<section id="title-screen" class="py-40" style="--ring-gradient: {seasonGradient}">
  <div class="title-container h-[100dvh]">
    <svg width={svgWidth} height="132" onmouseenter={handleMouseEnterBars} role="figure">
      {#each seasons as season, i}
        <rect
          class="season-rect season-rect-{i}"
          x={0}
          y={i * 12}
          width={seasonScale(season.numEpisodes)}
          height={8}
          fill={season.accessibleOverDarkColor}
        />
      {/each}
    </svg>
    <div class="container">
      <div style="margin-top: -25px; max-width: 940px;">
        <h1>The Seinfeld Chronicles</h1>
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
  section {
    background: linear-gradient(
      180deg,
      rgba(18, 2, 10, 1) 0%,
      rgba(48, 56, 67, 1) 38%,
      rgba(48, 56, 67, 1) 50%,
      rgba(48, 56, 67, 1) 68%,
      rgba(18, 2, 10, 1) 100%
    );
  }
  .title-container {
    padding-top: 100px;
  }
  .subtitle {
    font-size: 0.6rem;
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
  @media screen and (min-width: 996px) {
    .subtitle {
      font-size: 1.1rem;
    }
  }
</style>
