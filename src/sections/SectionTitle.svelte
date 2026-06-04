<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  import { supportingCharacterTiles, characters, mainCharacterTiles } from '$lib/data/characters';
  import { locationsTiles } from '$lib/data/locations';
  import { episodesInfo } from '$lib/data/episodesInfo';
  import { seasons } from '$lib/data/seasons';
  import { getIllustrationForEpisode } from '$lib/data/illustrations';
  import { getRandom } from '../utils/getRandom';
  import { getCharacterImagePath } from '../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../utils/getLocationIconPath';

  gsap.registerPlugin(ScrollTrigger);

  let { section, title } = $props();

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  const TARGET_TILE_RATIO = 1.2; // tile width/height ratio matching desktop layout

  const numColumns = $derived.by(() => {
    if (section === 'laughs-exploration') return 4;
    switch (true) {
      case innerWidth >= 1024:
        return 4;
      case innerWidth >= 768:
        return 3;
      default:
        return 2;
    }
  });
  const numRows = $derived.by(() => {
    if (section === 'laughs-exploration') return 3;
    return Math.min(
      Math.max(2, Math.ceil((TARGET_TILE_RATIO * numColumns * innerHeight) / innerWidth)),
      Math.floor(12 / numColumns),
    );
  });

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
      case 'catalog':
        return episodesInfo
          .filter((ep) => ep.include === 'Yes' && ep.img_src)
          .map((ep) => ({
            id: `catalog-s${ep.season}e${ep.episode}`,
            img_src: ep.img_src,
            season: ep.season,
            episode: ep.episode,
            episodeTitle: ep.title,
            name: ep.title,
            category: `Season ${ep.season}`,
            icon: null,
          }));
      default:
        return mainCharacterTiles;
    }
  });

  // @ts-ignore
  const tiles = $derived.by(() => {
    if (section === 'laughs-exploration') {
      const mainRow = ['Jerry', 'George', 'Elaine', 'Kramer'].map((name) => {
        const charTiles = mainCharacterTiles.filter((t) => t.name === name);
        return getRandom(charTiles, 1)[0];
      });
      return [
        ...mainRow.map((t) => ({ ...t, _source: 'main_char' })),
        ...getRandom(supportingCharacterTiles, numColumns).map((t) => ({
          ...t,
          _source: 'supp_char',
        })),
        ...getRandom(locationsTiles, numColumns).map((t) => ({ ...t, _source: 'locations' })),
      ];
    }
    if (numTiles <= tilesData.length) return getRandom(tilesData, numTiles);
    const repeated = Array.from(
      { length: Math.ceil(numTiles / tilesData.length) },
      () => tilesData,
    ).flat();
    return getRandom(repeated, numTiles);
  });

  let introComplete = false;
  let activeTileId = $state(null);
  let activeIllustration = $state(/** @type {{ tileId: string; url: string } | null} */ (null));

  const handleTileClick = (/** @type {string} */ tileId) => {
    const isClosing = activeTileId === tileId;
    activeTileId = isClosing ? null : tileId;
    if (isClosing) {
      handleMouseLeave();
    } else {
      const tile = tiles.find((t) => t.id === tileId);
      handleMouseEnter(tile);
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
      `#section-title-${section}`,
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

  const handleMouseEnter = (/** @type {any} */ tile) => {
    if (!introComplete) return;
    const tileIndex = tiles.findIndex((t) => t.id === tile?.id);
    const triggerRow = innerWidth < 768 ? 1 : 0;
    const rowIndex = Math.floor(tileIndex / numColumns);
    if (tileIndex !== -1 && rowIndex === triggerRow) {
      gsap.to(`#section-title-${section}`, { translateY: 100, ease: 'power3.out', duration: 0.4 });
    }
    if (tile && innerWidth >= 768) {
      const url = getIllustrationForEpisode(tile.season, tile.episode);
      activeIllustration = url ? { tileId: tile.id, url } : null;
    }
  };

  const handleMouseLeave = () => {
    if (!introComplete) return;
    gsap.to(`#section-title-${section}`, { translateY: 0, ease: 'power3.out', duration: 0.4 });
    activeIllustration = null;
  };

  const getTileBackgroundImage = (/** @type {any} */ tile) => {
    if (tile.img_src) return tile.img_src;
    return `https://amdufour.github.io/hosted-data/apis/thumbnails/${tile.thumbnail}`;
  };

  const getOverlayColor = (
    /** @type {{ category: string; name: string; season?: number; _source?: string }} */ tile,
  ) => {
    switch (tile._source || section) {
      case 'supp_char':
        return characters.find((char) => char.label === tile.category)?.color;
      case 'main_char':
        return characters.find((char) => char.label === tile.name)?.color;
      case 'catalog':
        return seasons.find((s) => s.seasonNum === tile.season)?.color || '#12020A';
      default:
        return '#12020A';
    }
  };
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
  id={`tiles-container-${section}`}
  class="tiles-container relative h-[100dvh] w-screen bg-black text-white"
>
  <div class="tiles absolute z-0 flex flex-wrap">
    {#each tiles as tile}
      <div
        id={tile.id}
        class={`cursor-default tile-container tile-container-${section} relative${activeTileId === tile.id ? ' active' : ''}`}
        role="button"
        tabindex="0"
        onmouseenter={() => handleMouseEnter(tile)}
        onmouseleave={handleMouseLeave}
        onclick={() => handleTileClick(tile.id)}
        onkeydown={(e) => e.key === 'Enter' && handleTileClick(tile.id)}
      >
        <div
          class="tile relative z-10"
          style="width: {tileWidth}; height: {tileHeight}; background-image: url('{getTileBackgroundImage(
            tile,
          )}');"
        ></div>
        {#if activeIllustration?.tileId === tile.id}
          <img class="tile-illustration" src={activeIllustration?.url} alt="" />
        {/if}
        <div class="info absolute bottom-0 left-0 right-0 z-20">
          <div
            class="details px-4"
            style="color: {(tile._source || section) === 'catalog'
              ? tile.season <= 3
                ? '#12020A'
                : '#F9F5F7'
              : (tile._source || section) === 'locations' ||
                  (tile._source || section) === 'supp_char'
                ? '#F9F5F7'
                : '#12020A'}; background-color: {getOverlayColor(tile)};"
          >
            <div class="flex items-center gap-2">
              {#if tile.icon != null}
                <div
                  class="character grow-0 shrink-0 rounded-full bg-contain bg-center border-2 border-black w-8 h-8 md:w-12 md:h-12 bg-no-repeat"
                  style="background-image: url('{(tile._source || section) === 'locations'
                    ? getLocationIconPath(tile.name)
                    : getCharacterImagePath(tile.icon)}');"
                ></div>
              {/if}
              <div class="flex flex-col gap-0.5">
                <div class="name font-semibold text-[16px] md:text-[18px] leading-none">
                  {tile.name}
                </div>
                {#if tile.category}
                  <div class="category small text-[13px]">{tile.category}</div>
                {/if}
                <div class="small text-[13px]">
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

  /* Illustration */
  .tile-illustration {
    position: absolute;
    bottom: -30px;
    right: -70px;
    z-index: 40;
    max-width: 300px;
    height: auto;
    transform: rotate(20deg);
    pointer-events: none;
    animation: float 3s ease-in-out infinite;
  }
  @keyframes float {
    0%,
    100% {
      translate: 0 0;
    }
    50% {
      translate: 0 -4px;
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
