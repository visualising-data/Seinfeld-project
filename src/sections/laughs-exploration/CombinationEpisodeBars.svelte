<script lang="ts">
  import { max } from 'd3-array';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { seasons } from '$lib/data/seasons';
  import type { EpisodeResult } from '../../utils/getCombinationScenes';
  import type { HoveredScene } from './ScenesBeeswarm.svelte';

  import ArrowDown from '../../icons/ArrowDown.svelte';

  let {
    episodesData,
    combinationScenes,
    width = 600,
    height = 184,
    hoveredEpisodeKey = null,
    layout = 'horizontal' as 'horizontal' | 'vertical',
    onEpisodeHover = () => {},
    onSceneHover = () => {},
    onSceneClick = () => {},
    onClosePin = () => {},
  }: {
    episodesData: any[];
    combinationScenes: EpisodeResult[];
    width: number;
    height: number;
    hoveredEpisodeKey?: string | null;
    layout?: 'horizontal' | 'vertical';
    onEpisodeHover?: (key: string | null) => void;
    onSceneHover?: (scene: HoveredScene | null) => void;
    onSceneClick?: (scene: HoveredScene) => void;
    onClosePin?: () => void;
  } = $props();

  function getFirstScene(season: number, episode: number): HoveredScene | null {
    const ep = combinationScenes.find((e) => e.season === season && e.episode === episode);
    if (!ep || ep.scenes.length === 0) return null;
    const sc = ep.scenes[0];
    // Use the episode aggregate laugh rate (matches what the bar visually shows)
    // rather than just the first scene's rate, which is often 0
    const totalDuration = ep.scenes.reduce((sum, s) => sum + s.duration, 0);
    const totalLaughs = ep.scenes.reduce((sum, s) => sum + s.laughDuration, 0);
    const laughRate = totalDuration > 0 ? totalLaughs / totalDuration : 0;
    return {
      season,
      episode,
      sceneNumber: sc.sceneNumber,
      duration: sc.duration,
      laughDuration: sc.laughDuration,
      laughRate,
    };
  }

  const margin = { top: 36, right: 20, bottom: 16, left: 60 };
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
  const MIN_BAR_H = 2;
  const HIT_TARGET_H = 8;

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

  // ── Vertical layout ───────────────────────────────────────────────────────
  const marginV = { top: 24, right: 16, bottom: 16, left: 16 };
  let innerWidthV = $derived(width - marginV.left - marginV.right);
  let innerHeightV = $derived(height - marginV.top - marginV.bottom);
  let halfW = $derived((innerWidthV - midBand) / 2);
  let yBandScale = $derived(
    scaleBand<string>()
      .domain(allEpisodes.map((ep) => ep.key))
      .range([0, innerHeightV])
      .padding(0.1),
  );
  let xScaleDur = $derived(scaleLinear().domain([0, maxDuration]).range([0, halfW]));
  let xScaleRate = $derived(scaleLinear().domain([0, 1]).range([0, halfW]));
  let seasonBarsV = $derived.by(() => {
    const halfGap = (yBandScale.step() - yBandScale.bandwidth()) / 2;
    return seasons
      .map((season) => {
        const eps = allEpisodes.filter((ep) => ep.season === season.seasonNum);
        if (eps.length === 0) return null;
        const y = Math.max(0, (yBandScale(eps[0].key) ?? 0) - halfGap);
        const lastEp = eps[eps.length - 1];
        const yEnd = Math.min(
          innerHeightV,
          (yBandScale(lastEp.key) ?? 0) + yBandScale.bandwidth() + halfGap,
        );
        return { season: season.seasonNum, y, height: yEnd - y, color: season.accessibleOverDarkColor };
      })
      .filter((d) => d !== null);
  });
</script>

{#if layout === 'vertical'}
  <svg
    {width}
    {height}
    role="presentation"
    onclick={onClosePin}
    onkeydown={() => {}}
    style="cursor: default"
    onmouseleave={() => { onEpisodeHover(null); onSceneHover(null); }}
  >
    <g transform="translate({marginV.left}, {marginV.top})">
      <!-- Section headers -->
      <text x={halfW / 2} y={-8} class="small accent" text-anchor="middle">Duration</text>
      <text x={halfW + midBand + halfW / 2} y={-8} class="small accent" text-anchor="middle">Laugh rate</text>

      <!-- Episodes: one group per row spanning both sections -->
      {#each allEpisodes as ep}
        {@const y = yBandScale(ep.key) ?? 0}
        {@const bh = Math.max(1, yBandScale.bandwidth())}
        {@const isActive = hoveredEpisodeKey === null || hoveredEpisodeKey === ep.key || hoveredEpisodeKey.startsWith(ep.key + '-')}
        <g
          role="presentation"
          opacity={isActive ? 1 : 0.2}
          onmouseenter={() => {
            const s = getFirstScene(ep.season, ep.episode);
            onEpisodeHover(s ? `${s.season}-${s.episode}-${s.sceneNumber}` : ep.key);
            onSceneHover(s);
          }}
          onclick={(e) => {
            e.stopPropagation();
            const s = getFirstScene(ep.season, ep.episode);
            if (s) onSceneClick(s);
          }}
          style="cursor: pointer"
        >
          <!-- Duration bars (extend leftward from center) -->
          {#if ep.totalDuration > 0}
            {@const totalW = Math.max(MIN_BAR_H, xScaleDur(ep.totalDuration))}
            {@const laughW = ep.laughDuration > 0 ? Math.max(MIN_BAR_H, xScaleDur(ep.laughDuration)) : 0}
            <rect x={halfW - totalW} {y} width={totalW} height={bh} fill={BAR_COLOR} opacity="0.3" />
            {#if laughW > 0}
              <rect x={halfW - laughW} {y} width={laughW} height={bh} fill={BAR_COLOR} />
            {/if}
          {/if}
          <!-- Laugh rate bar (extends rightward from center + strip) -->
          {#if ep.laughRate > 0}
            {@const rateW = Math.max(MIN_BAR_H, xScaleRate(ep.laughRate))}
            <rect x={halfW + midBand} {y} width={rateW} height={bh} fill={BAR_COLOR} />
          {/if}
          <!-- Full-row transparent hit target -->
          <rect x={0} {y} width={innerWidthV} height={bh} fill="transparent" />
        </g>
      {/each}

      <!-- Season strip (center vertical band) -->
      {#each seasonBarsV as sb}
        <rect x={halfW} y={sb.y} width={midBand} height={sb.height} fill={sb.color} />
      {/each}
    </g>
  </svg>
{:else}
<svg
  {width}
  {height}
  role="presentation"
  onclick={onClosePin}
  onkeydown={() => {}}
  style="cursor: default"
  onmouseleave={() => { onEpisodeHover(null); onSceneHover(null); }}
>
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
    <g transform="translate(-30, {yScaleTop.range()[1]})">
      <text y={-10} class="small accent" style="transform: rotate(-90deg);">Duration</text>
      <g transform="rotate(180)">
        <ArrowDown />
      </g>
    </g>

    <!-- Top bars: total duration (bg) and laugh duration (fg) -->
    {#each allEpisodes as ep}
      {#if ep.totalDuration > 0}
        {@const totalH = Math.max(MIN_BAR_H, yScaleTop(ep.totalDuration))}
        {@const laughH =
          ep.laughDuration > 0 ? Math.max(MIN_BAR_H, yScaleTop(ep.laughDuration)) : 0}
        {@const hitH = Math.max(HIT_TARGET_H, totalH)}
        <g
          role="presentation"
          opacity={hoveredEpisodeKey !== null && hoveredEpisodeKey !== ep.key && !hoveredEpisodeKey.startsWith(ep.key + '-') ? 0.2 : 1}
          onmouseenter={() => {
            const s = getFirstScene(ep.season, ep.episode);
            onEpisodeHover(s ? `${s.season}-${s.episode}-${s.sceneNumber}` : ep.key);
            onSceneHover(s);
          }}
          onclick={(e) => {
            e.stopPropagation();
            const s = getFirstScene(ep.season, ep.episode);
            if (s) onSceneClick(s);
          }}
          style="cursor: pointer"
        >
          <rect
            x={xScale(ep.key)}
            y={sectionHeight - gap - totalH}
            width={xScale.bandwidth()}
            height={totalH}
            fill={BAR_COLOR}
            opacity="0.3"
          />
          {#if laughH > 0}
            <rect
              x={xScale(ep.key)}
              y={sectionHeight - gap - laughH}
              width={xScale.bandwidth()}
              height={laughH}
              fill={BAR_COLOR}
            />
          {/if}
          <rect
            x={xScale(ep.key)}
            y={sectionHeight - gap - hitH}
            width={xScale.bandwidth()}
            height={hitH}
            fill="transparent"
          />
        </g>
      {/if}
    {/each}

    <!-- ── Legend annotations on first bar ───────────────────────── -->
    {#if allEpisodes.length > 0}
      {@const firstEp = allEpisodes.find((ep) => ep.totalDuration > 0)}
      {#if firstEp}
        {@const barLeft = xScale(firstEp.key) ?? 0}
        {@const barRight = barLeft + xScale.bandwidth()}
        {@const isRightHalf = barLeft > innerWidth / 2}
        {@const anchorX = isRightHalf ? barLeft : barRight}
        {@const dir = isRightHalf ? -1 : 1}
        {@const lineLen = 28}
        {@const totalTop = sectionHeight - gap - yScaleTop(firstEp.totalDuration)}
        {@const laughTop = sectionHeight - gap - yScaleTop(firstEp.laughDuration)}
        {@const textAnchor = isRightHalf ? 'end' : 'start'}

        <!-- Total duration: "Time on screen" -->
        <line
          x1={anchorX - dir * 3}
          y1={totalTop - 4}
          x2={anchorX + dir * lineLen}
          y2={-28}
          stroke="#E71D80"
          stroke-width="1"
        />
        <text
          x={anchorX + dir * (lineLen + 4)}
          y={-28}
          class="small accent"
          dominant-baseline="middle"
          text-anchor={textAnchor}>Time on screen</text
        >

        <!-- Laugh duration: "Time causing laughs" -->
        <line
          x1={anchorX - dir * 3}
          y1={laughTop - 4}
          x2={anchorX + dir * (lineLen + 16)}
          y2={-10}
          stroke="#E71D80"
          stroke-width="1"
        />
        <text
          x={anchorX + dir * (lineLen + 20)}
          y={-10}
          class="small accent"
          dominant-baseline="middle"
          text-anchor={textAnchor}>Time causing laughs</text
        >
      {/if}
    {/if}

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
    <g transform="translate(-30, {yScaleTop.range()[1] + 22})">
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
          {@const rateH = Math.max(MIN_BAR_H, yScaleBottom(ep.laughRate))}
          {@const hitH = Math.max(HIT_TARGET_H, rateH)}
          <g
            role="presentation"
            opacity={hoveredEpisodeKey !== null && hoveredEpisodeKey !== ep.key && !hoveredEpisodeKey.startsWith(ep.key + '-') ? 0.2 : 1}
            onmouseenter={() => {
              const s = getFirstScene(ep.season, ep.episode);
              onEpisodeHover(s ? `${s.season}-${s.episode}-${s.sceneNumber}` : ep.key);
              onSceneHover(s);
            }}
            onclick={(e) => {
              e.stopPropagation();
              const s = getFirstScene(ep.season, ep.episode);
              if (s) onSceneClick(s);
            }}
            style="cursor: pointer"
          >
            <rect
              x={xScale(ep.key)}
              y={0}
              width={xScale.bandwidth()}
              height={rateH}
              fill={BAR_COLOR}
            />
            <rect
              x={xScale(ep.key)}
              y={0}
              width={xScale.bandwidth()}
              height={hitH}
              fill="transparent"
            />
          </g>
        {/if}
      {/each}
    </g>
  </g>
</svg>
{/if}
