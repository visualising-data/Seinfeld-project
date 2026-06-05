<script>
  // @ts-nocheck

  import { scaleBand } from 'd3-scale';
  import { locations } from '$lib/data/locations';
  import { sharedScrollLeft } from '../../../../stores/scrollStore';

  import { catalogLegendIsVisible } from '../../../../stores/catalogLegendIsVisible';
  import Scenes from '../Scenes.svelte';
  import LocationsList from './LocationsList.svelte';
  import LocationsOnScreen from './LocationsOnScreen.svelte';
  import LocationsStats from './LocationsStats.svelte';

  let {
    width,
    statsWidth,
    labelsWidth,
    xScale,
    scenes,
    episodeData,
    episodeDuration,
    isHover,
    hoveredPosition,
    hoveredTime,
    isPlaying,
    playingScene,
    handleClickOnScene,
  } = $props();

  let innerWidth = $state(1200);

  let scrollEl = $state(null);
  let lastSyncedLeft = -1;

  const handleScrollEl = () => {
    if (scrollEl && scrollEl.scrollLeft !== lastSyncedLeft) {
      sharedScrollLeft.set(scrollEl.scrollLeft);
    }
  };

  $effect(() => {
    const sl = $sharedScrollLeft;
    if (scrollEl) {
      lastSyncedLeft = sl;
      scrollEl.scrollLeft = sl;
    }
  });

  const locationsData = $derived(episodeData.filter((e) => e.eventCategory === 'LOCATION'));
  const locationsOnScreen = $derived.by(() => {
    const locationsArray = locations.map((c) => {
      return { id: c.id, label: c.label, timesOnScreen: [], sceneNumbers: new Set() };
    });
    locationsData.forEach((d) => {
      const loc = locationsArray.find((c) => c.id === d.eventAttribute);
      const t = +d.eventTimeSeconds;
      loc.timesOnScreen.push(t);
      const scene = scenes.find((s) => t >= s.startTime && t < s.endTime);
      if (scene) loc.sceneNumbers.add(scene.sceneNum);
    });

    return locationsArray.filter((c) => c.timesOnScreen.length > 0);
  });

  const hoveredLocations = $derived.by(() => {
    let hoveredLocationsArray = [];

    if (isPlaying) {
      locationsOnScreen.forEach((location) => {
        if (location.sceneNumbers.has(playingScene)) {
          hoveredLocationsArray.push(location.id);
        }
      });
    } else {
      const time = Math.floor(hoveredTime / 5) * 5;
      locationsOnScreen.forEach((location) => {
        if (location.timesOnScreen && location.timesOnScreen.includes(time)) {
          hoveredLocationsArray.push(location.id);
        }
      });
    }

    return hoveredLocationsArray;
  });

  const rowHeight = $derived(innerWidth >= 1280 ? 48 : 32);
  const vizHeight = $derived(locationsOnScreen.length * rowHeight + 32);

  const mobileStats = $derived.by(() => {
    return locationsOnScreen.map((loc) => ({
      id: loc.id,
      label: loc.label,
      appearedPct:
        loc.timesOnScreen?.length > 0
          ? Math.min(99, Math.round(((loc.timesOnScreen.length * 5) / episodeDuration) * 100))
          : null,
    }));
  });

  let statsOpen = $state(false);

  const yScale = $derived(
    scaleBand()
      .domain(locationsOnScreen.map((char) => char.id))
      .range([0, vizHeight - 32])
      .padding(0.6),
  );
</script>

<svelte:window bind:innerWidth />

<div class="flex relative">
  {#if $catalogLegendIsVisible && innerWidth >= 1280}
    <div
      class="absolute top-[-30px] right-[-174px] small accent pl-6"
      style="width: {statsWidth}px;"
    >
      Signature sounds represent each location; each reflects the nature of the setting.
    </div>
  {/if}
  <LocationsList
    {labelsWidth}
    locations={locationsOnScreen}
    {yScale}
    {isHover}
    {hoveredLocations}
    {isPlaying}
  />
  <div
    class="relative flex-shrink-0"
    style="max-width: {innerWidth >= 1280 ? width : innerWidth - 63}px;"
  >
    <div
      bind:this={scrollEl}
      onscroll={handleScrollEl}
      class="flex-col"
      style="overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain;"
    >
    <svg {width} height={vizHeight}>
      <Scenes
        {scenes}
        {xScale}
        height={vizHeight}
        isNumbersUp={false}
        {isHover}
        {hoveredTime}
        {isPlaying}
        {playingScene}
        {handleClickOnScene}
      />
      <LocationsOnScreen
        locations={locationsOnScreen}
        {xScale}
        {yScale}
        {isHover}
        {hoveredTime}
        {scenes}
        {isPlaying}
        {playingScene}
      />
      {#if isHover}
        <line x1={hoveredPosition} y1={0} x2={hoveredPosition} y2={vizHeight} stroke="#12020A" />
      {/if}
    </svg>
    <svg height={18}>
      <g transform="translate(0, 9)">
        <text class="small accent" alignment-baseline="middle">Scene number</text>
        <g transform="translate({102}, {-3})">
          <path d="M30 3L25 0.113249V5.88675L30 3ZM0 3V3.5H25.5V3V2.5H0V3Z" fill="#E71D80" />
        </g>
      </g>
    </svg>
    </div>
    {#if innerWidth < 1280}
      <div class="scroll-fade"></div>
    {/if}
  </div>
  {#if statsWidth > 0}
    <LocationsStats
      width={statsWidth}
      height={vizHeight}
      {yScale}
      {locationsOnScreen}
      {episodeDuration}
      {isHover}
      {isPlaying}
      {hoveredLocations}
    />
  {/if}
</div>

{#if innerWidth < 1280}
  <div class="mobile-stats">
    <button class="stats-toggle" onclick={() => (statsOpen = !statsOpen)}>
      <span class="small accent">Location stats</span>
      <span class="arrow" style="transform: rotate({statsOpen ? 180 : 0}deg);">▾</span>
    </button>
    {#if statsOpen}
      <div class="stats-grid">
        <div></div>
        <div class="small accent" style="text-align: right;">In ep.</div>
        {#each mobileStats as s}
          <div class="small">{s.label}</div>
          <div class="small" style="text-align: right; font-weight: 600;">
            {s.appearedPct != null ? s.appearedPct + '%' : '—'}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .mobile-stats {
    border-top: 1px solid #eeeced;
    margin-top: 8px;
    padding: 8px 16px 12px;
  }
  .stats-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  .arrow {
    display: inline-block;
    transition: transform 150ms ease;
    font-size: 16px;
    color: #928d90;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 60px;
    gap: 6px 8px;
    align-items: center;
    margin-top: 8px;
  }
  .scroll-fade {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 48px;
    background: linear-gradient(to right, transparent, #f9f5f7);
    pointer-events: none;
  }
</style>
