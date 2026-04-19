<script lang="ts">
  import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
  import { scaleLinear, scaleSqrt } from 'd3-scale';
  import { max } from 'd3-array';
  import { seasons } from '$lib/data/seasons';
  import type { EpisodeResult } from '../../utils/getCombinationScenes';

  let {
    combinationScenes,
    width = 600,
    height = 160,
  }: {
    combinationScenes: EpisodeResult[];
    width: number;
    height: number;
  } = $props();

  const margin = { top: 16, right: 20, bottom: 24, left: 44 };
  let innerWidth = $derived(width - margin.left - margin.right);
  let innerHeight = $derived(height - margin.top - margin.bottom);

  type SceneNode = {
    id: string;
    season: number;
    episode: number;
    sceneNumber: number;
    duration: number;
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

    const simNodes = flatScenes.map((d) => ({
      ...d,
      r: rScale(d.duration),
      x: xScale(d.laughRate),
      y: innerHeight / 2,
    }));

    type SimNode = (typeof simNodes)[0];

    const sim = forceSimulation(simNodes)
      .force('x', forceX<SimNode>((d) => xScale(d.laughRate)).strength(1))
      .force('y', forceY<SimNode>(innerHeight / 2).strength(0.1))
      .force('collide', forceCollide<SimNode>((d) => d.r + 1).strength(1).iterations(4))
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
</script>

<svg {width} {height}>
  <g transform="translate({margin.left}, {margin.top})">
    <!-- Axis -->
    {#each ticks as t}
      <line
        x1={xScale(t)}
        y1={0}
        x2={xScale(t)}
        y2={innerHeight}
        stroke="#928D90"
        stroke-width="0.5"
        opacity="0.4"
      />
      <text
        class="number"
        x={xScale(t)}
        y={innerHeight + 14}
        text-anchor="middle"
        fill="#928D90"
        font-size="10">{Math.round(t * 100)}%</text
      >
    {/each}

    <text
      class="number"
      x={0}
      y={innerHeight + 14}
      text-anchor="start"
      fill="#928D90"
      font-size="10"
    >
      laugh rate →
    </text>

    <!-- Circles -->
    {#each nodes as node (node.id)}
      <circle
        cx={node.cx}
        cy={node.cy}
        r={node.r}
        fill={seasonColorMap.get(node.season) ?? '#928D90'}
      />
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
