<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  import { supportingCharacterTiles, characters, mainCharacterTiles } from '$lib/data/characters';
  import { locationsTiles } from '$lib/data/locations';
  import { getRandom } from '../utils/getRandom';
  import { getCharacterImagePath } from '../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../utils/getLocationIconPath';

  gsap.registerPlugin(ScrollTrigger);

  let { section, title } = $props();

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  const TARGET_TILE_RATIO = 1.2; // tile width/height ratio matching desktop layout

  const numColumns = $derived.by(() => {
    switch (true) {
      case innerWidth >= 1024:
        return 4;
      case innerWidth >= 768:
        return 3;
      default:
        return 2;
    }
  });
  const numRows = $derived(
    Math.min(
      Math.max(2, Math.ceil((TARGET_TILE_RATIO * numColumns * innerHeight) / innerWidth)),
      Math.floor(12 / numColumns),
    ),
  );

  const numTiles = $derived(numColumns * numRows);
  const tileWidth = $derived(`calc(100vw / ${numColumns})`);
  const tileHeight = $derived(`calc(100vh / ${numRows})`);
  const titleTop = $derived.by(() => {
    switch (true) {
      case innerWidth >= 1024:
        return `calc(100vh / ${numRows} - 154px)`;
      case innerWidth >= 768:
        return '160px';
      default:
        return '120px';
    }
  });
  const tilesData = $derived.by(() => {
    switch (section) {
      case 'supp_char':
        return supportingCharacterTiles;
      case 'locations':
        return locationsTiles;
      default:
        return mainCharacterTiles;
    }
  });

  // @ts-ignore
  const tiles = $derived.by(() => {
    if (numTiles <= tilesData.length) return getRandom(tilesData, numTiles);
    const repeated = Array.from(
      { length: Math.ceil(numTiles / tilesData.length) },
      () => tilesData,
    ).flat();
    return getRandom(repeated, numTiles);
  });

  let introComplete = false;
  let activeTileId = $state(null);

  const handleTileClick = (/** @type {string} */ tileId) => {
    const isClosing = activeTileId === tileId;
    activeTileId = isClosing ? null : tileId;
    if (isClosing) {
      handleMouseLeave();
    } else {
      handleMouseEnter();
    }
  };

  onMount(() => {
    // Reveal section title
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: `#tiles-container-${section}`,
        start: 'top center',
      },
      onComplete: () => {
        introComplete = true;
      },
    });
    tl.from(`.tile-container-${section}`, {
      scale: 0,
      opacity: 0,
      ease: 'power3.out',
      duration: 2,
      stagger: {
        from: 'random',
        amount: 0.4,
      },
    }).from(
      `#section-title-${section} h2`,
      {
        translateY: 100,
        opacity: 0,
        ease: 'power3.out',
        duration: 2,
      },
      '-=1',
    );

    return () => tl.kill();
  });

  const handleMouseEnter = () => {
    if (!introComplete) return;
    gsap.to(`#section-title-${section} h2`, {
      translateY: 100,
      opacity: 0,
      ease: 'power3.out',
      duration: 0.4,
    });
  };

  const handleMouseLeave = () => {
    if (!introComplete) return;
    gsap.to(`#section-title-${section} h2`, {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 0.4,
    });
  };

  const getOverlayColor = (/** @type {{ category: string; name: string }} */ tile) => {
    switch (section) {
      case 'supp_char':
        return characters.find((char) => char.label === tile.category)?.color;
      case 'main_char':
        return characters.find((char) => char.label === tile.name)?.color;
      default:
        return '#12020A';
    }
  };
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
  id={`tiles-container-${section}`}
  class="tiles-container relative h-screen w-screen bg-black text-white"
>
  <div class="tiles absolute z-0 flex flex-wrap">
    {#each tiles as tile}
      <div
        id={tile.id}
        class={`tile-container tile-container-${section} relative${activeTileId === tile.id ? ' active' : ''}`}
        role="button"
        tabindex="0"
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        onclick={() => handleTileClick(tile.id)}
        onkeydown={(e) => e.key === 'Enter' && handleTileClick(tile.id)}
      >
        <div
          class="tile relative z-10"
          style="width: {tileWidth}; height: {tileHeight}; background-image: url('https://amdufour.github.io/hosted-data/apis/thumbnails/{tile.thumbnail}');"
        ></div>
        <div class="info absolute bottom-0 left-0 right-0 z-20">
          <div
            class="details px-4"
            style="color: {section === 'locations'
              ? '#F9F5F7'
              : '#12020A'}; background-color: {getOverlayColor(tile)};"
          >
            <div class="flex items-center gap-2">
              <div
                class="character grow-0 shrink-0 rounded-full bg-contain bg-center border-2 border-black w-12 h-12 bg-no-repeat"
                style="background-image: url('{section === 'locations'
                  ? getLocationIconPath(tile.name)
                  : getCharacterImagePath(tile.icon)}');"
              ></div>
              <div>
                <div>
                  <span class="name font-semibold text-[16px] md:text-[18px] leading-none"
                    >{tile.name}</span
                  >
                  {#if tile.category}
                    <span class="category small text-[12px] md:text-[14px]">{tile.category}</span>
                  {/if}
                </div>
                <div class="small text-[12px] md:text-[14px]">
                  {`s${tile.season}e${tile.episode} ${tile.episodeTitle}`}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="overlay absolute left-0 right-0 top-0 z-30">
          <div
            class="absolute left-0 right-0 top-0 bottom-0"
            style="background: rgba(18, 2, 10, 0.4);"
          ></div>
          <div
            class="absolute left-0 right-0 top-0 bottom-0 opacity-30"
            style="background-color: {getOverlayColor(tile)};"
          ></div>
        </div>
      </div>
    {/each}
  </div>
  <div
    id={`section-title-${section}`}
    class="section-title absolute left-0 right-0 z-10 flex items-center"
    style="top: {titleTop};"
  >
    <div class="container">
      <h2>{title}</h2>
    </div>
  </div>
</div>

<style>
  /* Tiles */
  .tile,
  .overlay,
  .info .details {
    transition: all 300ms ease-out;
  }
  .tile {
    border: 1px solid #f9f5f7;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    opacity: 1;
  }
  .overlay {
    height: 100%;
    max-height: 100%;
  }
  .info {
    height: 100%;
    display: flex;
    align-items: flex-end;
  }
  .info .details {
    padding-top: 0;
    padding-bottom: 0;
    width: 100%;
    max-height: 0;
    overflow: hidden;
    font-size: 1.125rem;
    line-height: 1.1;
  }
  @media (hover: hover) {
    .tile-container:hover .overlay {
      max-height: 0;
    }
    .tile-container:hover .info .details {
      padding-top: 8px;
      padding-bottom: 8px;
      max-height: 100px;
    }
  }
  @media (hover: none) {
    .tile-container.active .overlay {
      max-height: 0;
    }
    .tile-container.active .info .details {
      padding-top: 8px;
      padding-bottom: 8px;
      max-height: 100px;
    }
  }

  /* Title */
  .section-title {
    height: 228px;
    background: rgb(18, 2, 10);
    background: linear-gradient(
      0deg,
      rgba(18, 2, 10, 0) 0%,
      rgba(18, 2, 10, 0.3) 30%,
      rgba(18, 2, 10, 0.3) 50%,
      rgba(18, 2, 10, 0.3) 70%,
      rgba(18, 2, 10, 0) 100%
    );
    pointer-events: none;
  }
</style>
