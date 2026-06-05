<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import { episodesInfo } from '$lib/data/episodesInfo';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
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

  const LABEL_W = 150;
  const LAUGH_OVERFLOW = 8; // px laugh bars extend beyond bandwidth
  const AXIS_H = 24;

  let containerWidth = $state(200);
  let barWidth = $derived(containerWidth - LABEL_W);

  const allActiveChars = $derived([...activeMainChars, ...activeSuppChars]);

  const episodeTitle = $derived(
    episodesInfo.find((e) => e.season === scene.season && e.episode === scene.episode)?.title ??
      null,
  );

  // Raw events for this scene
  const sceneEvents = $derived.by(() => {
    const ep = episodesData.find(
      (e: any) => e.season === scene.season && e.episode === scene.episode,
    );
    if (!ep) return [];
    return (ep.data as any[]).filter((e) => +e.sceneNumber === scene.sceneNumber);
  });

  // All unique characters/locations present in the scene
  const allSceneCharIds = $derived([
    ...new Set(
      sceneEvents
        .filter((e: any) => e.eventCategory === 'CHARACTERS')
        .map((e: any) => e.eventAttribute as string),
    ),
  ]);

  const allSceneLocationIds = $derived([
    ...new Set(
      sceneEvents
        .filter((e: any) => e.eventCategory === 'LOCATION')
        .map((e: any) => e.eventAttribute as string),
    ),
  ]);

  const sceneLocationIdSet = $derived(new Set(allSceneLocationIds));

  const otherSceneCharIds = $derived(allSceneCharIds.filter((id) => !allActiveChars.includes(id)));

  // Active chars first, then other scene chars, then locations (active first)
  const vizDomain = $derived.by(() => {
    const orderedLocs = activeLocation
      ? [activeLocation, ...allSceneLocationIds.filter((id) => id !== activeLocation)]
      : allSceneLocationIds;
    return [...allActiveChars, ...otherSceneCharIds, ...orderedLocs];
  });

  const allSceneCharsOrdered = $derived([...allActiveChars, ...otherSceneCharIds]);

  // Time domain
  const timeTicks = $derived(
    [...new Set(sceneEvents.map((e: any) => +e.eventTimeSeconds))].sort((a, b) => a - b),
  );
  const sceneStart = $derived(timeTicks[0] ?? 0);
  const sceneEnd = $derived((timeTicks[timeTicks.length - 1] ?? 0) + 5);

  const sceneDuration = $derived(sceneEnd - sceneStart);
  // Shrink viz width so a 5s laugh bar never exceeds 20px
  const vizBarWidth = $derived(Math.min(barWidth, (20 * sceneDuration) / 5));
  const xScale = $derived(scaleLinear().domain([sceneStart, sceneEnd]).range([0, vizBarWidth]));
  const laughW = $derived(xScale(sceneStart + 5) - xScale(sceneStart));

  // yScale over active characters + optional location
  const vizHeight = $derived(vizDomain.length * 46 + 8);
  const yScale = $derived(
    scaleBand<string>()
      .domain(vizDomain)
      .range([4, vizHeight - 4])
      .padding(0.66),
  );

  const allLocationPresences = $derived(
    allSceneLocationIds.map((locId) => {
      const times = sceneEvents
        .filter((e: any) => e.eventCategory === 'LOCATION' && e.eventAttribute === locId)
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
      return { locId, intervals };
    }),
  );

  // Presence: group consecutive time points into continuous intervals
  const charPresence = $derived(
    allSceneCharsOrdered.map((charId) => {
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
    allSceneCharsOrdered.map((charId) => ({
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

<div class="flex flex-col gap-4 px-4 lg:px-0 pb-4 lg:pb-0">
  <!-- Header -->
  <div class="flex flex-col gap-1">
    {#if episodeTitle}
      <h4 class="mt-4 lg:mt-0 text-[24px] lg:text-[42px] leading-[1.1]">
        S{scene.season.toString().padStart(2, '0')} E{scene.episode.toString().padStart(2, '0')} Scene
        {scene.sceneNumber}
      </h4>
    {/if}
    <div class="font-semibold text-[1rem] lg:text-[1.25rem]">
      {episodeTitle}
    </div>
  </div>

  <!-- Stats grid -->
  <div class="grid grid-cols-3 gap-2">
    <div>
      <div class="font-semibold text-[1.2rem] lg:text-[1.5rem] leading-tight">
        {formatDuration(scene.duration)}
      </div>
      <div class="text-[0.8rem] text-[#928D90]">Duration</div>
    </div>
    <div>
      <div class="font-semibold text-[1.2rem] lg:text-[1.5rem] leading-tight">
        {formatDuration(scene.laughDuration)}
      </div>
      <div class="text-[0.8rem] text-[#928D90]">Causing laughs</div>
    </div>
    <div>
      <div class="font-semibold text-[1.2rem] lg:text-[1.5rem] leading-tight">
        {Math.round(scene.laughRate * 100)}%
      </div>
      <div class="text-[0.8rem] text-[#928D90]">Laugh rate</div>
    </div>
  </div>

  <!-- Mini scene viz -->
  <div class="border-t border-[#DDDBDC] pt-3" bind:clientWidth={containerWidth}>
    <svg width={containerWidth} height={vizHeight + AXIS_H}>
      <!-- Character + location labels (left side: text then icon, right-aligned to bars) -->
      {#each vizDomain as itemId}
        {@const isLoc = sceneLocationIdSet.has(itemId)}
        {@const char = isLoc ? null : characters.find((c) => c.id === itemId)}
        {@const iconPath = isLoc ? getLocationIconPath(itemId) : getCharacterImagePath(itemId)}
        {@const label = isLoc
          ? (locations.find((l) => l.id === itemId)?.label ?? itemId)
          : (char?.label ?? itemId)}
        {@const cy = (yScale(itemId) ?? 0) + yScale.bandwidth() / 2}
        <clipPath id="clip-label-{itemId.replace(/[^\w]/g, '-')}">
          <circle cx={LABEL_W - 8 - 16} {cy} r={16} />
        </clipPath>
        <image
          href={iconPath}
          x={LABEL_W - 8 - 32}
          y={cy - 16}
          width={32}
          height={32}
          clip-path="url(#clip-label-{itemId.replace(/[^\w]/g, '-')})"
          preserveAspectRatio="xMidYMid slice"
        />
        <text
          x={LABEL_W - 8 - 32 - 8}
          y={cy}
          font-size="14"
          fill="#12020A"
          text-anchor="end"
          dominant-baseline="middle">{label}</text
        >
      {/each}

      <!-- Time axis -->
      <g transform="translate({LABEL_W}, {vizHeight})">
        <line x1={0} y1={0} x2={vizBarWidth} y2={0} stroke="#DDDBDC" />
        <line x1={0} y1={-vizHeight} x2={0} y2={10} stroke="#DDDBDC" />
        <line x1={vizBarWidth} y1={-vizHeight} x2={vizBarWidth} y2={10} stroke="#DDDBDC" />
        <text
          class="number text-[0.825rem]"
          x={vizBarWidth < 50 ? -4 : 4}
          y={7}
          fill="#12020A"
          text-anchor={vizBarWidth < 50 ? 'end' : 'start'}
          dominant-baseline="hanging">{formatDuration(sceneStart)}</text
        >
        <text
          class="number text-[0.825rem]"
          x={vizBarWidth < 50 ? vizBarWidth + 4 : vizBarWidth - 4}
          y={7}
          fill="#12020A"
          text-anchor={vizBarWidth < 50 ? 'start' : 'end'}
          dominant-baseline="hanging">{formatDuration(sceneEnd)}</text
        >
      </g>

      <g transform="translate({LABEL_W}, 0)">
        <!-- Background rails -->
        {#each vizDomain as charId}
          <rect
            x={0}
            y={yScale(charId)}
            width={vizBarWidth}
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

        <!-- Location presence -->
        {#each allLocationPresences as { locId, intervals }}
          <g transform="translate(0, {yScale(locId)})">
            {#each intervals as interval}
              <rect
                x={xScale(interval.start)}
                y={0}
                width={xScale(interval.start + interval.duration) - xScale(interval.start)}
                height={yScale.bandwidth()}
                fill="#12020A"
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
                stroke-width="1"
              />
            {/each}
          </g>
        {/each}
      </g>
    </svg>
  </div>
</div>
