<script>
  import { scaleLinear, scalePoint } from 'd3-scale';
  import { line, area } from 'd3-shape';
  import { mean, max } from 'd3-array';
  import { seasons } from '$lib/data/seasons';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';

  let {
    charData = undefined,
    isScreenTime = true,
    isLaughRate = false,
    showLabels = false,
    yAxisLabels = [],
    showCharBadge = false,
    charId = undefined,
    showMax = false,
    onlyAxes = false,
    containerWidth = undefined,
  } = $props();

  const width = $derived(containerWidth ? containerWidth : 160);

  const height = 180;
  const margin = { top: 14, right: 10, bottom: 10, left: 46 };
  const innerWidth = $derived(width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;

  const averagePerSeason = [];
  if (charData) {
    seasons.forEach((s) => {
      const episodes = charData?.filter((d) => d.season === s.seasonNum);

      const onScreenTimePerEpisode = episodes?.map((e) => {
        const times = new Set();
        for (const d of e.onScreen) times.add(d.eventTimeSeconds);
        return (times.size * 5) / e.duration;
      });
      const avgOnScreenTime = mean(onScreenTimePerEpisode);

      const laughsSharePerEpisode = episodes?.map((e) => {
        const causedTimes = new Set();
        for (const d of e.causesLaughs) causedTimes.add(d.eventTimeSeconds);
        const totalTimes = new Set();
        for (const d of e.episodeLaughs) totalTimes.add(d.eventTimeSeconds);
        return causedTimes.size / totalTimes.size;
      });
      const avgLaughShare = mean(laughsSharePerEpisode);

      const laughRatePerEpisode = episodes?.map((e) => e.causesLaughs.length / e.onScreen.length);
      const avgLaughRate = mean(laughRatePerEpisode);

      averagePerSeason.push({
        season: s.seasonNum,
        onScreen: avgOnScreenTime,
        laughShare: avgLaughShare,
        laughRate: avgLaughRate,
      });
    });
  }

  const maxOnScreenTime = max(averagePerSeason, (d) => d.onScreen);
  const maxLaughShare = max(averagePerSeason, (d) => d.laughShare);
  const maxLaughRate = max(averagePerSeason, (d) => d.laughRate);
  const maxSeasonScreenTime = averagePerSeason?.find((s) => s.onScreen === maxOnScreenTime)?.season;
  const maxSeasonLaughShare = averagePerSeason?.find((s) => s.laughShare === maxLaughShare)?.season;
  const maxSeasonLaughRate = averagePerSeason?.find((s) => s.laughRate === maxLaughRate)?.season;

  const percentageScale = scaleLinear().domain([0, 1]).range([innerHeight, 0]);
  const seasonsScale = $derived(
    scalePoint()
      .domain(seasons.map((s) => `season-${s.seasonNum}`))
      .range([0, innerWidth]),
  );

  const getValue = $derived(
    /** @param {any} d */
    (d) => (isScreenTime ? d.onScreen : isLaughRate ? d.laughRate : d.laughShare),
  );

  const lineGenerator = $derived(
    line()
      .x((d) => seasonsScale(`season-${d.season}`))
      .y((d) => percentageScale(getValue(d))),
  );
  const areaGenerator = $derived(
    area()
      .x((d) => seasonsScale(`season-${d.season}`))
      .y1((d) => percentageScale(getValue(d)))
      .y0(percentageScale(0)),
  );

  const ariaLabel = $derived(
    (charId ? charId.charAt(0).toUpperCase() + charId.slice(1) + "'s " : '') +
    (isScreenTime ? 'screen-time share' : isLaughRate ? 'laugh rate' : 'laugh share') +
    ' per season, Seasons 1 to 9.'
  );
</script>

<div
  class="flex flex-col {showCharBadge ? 'items-center' : 'items-start'}"
  style="margin-left: {showLabels || onlyAxes ? 0 : -46}px;"
>
  <svg {width} height={innerHeight + margin.top + margin.bottom} role="img" aria-label={ariaLabel}>
    <defs>
      <!-- White gradient -->
      <linearGradient id="gradient-white" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#F9F5F7" stop-opacity={0.4} />
        <stop offset="100%" stop-color="#F9F5F7" stop-opacity={0} />
      </linearGradient>
      <!-- Seasons gradient -->
      <linearGradient id="gradient-seasons">
        <stop offset="0%" stop-color="#FDE824" />
        <stop offset="12.5%" stop-color="#B8CE32" />
        <stop offset="25%" stop-color="#7DBA57" />
        <stop offset="37.5%" stop-color="#4CB278" />
        <stop offset="50%" stop-color="#1DA388" />
        <stop offset="62.5%" stop-color="#228A8D" />
        <stop offset="75%" stop-color="#2F708E" />
        <stop offset="87.5%" stop-color="#39578D" />
        <stop offset="100%" stop-color="#453782" />
      </linearGradient>
    </defs>

    <g transform="translate({margin.left}, {margin.top})">
      {#if onlyAxes}
        <!-- 0% -->
        <g transform="translate(0, {percentageScale(0)})">
          <text class="number" x={-8} fill="#F9F5F7" text-anchor="end" dominant-baseline="middle">
            {'0'}
          </text>
          <line
            x1={0}
            x2={innerWidth}
            stroke="#F9F5F7"
            stroke-opacity="0.7"
            stroke-linecap="round"
          />
        </g>
        <!-- 50% -->
        <g transform="translate(0, {percentageScale(0.5)})">
          <text class="number" x={-8} fill="#F9F5F7" text-anchor="end" dominant-baseline="middle">
            {'50%'}
          </text>
          <line
            x1={0}
            x2={innerWidth}
            stroke="#F9F5F7"
            stroke-opacity="0.7"
            stroke-linecap="round"
          />
        </g>
        <!-- 100% -->
        <g transform="translate(0, {percentageScale(1)})">
          <text class="number" x={-8} fill="#F9F5F7" text-anchor="end" dominant-baseline="middle">
            {'100%'}
          </text>
          <line
            x1={0}
            x2={innerWidth}
            stroke="#F9F5F7"
            stroke-opacity="0.7"
            stroke-linecap="round"
          />
        </g>
      {:else}
        {#if showLabels}
          {#each yAxisLabels as label, i}
            <g transform="translate(0, {percentageScale(label)})">
              <line
                x1={0}
                x2={innerWidth}
                stroke="#F9F5F7"
                stroke-opacity="0.7"
                stroke-linecap="round"
              />
              <text
                class="number"
                x={-8}
                fill="#F9F5F7"
                text-anchor="end"
                dominant-baseline="middle"
              >
                {`${label * 100}${i > 0 ? '%' : ''}`}
              </text>
            </g>
          {/each}
        {/if}

        <path d={areaGenerator(averagePerSeason)} fill="url(#gradient-white)" />
        <path
          d={lineGenerator(averagePerSeason)}
          fill="none"
          stroke="url(#gradient-seasons)"
          stroke-width={4}
          stroke-linecap="round"
        />

        {#if showMax}
          {@const maxVal = isScreenTime ? maxOnScreenTime : isLaughRate ? maxLaughRate : maxLaughShare}
          {@const maxSeason = isScreenTime ? maxSeasonScreenTime : isLaughRate ? maxSeasonLaughRate : maxSeasonLaughShare}
          <text
            class="number"
            x={-8}
            y={percentageScale(maxVal)}
            fill="#F9F5F7"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {`${Math.round(maxVal * 100)}%`}
          </text>
          <line
            x1={-4}
            y1={percentageScale(maxVal)}
            x2={seasonsScale(`season-${maxSeason}`)}
            y2={percentageScale(maxVal)}
            stroke="#F9F5F7"
            stroke-linecap="round"
          />
        {/if}
      {/if}
    </g>
  </svg>
  {#if showCharBadge}
    <div
      class="character rounded-full bg-contain bg-center"
      style="background-image: url('{getCharacterImagePath(
        charId,
      )}'); width: 30px; height: 30px; margin-left: {46 - 15}px;"
    ></div>
  {/if}
</div>
