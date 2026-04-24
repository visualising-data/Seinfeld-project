<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import type { HoveredScene } from './ScenesBeeswarm.svelte';

  let {
    scene,
    episodesData,
    activeMainChars,
    activeSuppChars,
    activeLocation,
  }: {
    scene: HoveredScene;
    episodesData: any[];
    activeMainChars: string[];
    activeSuppChars: string[];
    activeLocation: string | null;
  } = $props();

  const LABEL_W = 68;
  const LAUGH_OVERFLOW = 8; // px laugh bars extend beyond bandwidth
  const AXIS_H = 20;

  let containerWidth = $state(200);
  let barWidth = $derived(containerWidth - LABEL_W);

  const allActiveChars = $derived([...activeMainChars, ...activeSuppChars]);

  const charMeta = $derived(
    allActiveChars
      .map((id) => characters.find((c) => c.id === id))
      .filter((c): c is (typeof characters)[0] => !!c),
  );

  const locationLabel = $derived(
    activeLocation
      ? (locations.find((l) => l.id === activeLocation)?.label ?? activeLocation)
      : null,
  );

  // Raw events for this scene
  const sceneEvents = $derived.by(() => {
    const ep = episodesData.find(
      (e: any) => e.season === scene.season && e.episode === scene.episode,
    );
    if (!ep) return [];
    return (ep.data as any[]).filter((e) => +e.sceneNumber === scene.sceneNumber);
  });

  // Time domain
  const timeTicks = $derived(
    [...new Set(sceneEvents.map((e: any) => +e.eventTimeSeconds))].sort((a, b) => a - b),
  );
  const sceneStart = $derived(timeTicks[0] ?? 0);
  const sceneEnd = $derived((timeTicks[timeTicks.length - 1] ?? 0) + 5);

  const xScale = $derived(scaleLinear().domain([sceneStart, sceneEnd]).range([0, barWidth]));
  const laughW = $derived(Math.min(8, Math.max(1, xScale(sceneStart + 5))));
  const axisTicks = $derived(xScale.ticks(4));

  // yScale over active characters
  const vizHeight = $derived(allActiveChars.length * 40 + 8);
  const yScale = $derived(
    scaleBand<string>()
      .domain(allActiveChars)
      .range([4, vizHeight - 4])
      .padding(0.6),
  );

  // Presence: group consecutive time points into continuous intervals
  const charPresence = $derived(
    allActiveChars.map((charId) => {
      const times = sceneEvents
        .filter((e: any) => e.eventCategory === 'CHARACTERS' && e.eventAttribute === charId)
        .map((e: any) => +e.eventTimeSeconds)
        .sort((a: number, b: number) => a - b);

      const intervals: { start: number; duration: number }[] = [];
      if (times.length > 0) {
        let start = times[0];
        let current = times[0];
        for (let i = 1; i < times.length; i++) {
          if (times[i] - current > 5) {
            intervals.push({ start, duration: current - start + 5 });
            start = times[i];
          }
          current = times[i];
        }
        intervals.push({ start, duration: current - start + 5 });
      }
      return { charId, intervals };
    }),
  );

  // Laugh causes: per character (eventAttribute = character who caused it)
  const charLaughs = $derived(
    allActiveChars.map((charId) => ({
      charId,
      times: sceneEvents
        .filter((e: any) => e.eventCategory === 'CAUSES THE LAUGH' && e.eventAttribute === charId)
        .map((e: any) => +e.eventTimeSeconds),
    })),
  );

  const formatDuration = (s: number) =>
    s < 60
      ? `${Math.round(s)}s`
      : `${Math.floor(s / 60)}m${Math.round(s % 60)
          .toString()
          .padStart(2, '0')}s`;
</script>

<div class="flex flex-col gap-5 p-4">
  <!-- Character + location pills -->
  <div class="flex flex-wrap gap-x-3 gap-y-2 items-center">
    {#each charMeta as char}
      {@const img = getCharacterImagePath(char.id)}
      <span class="flex items-center gap-1">
        {#if img}
          <img
            src={img}
            alt={char.label}
            class="w-5 h-5 rounded-full object-cover shrink-0"
            style="border: 2px solid {char.color}"
          />
        {/if}
        <span class="small">{char.label}</span>
      </span>
    {/each}
    {#if locationLabel}
      <span class="small accent">@ {locationLabel}</span>
    {/if}
  </div>

  <!-- Stats -->
  <div class="flex flex-col gap-1">
    <p class="small accent">
      S{scene.season.toString().padStart(2, '0')} E{scene.episode.toString().padStart(2, '0')} · Scene
      {scene.sceneNumber}
    </p>
    <p class="small">Duration: <span class="number">{formatDuration(scene.duration)}</span></p>
    <p class="small">
      Time causing laughs: <span class="number">{formatDuration(scene.laughDuration)}</span>
    </p>
    <p class="small">
      Laugh rate: <span class="number">{Math.round(scene.laughRate * 100)}%</span>
    </p>
  </div>

  <!-- Mini scene viz -->
  <div bind:clientWidth={containerWidth}>
    <svg width={containerWidth} height={vizHeight + AXIS_H}>
      <!-- Character labels -->
      {#each allActiveChars as charId}
        {@const char = characters.find((c) => c.id === charId)}
        {@const cy = (yScale(charId) ?? 0) + yScale.bandwidth() / 2}
        <text
          x={LABEL_W - 4}
          y={cy}
          font-size="10"
          fill="#DDDBDC"
          text-anchor="end"
          dominant-baseline="middle">{char?.label ?? charId}</text
        >
      {/each}

      <g transform="translate({LABEL_W}, 0)">
        <!-- Background rails -->
        {#each allActiveChars as charId}
          <rect
            x={0}
            y={yScale(charId)}
            width={barWidth}
            height={yScale.bandwidth()}
            fill="#DDDBDC"
            opacity="0.1"
          />
        {/each}

        <!-- Presence intervals (like PresenceOnScreen) -->
        {#each charPresence as { charId, intervals }}
          {@const char = characters.find((c) => c.id === charId)}
          <g transform="translate(0, {yScale(charId)})">
            {#each intervals as interval}
              <rect
                x={xScale(interval.start)}
                y={0}
                width={xScale(interval.start + interval.duration) - xScale(interval.start)}
                height={yScale.bandwidth()}
                fill={char?.color ?? '#928D90'}
              />
            {/each}
          </g>
        {/each}

        <!-- Laugh cause bars (like CausedLaughs — taller, per-character colored, white stroke) -->
        {#each charLaughs as { charId, times }}
          {@const char = characters.find((c) => c.id === charId)}
          <g transform="translate(0, {yScale(charId)})">
            {#each times as t}
              <rect
                x={xScale(t)}
                y={-LAUGH_OVERFLOW}
                width={laughW}
                height={yScale.bandwidth() + LAUGH_OVERFLOW * 2}
                fill={char?.color ?? '#928D90'}
                stroke="#F9F5F7"
                stroke-width="0.5"
              />
            {/each}
          </g>
        {/each}
      </g>

      <!-- Time axis -->
      <g transform="translate({LABEL_W}, {vizHeight})">
        <line x1={0} y1={0} x2={barWidth} y2={0} stroke="#DDDBDC" stroke-opacity="0.3" />
        {#each axisTicks as tick}
          {@const x = xScale(tick)}
          <line x1={x} y1={0} x2={x} y2={4} stroke="#DDDBDC" stroke-opacity="0.5" />
          <text
            {x}
            y={7}
            font-size="9"
            fill="#DDDBDC"
            text-anchor="middle"
            dominant-baseline="hanging">{formatDuration(tick)}</text
          >
        {/each}
      </g>
    </svg>
  </div>
</div>
