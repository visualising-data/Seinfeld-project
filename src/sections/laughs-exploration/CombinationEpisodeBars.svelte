<script lang="ts">
  import { max } from 'd3-array';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { seasons } from '$lib/data/seasons';
  import type { EpisodeResult } from '../../utils/getCombinationScenes';

  import ArrowDown from '../../icons/ArrowDown.svelte';

  let {
    episodesData,
    combinationScenes,
    width = 600,
    height = 184,
  }: {
    episodesData: any[];
    combinationScenes: EpisodeResult[];
    width: number;
    height: number;
  } = $props();

  $inspect(combinationScenes);

  const margin = { top: 16, right: 20, bottom: 16, left: 60 };
  const midBand = 12; // height of the season label strip between sections
  const gap = 5; // px between bar tips and the middle strip

  let innerWidth = $derived(width - margin.left - margin.right);
  let innerHeight = $derived(height - margin.top - margin.bottom);
  let sectionHeight = $derived((innerHeight - midBand) / 2);

  // All episodes in order, merged with combination stats
  let allEpisodes = $derived.by(() => {
    // Build lookup directly from combinationScenes so Svelte tracks it as a dependency
    const map = new Map<
      string,
      { totalDuration: number; laughDuration: number; laughRate: number }
    >();
    combinationScenes.forEach((ep) => {
      const key = `${ep.season}-${ep.episode}`;
      const totalDuration = ep.scenes.reduce((s, sc) => s + sc.duration, 0);
      const laughDuration = ep.scenes.reduce((s, sc) => s + sc.laughDuration, 0);
      map.set(key, {
        totalDuration,
        laughDuration,
        laughRate: totalDuration > 0 ? laughDuration / totalDuration : 0,
      });
    });
    return episodesData.map((ep: any) => {
      const key = `${ep.season}-${ep.episode}`;
      const combo = map.get(key);
      return {
        key,
        season: ep.season,
        episode: ep.episode,
        totalDuration: combo?.totalDuration ?? 0,
        laughDuration: combo?.laughDuration ?? 0,
        laughRate: combo?.laughRate ?? 0,
      };
    });
  });

  let xScale = $derived(
    scaleBand()
      .domain(allEpisodes.map((ep) => ep.key))
      .range([0, innerWidth])
      .padding(0.1),
  );

  let maxDuration = $derived(max(allEpisodes, (ep) => ep.totalDuration) || 60);

  // Both sections share the same pixel height (sectionHeight)
  let yScaleTop = $derived(
    scaleLinear()
      .domain([0, maxDuration])
      .range([0, sectionHeight - gap]),
  );
  let yScaleBottom = $derived(
    scaleLinear()
      .domain([0, 1])
      .range([0, sectionHeight - gap]),
  );

  // Season bars for middle strip: extend by half the inter-band gap so bars tile with no gaps
  let seasonBars = $derived.by(() => {
    const halfGap = (xScale.step() - xScale.bandwidth()) / 2;
    return seasons
      .map((season) => {
        const eps = allEpisodes.filter((ep) => ep.season === season.seasonNum);
        if (eps.length === 0) return null;
        const x = Math.max(0, (xScale(eps[0].key) ?? 0) - halfGap);
        const lastEp = eps[eps.length - 1];
        const xEnd = Math.min(innerWidth, (xScale(lastEp.key) ?? 0) + xScale.bandwidth() + halfGap);
        return {
          season: season.seasonNum,
          x,
          width: xEnd - x,
          color: season.accessibleOverDarkColor,
        };
      })
      .filter((d) => d !== null);
  });

  const axisColor = '#DDDBDC';
  const labelColor = '#12020A';
  const BAR_COLOR = '#12020A';

  const formatDuration = (seconds: number) =>
    seconds < 60 ? `${Math.round(seconds)}sec` : `${Math.round(seconds / 60)}min`;

  // Top section: grid at half and max
  let topGridTicks = $derived([
    { value: maxDuration / 2, label: formatDuration(maxDuration / 2) },
    { value: maxDuration, label: formatDuration(maxDuration) },
  ]);

  // Bottom section: grid at 50% and 100%
  const bottomGridTicks = [
    { value: 0, label: '0' },
    { value: 0.5, label: '50%' },
    { value: 1, label: '100%' },
  ];
</script>

<svg {width} {height}>
  <g transform="translate({margin.left}, {margin.top})">
    <!-- ── Top section: duration bars ──────────────────────────── -->

    <!-- Grid lines + y-axis labels (top section) -->
    {#each topGridTicks as tick}
      {@const y = sectionHeight - gap - yScaleTop(tick.value)}
      <line x1={0} y1={y} x2={innerWidth} y2={y} stroke={axisColor} />
      <text
        class="number"
        x={-6}
        {y}
        fill={labelColor}
        font-size="10"
        text-anchor="end"
        dominant-baseline="middle">{tick.label}</text
      >
    {/each}

    <!-- Baseline (0) for top section -->
    <line
      x1={0}
      y1={sectionHeight - gap}
      x2={innerWidth}
      y2={sectionHeight - gap}
      stroke={axisColor}
    />
    <text
      class="number"
      x={-6}
      y={sectionHeight - gap}
      fill={labelColor}
      font-size="10"
      text-anchor="end"
      dominant-baseline="middle">0</text
    >

    <!-- Top axis label -->
    <g transform="translate(-20, {yScaleTop.range()[1]})">
      <text y={-10} class="small accent" style="transform: rotate(-90deg);">Duration</text>
      <g transform="rotate(180)">
        <ArrowDown />
      </g>
    </g>

    <!-- Top bars: total duration (bg) and laugh duration (fg) -->
    {#each allEpisodes as ep}
      {#if ep.totalDuration > 0}
        <rect
          x={xScale(ep.key)}
          y={sectionHeight - gap - yScaleTop(ep.totalDuration)}
          width={xScale.bandwidth()}
          height={yScaleTop(ep.totalDuration)}
          fill={BAR_COLOR}
          opacity="0.3"
        />
        {#if ep.laughDuration > 0}
          <rect
            x={xScale(ep.key)}
            y={sectionHeight - gap - yScaleTop(ep.laughDuration)}
            width={xScale.bandwidth()}
            height={yScaleTop(ep.laughDuration)}
            fill={BAR_COLOR}
          />
        {/if}
      {/if}
    {/each}

    <!-- ── Middle strip: season labels ─────────────────────────── -->
    <g transform="translate(0, {sectionHeight})">
      {#each seasonBars as sb}
        <rect x={sb.x} y={0} width={sb.width} height={midBand} fill={sb.color} />
      {/each}
    </g>

    <!-- ── Bottom section: laugh rate bars ─────────────────────── -->

    <!-- Grid lines + y-axis labels (bottom section) -->
    {#each bottomGridTicks as tick}
      {@const y = sectionHeight + midBand + gap + yScaleBottom(tick.value)}
      <line x1={0} y1={y} x2={innerWidth} y2={y} stroke={axisColor} />
      <text
        class="number"
        x={-6}
        {y}
        fill={labelColor}
        font-size="10"
        text-anchor="end"
        dominant-baseline="middle">{tick.label}</text
      >
    {/each}

    <!-- Bottom axis label -->
    <g transform="translate(-20, {yScaleTop.range()[1] + 22})">
      <text y={-10} class="small accent" style="transform: rotate(-90deg);" text-anchor="end"
        >Laugh rate</text
      >
      <g transform="translate(-6, 0)">
        <ArrowDown />
      </g>
    </g>

    <!-- Bottom bars: laugh rate -->
    <g transform="translate(0, {sectionHeight + midBand + gap})">
      {#each allEpisodes as ep}
        {#if ep.laughRate > 0}
          <rect
            x={xScale(ep.key)}
            y={0}
            width={xScale.bandwidth()}
            height={yScaleBottom(ep.laughRate)}
            fill={BAR_COLOR}
          />
        {/if}
      {/each}
    </g>
  </g>
</svg>
