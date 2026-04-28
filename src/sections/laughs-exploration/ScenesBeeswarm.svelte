<script lang="ts">
  import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
  import { scaleLinear, scaleSqrt } from 'd3-scale';
  import { max } from 'd3-array';
  import { seasons } from '$lib/data/seasons';
  import type { EpisodeResult } from '../../utils/getCombinationScenes';

  import ArrowDown from '../../icons/ArrowDown.svelte';

  export type HoveredScene = {
    season: number;
    episode: number;
    sceneNumber: number;
    duration: number;
    laughDuration: number;
    laughRate: number;
  };

  let {
    combinationScenes,
    width = 600,
    height = 160,
    hoveredEpisodeKey = null,
    layout = 'horizontal' as 'horizontal' | 'vertical',
    onEpisodeHover = () => {},
    onSceneHover = () => {},
    onSceneClick = () => {},
    onClosePin = () => {},
  }: {
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

  const margin = { top: 16, right: 20, bottom: 40, left: 60 };
  const marginV = { top: 16, right: 16, bottom: 16, left: 40 };
  let activeMargin = $derived(layout === 'vertical' ? marginV : margin);
  let innerWidth = $derived(width - activeMargin.left - activeMargin.right);
  let innerHeight = $derived(height - activeMargin.top - activeMargin.bottom);

  type SceneNode = {
    id: string;
    season: number;
    episode: number;
    sceneNumber: number;
    duration: number;
    laughDuration: number;
    laughRate: number;
    r: number;
    x: number;
    y: number;
  };

  let flatScenes = $derived.by((): SceneNode[] => {
    const all: SceneNode[] = [];
    combinationScenes.forEach((ep: EpisodeResult) => {
      ep.scenes.forEach((sc) => {
        all.push({
          id: `${ep.season}-${ep.episode}-${sc.sceneNumber}`,
          season: ep.season,
          episode: ep.episode,
          sceneNumber: sc.sceneNumber,
          duration: sc.duration,
          laughDuration: sc.laughDuration,
          laughRate: sc.laughRate,
          r: 0,
          x: 0,
          y: innerHeight / 2,
        });
      });
    });
    return all;
  });

  let maxDuration = $derived(max(flatScenes, (d) => d.duration) ?? 1);

  let rScale = $derived(scaleSqrt().domain([0, maxDuration]).range([2, 18]));

  let xScale = $derived(scaleLinear().domain([0, 1]).range([0, innerWidth]));
  let yScaleV = $derived(scaleLinear().domain([0, 1]).range([0, innerHeight]));

  let seasonColorMap = $derived(
    new Map(seasons.map((s) => [s.seasonNum, s.accessibleOverDarkColor])),
  );

  type PositionedNode = SceneNode & { cx: number; cy: number };
  let nodes = $state<PositionedNode[]>([]);

  $effect(() => {
    if (flatScenes.length === 0) {
      nodes = [];
      return;
    }

    const isVertical = layout === 'vertical';

    const simNodes = flatScenes.map((d) => ({
      ...d,
      r: rScale(d.duration),
      x: isVertical ? innerWidth / 2 : xScale(d.laughRate),
      y: isVertical ? yScaleV(d.laughRate) : innerHeight / 2,
    }));

    type SimNode = (typeof simNodes)[0];

    const sim = forceSimulation(simNodes)
      .force(
        'x',
        isVertical
          ? forceX<SimNode>(innerWidth / 2).strength(0.1)
          : forceX<SimNode>((d) => xScale(d.laughRate)).strength(1),
      )
      .force(
        'y',
        isVertical
          ? forceY<SimNode>((d) => yScaleV(d.laughRate)).strength(1)
          : forceY<SimNode>(innerHeight / 2).strength(0.1),
      )
      .force(
        'collide',
        forceCollide<SimNode>((d) => d.r + 1)
          .strength(1)
          .iterations(4),
      )
      .stop();

    for (let i = 0; i < 300; i++) {
      sim.tick();
      for (const d of simNodes) {
        d.x = Math.max(d.r, Math.min(innerWidth - d.r, d.x));
        d.y = Math.max(d.r, Math.min(innerHeight - d.r, d.y));
      }
    }

    nodes = simNodes.map((d) => ({ ...d, cx: d.x, cy: d.y }));
  });

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const legendRScale = scaleSqrt().domain([0, 300]).range([2, 18]);
  const legendSizes = [
    { r: legendRScale(30), label: '30s' },
    { r: legendRScale(120), label: '2min' },
    { r: legendRScale(300), label: '5min' },
  ];
  const legendRMax = legendRScale(300);
  const legendLineLen = 20;
</script>

<svg
  {width}
  {height}
  role="presentation"
  onclick={onClosePin}
  onkeydown={() => {}}
  style="cursor: default"
  onmouseleave={() => {
    onEpisodeHover(null);
    onSceneHover(null);
  }}
>
  <g transform="translate({activeMargin.left}, {activeMargin.top})">
    {#if layout === 'vertical'}
      <!-- Horizontal grid lines + left-side labels -->
      {#each ticks as t}
        <line x1={0} y1={yScaleV(t)} x2={innerWidth} y2={yScaleV(t)} stroke="#DDDBDC" />
        <text
          class="number"
          x={-4}
          y={yScaleV(t)}
          text-anchor="end"
          dominant-baseline="middle"
          fill="#12020A"
          font-size="10">{Math.round(t * 100)}%</text
        >
      {/each}
      <!-- Left axis label (rotated) -->
      <text
        transform="translate({-activeMargin.left + 12}, {28}) rotate(-90)"
        class="small accent"
        text-anchor="middle">Laugh rate</text
      >
    {:else}
      <!-- Vertical grid lines + bottom labels -->
      {#each ticks as t}
        <line x1={xScale(t)} y1={0} x2={xScale(t)} y2={innerHeight} stroke="#DDDBDC" />
        <text
          class="number"
          x={xScale(t)}
          y={innerHeight + 16}
          text-anchor="middle"
          fill="#12020A"
          font-size="10">{Math.round(t * 100)}%</text
        >
      {/each}
      <!-- Bottom axis label -->
      <g transform="translate(0, {innerHeight + 44})">
        <text y={-10} class="small accent">Laugh rate</text>
        <g transform="translate(78, -11) rotate(-90)">
          <ArrowDown />
        </g>
      </g>
    {/if}

    <!-- Circles -->
    {#each nodes as node (node.id)}
      {@const epKey = `${node.season}-${node.episode}-${node.sceneNumber}`}
      <circle
        cx={node.cx}
        cy={node.cy}
        r={node.r}
        fill={seasonColorMap.get(node.season) ?? '#928D90'}
        opacity={hoveredEpisodeKey !== null && hoveredEpisodeKey !== epKey ? 0.2 : 1}
        role="presentation"
        onmouseenter={() => {
          onEpisodeHover(epKey);
          onSceneHover({
            season: node.season,
            episode: node.episode,
            sceneNumber: node.sceneNumber,
            duration: node.duration,
            laughDuration: node.laughDuration,
            laughRate: node.laughRate,
          });
        }}
        onclick={(e) => {
          e.stopPropagation();
          onSceneClick({
            season: node.season,
            episode: node.episode,
            sceneNumber: node.sceneNumber,
            duration: node.duration,
            laughDuration: node.laughDuration,
            laughRate: node.laughRate,
          });
        }}
        style="cursor: pointer"
      />
    {/each}

    <!-- ── Size legend (concentric circles) ─────────────────────── -->
    {#each [...legendSizes].reverse() as size}
      <circle
        cx={innerWidth - legendRMax - 30}
        cy={legendRMax * 2 + 4 - size.r}
        r={size.r}
        fill="#BEBABC"
        fill-opacity="0.2"
        stroke="#BEBABC"
      />
    {/each}
    {#each legendSizes as size, i}
      {@const lx = innerWidth - legendRMax - 30}
      {@const topY = legendRMax * 2 + 4 - size.r * 2}
      <line
        x1={lx + 4}
        y1={topY}
        x2={lx + legendLineLen}
        y2={topY + (i === 0 ? 4 : i === legendSizes.length - 1 ? -4 : 0)}
        stroke="#E71D80"
        stroke-width="1"
      />
      <text
        x={lx + legendLineLen + 4}
        y={topY + (i === 0 ? 6 : i === legendSizes.length - 1 ? -4 : 0)}
        class="small accent"
        dominant-baseline="middle"
        text-anchor="start">{size.label}</text
      >
    {/each}

    {#if flatScenes.length === 0}
      <text
        class="small"
        x={innerWidth / 2}
        y={innerHeight / 2}
        text-anchor="middle"
        fill="#928D90"
        font-size="11">No scenes match this combination</text
      >
    {/if}
  </g>
</svg>
