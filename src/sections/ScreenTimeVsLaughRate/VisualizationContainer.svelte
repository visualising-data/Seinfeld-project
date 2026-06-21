<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { max } from 'd3-array';

  import { episodesInfo } from '$lib/data/episodesInfo';
  import { formatTimeLabel } from '../../utils/formatTime';
  import { FILTER } from '../../types/filter';

  import ArrowDown from '../../icons/ArrowDown.svelte';
  import SeasonsStripSingle from '../../UI/SeasonsStripSingle.svelte';
  import EpisodeTooltip from '../../UI/EpisodeTooltip.svelte';
  import TimeLabels from './TimeLabels.svelte';
  import EpisodesVisualization from './EpisodesVisualization.svelte';
  import TimeTooltip from './TimeTooltip.svelte';
  import OverviewVisualization from './OverviewVisualization.svelte';

  let {
    episodesData,
    charData,
    activeSelector,
    activeFilter,
    isMouseOver,
    isTextOver,
    innerWidth,
  } = $props();

  let isMobile = $derived(innerWidth < 1024);

  let visualizationsWidth = $state(800);
  const episodesOverviewWidth = 150;
  const marginEnd = $derived(isMobile ? 10 : 25);
  let episodeDetailsWidth = $derived(
    isMobile ? visualizationsWidth : visualizationsWidth - episodesOverviewWidth,
  );
  let visualizationsHeight = $derived(innerHeight - 110);

  let margin = $derived(
    isMobile
      ? { top: 30, right: 0, bottom: 34, left: 30 }
      : { top: 30, right: 100, bottom: 34, left: 14 + 25 },
  );
  let episodeDetailsInnerWidth = $derived(episodeDetailsWidth - margin.left - margin.right);
  let visualizationsInnerHeight = $derived(visualizationsHeight - margin.top - margin.bottom);

  let episodesVerticalScale = $derived(
    scaleBand()
      .domain(episodesInfo.map((d) => `${d.season}-${d.episode}`))
      .range([0, visualizationsInnerHeight]),
  );

  /**
   * @type {number}
   */
  let episodeMaxDuration = $derived(max(episodesData, (d) => +d.duration) ?? 0);
  let episodeTimeScale = $derived(
    scaleLinear().domain([0, episodeMaxDuration]).range([0, episodeDetailsInnerWidth]),
  );

  let highlightedEpisode = $state('');
  let highlightedEpisodeInfo = $state();
  let highlightedEpisodeOverviewPercentage = $state(0);
  let highlightedEpisodeTimePosition = $state(0);
  let highlightedEpisodeTimeLabel = $state('');
  let episodeTooltipPosition = $state();
  let showEpisodeTooltip = $state(false);
  /** @type {ReturnType<typeof setTimeout> | null} */
  let tooltipTimer = null;

  const handleOverviewMouseEnter = () => {
    if (isTextOver) {
      return;
    }

    isMouseOver = true;
  };
  const handleMouseMove = (
    /** @type {MouseEvent & { currentTarget: EventTarget & SVGRectElement; }} */ e,
  ) => {
    if (isTextOver) {
      isMouseOver = false;
      return;
    }

    if (!isMouseOver) isMouseOver = true;

    const x = e.offsetX - margin.left;
    const y = e.offsetY - margin.top;

    const bandHeight = episodesVerticalScale.bandwidth();
    const episodeIndex = Math.ceil(y / bandHeight);
    const episode = episodesInfo[episodeIndex - 1];
    if (episode) {
      highlightedEpisode = `${episode.season}-${episode.episode}`;
      highlightedEpisodeInfo = episode;
    }
    const data = charData[activeSelector].find(
      (/** @type {{ season: number; episode: number; }} */ e) =>
        e.season === episode.season && e.episode === episode.episode,
    );
    highlightedEpisodeOverviewPercentage =
      activeFilter === FILTER.SCREEN_TIME
        ? Math.round(
            (data.aggregatedOnScreen.reduce(
              (/** @type {any} */ acc, /** @type {{ duration: any; }} */ value) =>
                acc + value.duration,
              0,
            ) /
              data.duration) *
              100,
          )
        : Math.round((data.causesLaughs.length / data.onScreen.length) * 100);

    const newXPosition = x <= episodeDetailsInnerWidth ? Math.round(x) : 0;
    if (highlightedEpisodeTimePosition !== newXPosition) {
      highlightedEpisodeTimePosition = newXPosition;
    }
    const timeInSeconds =
      x <= episodeDetailsInnerWidth ? Math.round(episodeTimeScale.invert(x)) : 0;
    const newTimeLabel = formatTimeLabel(timeInSeconds);
    if (highlightedEpisodeTimeLabel !== newTimeLabel) {
      highlightedEpisodeTimeLabel = formatTimeLabel(timeInSeconds);
    }

    episodeTooltipPosition = [e.clientX, e.clientY];

    showEpisodeTooltip = false;
    if (tooltipTimer) clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => {
      showEpisodeTooltip = true;
    }, 500);
  };
  const handleOverviewMouseLeave = () => {
    isMouseOver = false;
    showEpisodeTooltip = false;
    if (tooltipTimer) clearTimeout(tooltipTimer);
  };
</script>

<div class="flex mx-0" bind:clientWidth={visualizationsWidth}>
  <svg width={visualizationsWidth} height={visualizationsHeight} style="touch-action: pan-y;">
    <!-- Episode details -->
    <g transform="translate(0, {margin.top})">
      <text
        text-anchor="end"
        style="transform: translate(10px, 0px) rotate(-90deg); transform-origin: 0 0;"
        class="small accent">Episodes</text
      >
      <g transform="translate(3, 64)">
        <ArrowDown />
      </g>
      <g transform="translate(14, 0)">
        <SeasonsStripSingle
          width={episodeTimeScale(31 * 60) + margin.left}
          height={visualizationsInnerHeight}
        />
        {#if !isMobile}
          <g transform="translate({visualizationsWidth - episodesOverviewWidth - 15}, 0)">
            <SeasonsStripSingle width={episodesOverviewWidth} height={visualizationsInnerHeight} />
          </g>
        {/if}
      </g>
    </g>

    <!-- Background to detect mouse events -->
    <g transform="translate({margin.left}, {margin.top})">
      <rect
        x={0}
        y={0}
        width={visualizationsWidth - margin.left}
        height={visualizationsInnerHeight}
        fill="transparent"
        role="document"
        onmouseenter={isMobile ? undefined : handleOverviewMouseEnter}
        onmousemove={isMobile ? undefined : (e) => handleMouseMove(e)}
        onmouseleave={isMobile ? undefined : handleOverviewMouseLeave}
      />
    </g>

    <g class="pointer-events-none">
      <g transform="translate({margin.left}, {margin.top})">
        <g fill-opacity={isMouseOver ? 0.3 : 1}>
          <text x={3} y={-4} class="small accent">Duration</text>
          <g transform="rotate(-90) translate(4, 62)">
            <ArrowDown />
          </g>
        </g>

        <TimeLabels {visualizationsInnerHeight} {isMouseOver} {episodeTimeScale} />

        <EpisodesVisualization
          {isMouseOver}
          {episodeTimeScale}
          {episodesVerticalScale}
          {charData}
          {activeSelector}
          {highlightedEpisode}
          {activeFilter}
        />

        <!-- Time tooltip -->
        {#if isMouseOver && !isMobile}
          <TimeTooltip
            {charData}
            {activeSelector}
            {highlightedEpisode}
            {activeFilter}
            {highlightedEpisodeTimePosition}
            {highlightedEpisodeTimeLabel}
            {visualizationsInnerHeight}
            {episodeTimeScale}
            {episodesVerticalScale}
          />
        {/if}
      </g>

      <!-- Episode overviews -->
      {#if !isMobile}
        <OverviewVisualization
          {visualizationsWidth}
          {visualizationsInnerHeight}
          {episodesOverviewWidth}
          {margin}
          {marginEnd}
          {activeFilter}
          {isMouseOver}
          {charData}
          {activeSelector}
          {highlightedEpisode}
          {highlightedEpisodeOverviewPercentage}
          {episodesVerticalScale}
        />
      {/if}
    </g>
  </svg>

  {#if showEpisodeTooltip && innerWidth >= 1024}
    <EpisodeTooltip episode={highlightedEpisodeInfo} position={episodeTooltipPosition} />
  {/if}
</div>
