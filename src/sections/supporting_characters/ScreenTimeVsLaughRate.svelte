<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { max, sum } from 'd3-array';
  import { episodesInfo } from '$lib/data/episodesInfo';
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import { seasons, totalNumEpisodes } from '$lib/data/seasons';
  import { formatTimeLabel } from '../../utils/formatTime';
  import Toggle from './Toggle.svelte';
  import HelpIcon from '../../icons/HelpIcon.svelte';
  import ArrowDown from '../../icons/ArrowDown.svelte';
  import SeasonsStripSingle from '../../UI/SeasonsStripSingle.svelte';
  import EpisodeTooltip from '../../UI/EpisodeTooltip.svelte';

  let { episodesData, currentSection } = $props();

  let innerWidth = $state(1600);

  let currentChars = $derived.by(() => {
    switch (currentSection) {
      case "supporting_chars":
        return characters.slice(4, characters.length - 1);
      case "locations":
        return locations;
      default:
        return characters.slice(0, 3);
    }
  });
  let activeCharacter = $state(currentSection === 'locations' ? "Jerry's home" : "Jerry's family");

  const FILTER = {
    SCREEN_TIME: 'screenTime',
    LAUGHS: 'causesLaughs'
  }
  let activeFilter = $state(FILTER.SCREEN_TIME);

  const handleCharacterClick = (char) => {
    activeCharacter = char.id;
  }

  let visualizationsWidth = $state(800);
  const episodesOverviewWidth = 150;
  const marginEnd = 22;
  let episodeDetailsWidth = $derived(visualizationsWidth - episodesOverviewWidth);
  let visualizationsContainerHeight = $state(800);
  let visualizationsHeight = $derived(visualizationsContainerHeight - 50 - 16);

  const margin = { top: 30, right: 100, bottom: 34, left: 14 + 25 };
  let episodeDetailsInnerWidth = $derived(episodeDetailsWidth - margin.left - margin.right);
  let visualizationsInnerHeight = $derived(visualizationsHeight - margin.top - margin.bottom);

  let episodesVerticalScale = $derived(
    scaleBand()
      .domain(episodesInfo.map(d => `${d.season}-${d.episode}`))
      .range([0, visualizationsInnerHeight])
  );
  let episodeMaxDuration = $derived(max(episodesData, d => d.duration) ?? 0);
  let episodeTimeScale = $derived(
    scaleLinear()
        .domain([0, episodeMaxDuration])
        .range([0, episodeDetailsInnerWidth])
  );
  let seasonScale = $derived(
		scaleLinear()
			.domain([0, totalNumEpisodes])
			.range([0, visualizationsInnerHeight])
	);
  let episodeOverviewScale = $derived(
		scaleLinear()
			.domain([0, 1])
			.range([0, episodesOverviewWidth - marginEnd])
	);

  const timeLabels = [0, 5, 10, 15, 20, 25, 30];
  const overviewLabels = [0, 100];

  let charData = $derived.by(() => {
    const breakdown = [];

    episodesData.forEach(episode => {
      const onScreen = [];
      const aggregatedScreenTime = [];
      const causesLaughs = [];
      const aggregatedLaughs = [];

      episode.data.forEach(d => {
        if ((currentSection === "locations" ? d.eventCategory === 'LOCATION' : d.eventCategory === 'CHARACTERS') && d.eventAttribute.includes(activeCharacter)) {
          onScreen.push(d)

          const time = d.eventTimeSeconds;
          if (currentSection === "locations" && episode.data.find(e => e.eventCategory === 'CAUSES THE LAUGH' && e.eventTimeSeconds === time)) {
            causesLaughs.push(episode.data.find(e => e.eventCategory === 'CAUSES THE LAUGH' && e.eventTimeSeconds === time))
          }
        }

        if (currentSection !== "locations" && d.eventCategory === 'CAUSES THE LAUGH' && d.eventAttribute.includes(activeCharacter)) {
          causesLaughs.push(d)
        }

      })

      let start
      let currentTime
      onScreen.forEach(d => {
        if (!start && !currentTime) {
          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
        } else if (+d.eventTimeSeconds === currentTime + 5) {
          currentTime = +d.eventTimeSeconds
        } else if (+d.eventTimeSeconds > currentTime + 5) {
          aggregatedScreenTime.push({
            start: start,
            duration: currentTime - start + 5
          })
          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
        }
      })

      start = undefined
      currentTime = undefined
      causesLaughs.forEach(d => {
        if (!start && !currentTime) {
          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
        } else if (+d.eventTimeSeconds === currentTime + 5) {
          currentTime = +d.eventTimeSeconds
        } else if (+d.eventTimeSeconds > currentTime + 5) {
          aggregatedLaughs.push({
            start: start,
            duration: currentTime - start + 5
          })
          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
        }
      })

      breakdown.push({
        season: episode.season,
        episode: episode.episode,
        duration: episode.duration,
        onScreen: aggregatedScreenTime,
        causesLaughs: aggregatedLaughs
      })
    })

    return breakdown;
  });

  let isMouseOver = $state(false);
  let highlightedEpisode = $state('');
  let highlightedEpisodeInfo = $state();
  let highlightedEpisodeOverviewPercentage = $state(0);
  let highlightedEpisodeTimePosition = $state(0);
  let highlightedEpisodeTimeLabel = $state('');
  let episodeTooltipPosition = $state();
  const handleOverviewMouseEnter = () => {
    isMouseOver = true;
  }
  const handleMouseMove = (/** @type {MouseEvent & { currentTarget: EventTarget & SVGRectElement; }} */ e) => {
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
    const data = charData.find(e => e.season === episode.season && e.episode === episode.episode);
    highlightedEpisodeOverviewPercentage = Math.round((data[activeFilter === FILTER.SCREEN_TIME ? 'onScreen' : 'causesLaughs'].reduce((acc, value) => acc + value.duration, 0)) / data?.duration * 100) ?? undefined;

    const newXPosition = x <= episodeDetailsInnerWidth ? Math.round(x) : 0;
    if (highlightedEpisodeTimePosition !== newXPosition) {
      highlightedEpisodeTimePosition = newXPosition;
    }
    const timeInSeconds = x <= episodeDetailsInnerWidth ? Math.round(episodeTimeScale.invert(x)) : 0;
    const newTimeLabel = formatTimeLabel(timeInSeconds)
    if (highlightedEpisodeTimeLabel !== newTimeLabel) {
      highlightedEpisodeTimeLabel = formatTimeLabel(timeInSeconds)
    }

    episodeTooltipPosition = [-58, y];
  }
  const handleOverviewMouseLeave = () => {
    isMouseOver = false;
  }
</script>

<svelte:window bind:innerWidth />

<div class="mt-20 mb-52">
  <div class="container">
    <h3 class="my-8">Screen time vs laughter rate</h3>
    <div class="grid grid-cols-12 md:gap-20">
      <div class="col-span-12 md:col-span-3 flex flex-col items-center relative">
        <div class="small flex items-center gap-2 mb-6" style="max-width: 320px;">
          <span class="shrink"><HelpIcon color="#E71D80" /></span>
          <span class="relative top-1">{`Select a ${currentSection === 'locations' ? 'location' : 'character'} to explore their screen time and laughter rate.`}</span>
        </div>

        <ul class="grid grid-cols-2 gap-6 flex-wrap">
          {#each currentChars as char}
            <li class="flex justify-center">
              <button 
                class="character-button flex flex-col items-center max-w-28 {activeCharacter === char.id ? 'active' : ''}"
                onclick={() => handleCharacterClick(char)}>
                <div class="character rounded-full bg-contain bg-center opacity-50" 
                    style="background-image: url('{currentSection === "locations" ? getLocationIconPath(char.id) : getCharacterImagePath(char.id)}'); width: 75px; height: 75px;"></div>
                <div class="text-center pt-1" style="font-size: 1.25rem; line-height: 1.2;">{char.label}</div>
              </button>
            </li>
          {/each}
        </ul>

        {#if isMouseOver && innerWidth >= 793}
          <EpisodeTooltip episode={highlightedEpisodeInfo} position={episodeTooltipPosition} />
        {/if}
      </div>

      <div class="col-span-12 md:col-span-9" bind:clientHeight={visualizationsContainerHeight}>
        <Toggle bind:activeFilter />
        <div class="flex" bind:clientWidth={visualizationsWidth}>
          <!-- Episode details -->
          <svg width={visualizationsWidth} height={visualizationsHeight}>
            <!-- Episode details -->
            <g transform="translate(0, {margin.top})">
              <text text-anchor="end" style="transform: translate(10px, 0px) rotate(-90deg); transform-origin: 0 0;" class="small accent">Episodes</text>
              <g transform="translate(3, 64)">
                <ArrowDown />
              </g>
              <g transform="translate(14, 0)">
                <SeasonsStripSingle height={visualizationsInnerHeight} />
              </g>
            </g>

            <!-- Background to detect mouse events -->
            <g transform="translate({margin.left}, {margin.top})">
              <rect
                x={0}
                y={0}
                width={visualizationsWidth - margin.left}
                height={visualizationsInnerHeight}
                fill="#F9F5F7"
                role="document"
                onmouseenter={handleOverviewMouseEnter}
                onmousemove={(e) => handleMouseMove(e)}
                onmouseleave={handleOverviewMouseLeave}
              />
            </g>

            <!-- Season separators -->
            <g transform="translate({margin.left}, {margin.top})" class="pointer-events-none">
              {#each seasons as season, i}
                {#if i < seasons.length - 1}
                  <line
                    x1={0}
                    y1={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes)) + seasonScale(season.numEpisodes)}
                    x2={visualizationsWidth - margin.left}
                    y2={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes)) + seasonScale(season.numEpisodes)}
                    stroke="#928D90"
                  />
                {/if}
              {/each}
            </g>

            <g transform="translate({margin.left}, {margin.top})">
              <!-- Time labels -->
              {#each timeLabels as timeLabel}
                <g transform="translate({episodeTimeScale(timeLabel * 60)}, 0)" class="pointer-events-none">
                  <line
                    x1={0}
                    y1={-12}
                    x2={0}
                    y2={visualizationsInnerHeight + 12}
                    stroke="#928D90"
                  />
                  <g class="number" fill="#928D90" text-anchor="middle" fill-opacity={isMouseOver ? 0.3 : 1}>
                    <text
                      x={0}
                      y={-18}
                    >
                      {`${timeLabel === 0 || timeLabel === 5 ? '0' : ''}${timeLabel}:00`}
                    </text>
                    <text
                      x={0}
                      y={visualizationsInnerHeight + 16}
                      dominant-baseline="hanging"
                    >
                      {`${timeLabel === 0 || timeLabel === 5 ? '0' : ''}${timeLabel}:00`}
                    </text>
                  </g>
                </g>
              {/each}

              {#each charData as d}
                <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
                  <!-- Episode durations -->
                  <rect
                    class="pointer-events-none"
                    x={0}
                    y={0}
                    width={episodeTimeScale(d.duration)}
                    height={episodesVerticalScale.bandwidth()}
                    fill="#BEBABC"
                    fill-opacity={(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                  />

                  <!-- Screen time -->
                  {#each d.onScreen as screenMoment}
                    <rect
                      class="pointer-events-none"
                      x={episodeTimeScale(screenMoment.start)}
                      y={0}
                      width={episodeTimeScale(screenMoment.duration)}
                      height={episodesVerticalScale.bandwidth()}
                      fill={characters.find(char => char.id === activeCharacter)?.color}
                      fill-opacity={activeFilter === FILTER.LAUGHS ? 0.3 : (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                    />
                  {/each}

                  <!-- Laughs -->
                  {#if activeFilter === FILTER.LAUGHS}
                    {#each d.causesLaughs as screenMoment}
                      <rect
                        class="pointer-events-none"
                        x={episodeTimeScale(screenMoment.start)}
                        y={0}
                        width={episodeTimeScale(screenMoment.duration)}
                        height={episodesVerticalScale.bandwidth()}
                        fill={characters.find(char => char.id === activeCharacter)?.color}
                        fill-opacity={(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                      />
                    {/each}
                  {/if}
                </g>
              {/each}

              <!-- Time tooltip -->
              {#if isMouseOver}
                <g transform="translate({highlightedEpisodeTimePosition}, 0)" class="pointer-events-none">
                  <line
                    x1={0}
                    y1={-12}
                    x2={0}
                    y2={visualizationsInnerHeight + 12}
                    stroke="#12020A"
                    stroke-width={2}
                  />
                  <g class="number" fill="#12020A" text-anchor="middle">
                    <text
                      x={0}
                      y={-18}
                    >
                      {highlightedEpisodeTimeLabel}
                    </text>
                    <text
                      x={0}
                      y={visualizationsInnerHeight + 16}
                      dominant-baseline="hanging"
                    >
                      {highlightedEpisodeTimeLabel}
                    </text>
                  </g>
                </g>
              {/if}
            </g>

            <!-- Episode overviews -->
            <g transform="translate({visualizationsWidth - episodesOverviewWidth}, {margin.top})">
              <rect
                class="pointer-events-none"
                x={0}
                y={0}
                width={episodesOverviewWidth - marginEnd}
                height={visualizationsInnerHeight}
                fill="#BEBABC"
                fill-opacity={isMouseOver ? 0.3 : 1}
              />
              <!-- Vertical Axes -->
              {#each overviewLabels as overviewLabel}
                <g transform="translate({episodeOverviewScale(overviewLabel / 100)}, 0)" class="pointer-events-none">
                  <line
                    x1={0}
                    y1={-12}
                    x2={0}
                    y2={visualizationsInnerHeight + 12}
                    stroke="#928D90"
                  />
                  <g class="number" fill="#928D90" text-anchor="middle" fill-opacity={isMouseOver ? 0.3 : 1}>
                    <text
                      x={0}
                      y={-18}
                    >
                      {`${overviewLabel}%`}
                    </text>
                    <text
                      x={0}
                      y={visualizationsInnerHeight + 16}
                      dominant-baseline="hanging"
                    >
                      {`${overviewLabel}%`}
                    </text>
                  </g>
                </g>
              {/each}

              {#each charData as d}
                <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
                  {#if activeFilter === FILTER.SCREEN_TIME}
                    <!-- Screen time -->
                    {#if episodeOverviewScale((d.onScreen.length * 5) / d.duration)}
                      <rect
                        class="pointer-events-none"
                        x={0}
                        y={0}
                        width={episodeOverviewScale((d.onScreen.reduce((acc, value) => acc + value.duration, 0)) / d.duration)}
                        height={episodesVerticalScale.bandwidth()}
                        fill={characters.find(char => char.id === activeCharacter)?.color}
                        fill-opacity={activeFilter === FILTER.LAUGHS ? 0.3 : (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                      />
                    {/if}
                  {:else}
                    <!-- Laugh rate -->
                    {#if episodeOverviewScale((d.causesLaughs.length * 5) / d.duration)}
                     <rect
                       class="pointer-events-none"
                       x={0}
                       y={0}
                       width={episodeOverviewScale((d.causesLaughs.reduce((acc, value) => acc + value.duration, 0)) / d.duration)}
                       height={episodesVerticalScale.bandwidth()}
                       fill={characters.find(char => char.id === activeCharacter)?.color}
                       fill-opacity={(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                     />
                    {/if}
                  {/if}
                </g>
              {/each}

              <!-- Overview tooltip -->
              {#if isMouseOver}
                <g transform="translate({episodeOverviewScale(highlightedEpisodeOverviewPercentage / 100)}, 0)">
                  <line
                    x1={0}
                    y1={-12}
                    x2={0}
                    y2={visualizationsInnerHeight + 12}
                    stroke="#12020A"
                    stroke-width={2}
                  />
                  <g class="number" fill="#12020A" text-anchor="middle">
                    <text
                      x={0}
                      y={-18}
                    >
                      {`${highlightedEpisodeOverviewPercentage}%`}
                    </text>
                    <text
                      x={0}
                      y={visualizationsInnerHeight + 16}
                      dominant-baseline="hanging"
                    >
                      {`${highlightedEpisodeOverviewPercentage}%`}
                    </text>
                  </g>
                </g>
              {/if}
            </g>
          </svg>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .character {
    transition: opacity 0.3s ease-out;
  }
  .character-button:hover .character,
  .character-button.active .character {
    opacity: 1;
  }
  .character-button.active .character {
    cursor: default;
  }
  rect {
    transition: fill-opacity 0.2s ease-out;
  }
</style>