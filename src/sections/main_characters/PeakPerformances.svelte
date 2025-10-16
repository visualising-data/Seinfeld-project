<script>
  import { scaleLinear, scaleRadial } from "d3-scale";
  import HelpIcon from "../../icons/HelpIcon.svelte";
  import { characters } from "$lib/data/characters";
  import { getCharacterImagePath } from "../../utils/getCharacterImagePath";
  import { performances } from "$lib/data/perfomances";
  import { episodesInfo } from "$lib/data/episodesInfo";
  import EpisodeTooltip from "../../UI/EpisodeTooltip.svelte";
  import ArrowDown from "../../icons/ArrowDown.svelte";

  const mainChars = characters.slice(0, 4);
  const orderedChars = $state(mainChars.map(char => {
    return {
      ...char,
      isActive: char.id === 'JERRY' ? true : false
    }
  })
  .sort((a, b) => {
      if (a.id === 'JERRY') return 1;
      else if (b.id === 'JERRY') return -1;
      else return 0;
    }));

  let containerWidth = $state(1200);

  let chartWidth = $derived(containerWidth - 64 <= 1200 ? containerWidth - 64 - 400 : 1200 - 400);
  let chartHeight = 545;

  const charLaughterRateScale = $derived(
    scaleLinear()
      .domain([0, 1])
      .range([0, chartWidth])
  );
  const charShareLaughScale = $derived(
    scaleLinear()
      .domain([0, 0.7])
      .range([chartHeight, 0])
  );
  const relativeScreenTimeRateScale = scaleRadial()
    .domain([0, 1])
    .range([0, 10]);

  let isTooltipVisible = $state(false);
	let hoveredEpisode = $state();
	let hoveredEpisodeData = $state();
	let hoveredChar = $state('');
	let mousePosition = $state();
	const handleMouseEnter = (
		/** @type {MouseEvent & { currentTarget: EventTarget & SVGGElement; }} */ e,
		/** @type {any} */ episode,
		/** @type {string} */ char
	) => {
		mousePosition = [e.clientX, e.clientY];
		isTooltipVisible = true;
    hoveredChar = char;
    hoveredEpisodeData = episode;
		hoveredEpisode = episodesInfo.find(ep => ep.season === episode.seasonNum && ep.episode === episode.episode);
  };
	const handleMouseLeave = () => {
		isTooltipVisible = false;
	};

  const handleCharacterClick = (/** @type {string} */ char) => {
    if (orderedChars.find(c => c.id === char)?.isActive) return;

    orderedChars.sort((a, b) => {
      if (a.id === char) return 1;
      else if (b.id === char) return -1;
      else return 0;
    });
    orderedChars.forEach(c => {
      if (c.id === char) {
        c.isActive = !c.isActive; // Toggle active state
      } else {
        c.isActive = false; // Deactivate others
      }
    });
  };

  const statWidth = 80;
  const statHeight = 10;
  const statScale = scaleLinear()
    .domain([0, 1])
    .range([0, statWidth]);
</script>

<div id="peak-performances-container" class="w-screen pb-80 relative">
  <div class="container" bind:clientWidth={containerWidth}>
    <!-- Header -->
    <div class="mb-8">
      <h3>Peak performances</h3>
      <div style="max-width: 900px;">If we consider the simplistic, but not unreasonable, goal of a sitcom is to cause laughter, the peak performance of a character can be identified as an episode in which they generated a high number of laughs while they were on screen (laughter rate), they were allocated a high proportion of all the laughs in that episode (laughter share), and they were on screen for a long duration (screen-time).
    </div>
    </div>

    <div class="flex items-stretch">
      <!-- Character Selector -->
      <div class="flex flex-col items-center shrink-0 mr-8">
        <div class="small flex items-center gap-2" style="max-width: 220px;">
          <span class="shrink"><HelpIcon color="#E71D80" /></span>
          <span class="relative top-1">Select a character to reveal their performances.</span>
        </div>
        <ul class="flex flex-col mt-4">
          {#each mainChars as char}
            <li class="my-2">
              <button class="flex flex-col character-button {orderedChars.find(c => c.id === char.id)?.isActive ? 'active' : ''}" onclick={() => handleCharacterClick(char.id)}>
                <div class="character rounded-full bg-contain bg-center opacity-50" 
                     style="background-image: url('{getCharacterImagePath(char.id)}'); width: 75px; height: 75px;"></div>
                <div>{char.label}</div>
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Scatterplot -->
      <svg class="shrink-0" width={chartWidth + 32} height={chartHeight + 32}>
        <g transform='translate(30, 1)'>
          <rect
            x={0}
            y={0}
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            stroke="#12020A"
          />
          <line
            x1={charLaughterRateScale(0.5)}
            y1={0}
            x2={charLaughterRateScale(0.5)}
            y2={chartHeight}
            stroke="#BEBABC"
          />
          <line
            x1={0}
            y1={charShareLaughScale(0.5)}
            x2={chartWidth}
            y2={charShareLaughScale(0.5)}
            stroke="#BEBABC"
          />
          <g class="number" fill-opacity={isTooltipVisible ? 0 : 1}>
            <text x={charLaughterRateScale(0.5) + 4} y={chartHeight - 4}>50%</text>
            <text x={4} y={charShareLaughScale(0.5) - 4}>50%</text>
          </g>

          <g>
            {#each orderedChars as char}
              {#each performances as episode}
                <circle
                  class="performance performance-{char.id} {char.isActive ? 'active' : ''} {isTooltipVisible ? 'faded' : ''}"
                  cx={charLaughterRateScale(episode.charsBreakdown.find(c => c.id === char.id).laughterRate)}
                  cy={charShareLaughScale(episode.charsBreakdown.find(c => c.id === char.id).shareOfLaughs)}
                  r={relativeScreenTimeRateScale(episode.charsBreakdown.find(c => c.id === char.id).relativeScreenTime)}
                  fill={"#DDDBDC"}
                  role="document"
                  onmouseenter={(e) => handleMouseEnter(e, episode, char.id)}
                  onmouseleave={handleMouseLeave}
                />
              {/each}
            {/each}
          </g>

          <!-- Hover details -->
          {#if isTooltipVisible && hoveredEpisode}
            <g class="pointer-events-none">
              <line
                x1={charLaughterRateScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).laughterRate)}
                y1={0}
                x2={charLaughterRateScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).laughterRate)}
                y2={chartHeight}
                stroke="#12020A"
                stroke-dasharray="5 5"
              />
              <line
                x1={0}
                y1={charShareLaughScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).shareOfLaughs)}
                x2={chartWidth}
                y2={charShareLaughScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).shareOfLaughs)}
                stroke="#12020A"
                stroke-dasharray="5 5"
              />
              <circle
                class="performance performance-{hoveredChar} active"
                cx={charLaughterRateScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).laughterRate)}
                cy={charShareLaughScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).shareOfLaughs)}
                r={relativeScreenTimeRateScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).relativeScreenTime)}
                fill={"#DDDBDC"}
                role="document"
              />
            </g>
          {/if}

          <!-- Axis labels -->
          <g transform="translate(0, {chartHeight + 16})">
            <text class="small accent" x={0} y={0}>Episode laughter rate</text>
            <g transform="translate(144, -1) rotate(-90)">
              <ArrowDown />
            </g>
          </g>
          <g transform="translate(-8, {chartHeight}) rotate(-90)">
            <text class="small accent" x={0} y={0}>Share of episode laughs</text>
            <g transform="translate(163, -1) rotate(-90)">
              <ArrowDown />
            </g>
          </g>
          <g class="small accent">
            <text x={4} y={16}>Higher share of laughs</text>
            <text x={chartWidth - 4} y={chartHeight - 6} text-anchor="end">Higher rate of laughs</text>
          </g>

          <!-- Circles size legend -->
          <g transform="translate({chartWidth - 160}, 40)" dominant-baseline="hanging">
            <text class="small accent">Screen time</text>
            <g transform="translate(18, 0)">
              <circle cx={0} cy={28} r={10} fill="#DDDBDC" />
              <text class="number" y={40} text-anchor="middle">100%</text>
            </g>
            <g transform="translate(70, 0)">
              <circle cx={0} cy={28} r={6} fill="#DDDBDC" />
              <text class="number" y={40} text-anchor="middle">60%</text>
            </g>
            <g transform="translate(122, 0)">
              <circle cx={0} cy={28} r={3} fill="#DDDBDC" />
              <text class="number" y={40} text-anchor="middle">30%</text>
            </g>
          </g>
        </g>
      </svg>

      <!-- Stats -->
      {#if isTooltipVisible && innerWidth >= 793}
        <div class="ml-2 pb-8 flex flex-col justify-center gap-4">
          <!-- Laughter rate -->
          <div>
            <div class="small">Episode laughter rate</div>
            <svg width={statWidth} height={statHeight + 18}>
              <text 
                class="number baselin"
                dominant-baseline="hanging"
              >
                {`${Math.floor(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).laughterRate * 100)}%`}
              </text>
              <rect y={18} width={statWidth} height={statHeight} fill="#EEECED" />
              <rect y={18} width={statScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).laughterRate)} height={statHeight} fill={mainChars.find(c => c.id === hoveredChar).color} />
            </svg>
          </div>

          <!-- Share of episode laughs -->
          <div>
            <div class="small">Share of episode laughs</div>
            <svg width={statWidth} height={statHeight + 18}>
              <text 
                class="number baselin"
                dominant-baseline="hanging"
              >
                {`${Math.floor(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).shareOfLaughs * 100)}%`}
              </text>
              <rect y={18} width={statWidth} height={statHeight} fill="#EEECED" />
              <rect y={18} width={statScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).shareOfLaughs)} height={statHeight} fill={mainChars.find(c => c.id === hoveredChar).color} />
            </svg>
          </div>

          <!-- Screen time -->
          <div>
            <div class="small">Screen time</div>
            <svg width={statWidth} height={statHeight + 18}>
              <text 
                class="number"
                dominant-baseline="hanging"
              >
                {`${Math.floor(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).relativeScreenTime * 100)}%`}
              </text>
              <rect y={18} width={statWidth} height={statHeight} fill="#EEECED" />
              <rect y={18} width={statScale(hoveredEpisodeData.charsBreakdown.find(c => c.id === hoveredChar).relativeScreenTime)} height={statHeight} fill={mainChars.find(c => c.id === hoveredChar).color} />
            </svg>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Tooltip -->
	{#if isTooltipVisible && innerWidth >= 793}
		<div class="fixed z-20 top-0 left-0 right-0 bottom-0 pointer-events-none">
			<EpisodeTooltip episode={hoveredEpisode} position={mousePosition} />
		</div>
	{/if}
</div>

<style>
  .character {
    transition: opacity 0.3s ease-out;
  }
  .character-button:hover .character,
  .character-button.active .character {
    opacity: 1;
  }
  .character-button.active {
    cursor: default;
  }

  .performance {
    transition: fill 0.3s ease-out;
  }
  .performance.faded {
    fill-opacity: 0.05;
    stroke-opacity: 0.05;
  }
  .performance-JERRY:hover,
  .performance-JERRY.active {
    fill: #5FA8D3;
    stroke: #12020A;
  }
  .performance-GEORGE:hover,
  .performance-GEORGE.active {
    fill: #EB6447;
    stroke: #12020A;
  }
  .performance-ELAINE:hover,
  .performance-ELAINE.active {
    fill: #FBBA3A;
    stroke: #12020A;
  }
  .performance-KRAMER:hover,
  .performance-KRAMER.active {
    fill: #83C8C3;
    stroke: #12020A;
  }
</style>