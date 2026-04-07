<script>
  import { scaleLinear } from 'd3-scale';
  import { sum } from 'd3-array';

  import { catalogLegendIsVisible } from '../../../../stores/catalogLegendIsVisible';
  import { getCharacterImagePath } from '../../../../utils/getCharacterImagePath';

  import LaughIcon from '../../../../icons/Laugh.svelte';

  let {
    width,
    height,
    yScale,
    charactersOnScreen,
    charactersCausedLaughs,
    episodeDuration,
    isHover,
    isPlaying,
    hoveredCharacters,
    playingCharLaughLevels = {},
  } = $props();

  const getLaughIconOpacity = (charId, iconLevel) => {
    if ((!isPlaying && !isHover) || !hoveredCharacters.includes(charId)) return 1;
    const laughBin = playingCharLaughLevels[charId];
    if (!laughBin) return 1;
    if (iconLevel === 1) return laughBin !== '2' && laughBin !== '3' ? 1 : 0.2;
    if (iconLevel === 2) return laughBin === '2' ? 1 : 0.2;
    if (iconLevel === 3) return laughBin === '3' ? 1 : 0.2;
    return 1;
  };

  const isHighlight = $derived.by(() => {
    return !isPlaying && !isHover ? false : true;
  });

  let columnWidth = $derived(width / 2 - 8);
  const barHeight = 10;
  const xScale = $derived(scaleLinear().domain([0, 1]).range([0, columnWidth]));
  const numLaughs = $derived(sum(charactersCausedLaughs, (d) => d.causedLaughs.length));
</script>

<div class="catalog-character-stats flex pl-6" style="width: {width}px;">
  <div
    class="relative mr-4"
    style="width: {$catalogLegendIsVisible ? 'auto' : `${columnWidth}px`};"
  >
    <div
      class="small accent absolute"
      style="width: {$catalogLegendIsVisible ? 'auto' : `${columnWidth}px`};"
    >
      {#if $catalogLegendIsVisible}
        <div class="mt-4">sonification legend</div>
      {:else}
        % of episode appeared in
      {/if}
    </div>
    {#if $catalogLegendIsVisible}
      <div class="flex flex-col gap-3 mt-[50px]">
        {#each charactersOnScreen as char}
          <div
            class="flex items-center gap-4"
            style="opacity: {!isHighlight || (isHighlight && hoveredCharacters.includes(char.id))
              ? 1
              : 0.2}"
          >
            <div
              class="w-8 h-8 bg-no-repeat bg-contain bg-center rounded-full"
              style="background-image: url({getCharacterImagePath(char.id)});"
            ></div>
            <button style="opacity: {getLaughIconOpacity(char.id, 1)}">
              <LaughIcon width={20} height={20} />
            </button>
            <button style="opacity: {getLaughIconOpacity(char.id, 2)}">
              <LaughIcon width={26} height={26} />
            </button>
            <button style="opacity: {getLaughIconOpacity(char.id, 3)}">
              <LaughIcon width={32} height={32} />
            </button>
          </div>
        {/each}
      </div>
    {:else}
      <svg width={columnWidth} {height}>
        {#each charactersOnScreen as char}
          {#if char.timesOnScreen}
            <rect
              x={0}
              y={yScale(char.id) + yScale.bandwidth() / 2 - barHeight / 2}
              width={columnWidth}
              height={barHeight}
              fill="#EEECED"
            />
            <rect
              x={0}
              y={yScale(char.id) + yScale.bandwidth() / 2 - barHeight / 2}
              width={xScale((char.timesOnScreen.length * 5) / episodeDuration)}
              height={barHeight}
              fill={char.color}
            />
            <text
              class="number"
              x={0}
              y={yScale(char.id) + yScale.bandwidth() / 2 - barHeight / 2 - 2}
            >
              {Math.round(((char.timesOnScreen.length * 5) / episodeDuration) * 100) === 100
                ? 99
                : Math.round(((char.timesOnScreen.length * 5) / episodeDuration) * 100)}%
            </text>
          {/if}
        {/each}
      </svg>
    {/if}
  </div>
  {#if !$catalogLegendIsVisible}
    <div class="relative" style="width: {columnWidth}px;">
      <div class="small accent absolute" style="width: {columnWidth}px;">% of episode laughs</div>
      <svg width={columnWidth} {height}>
        {#each charactersCausedLaughs as char}
          <rect
            x={0}
            y={yScale(char.id) + yScale.bandwidth() / 2 - barHeight / 2}
            width={columnWidth}
            height={barHeight}
            fill="#EEECED"
          />
          <rect
            x={0}
            y={yScale(char.id) + yScale.bandwidth() / 2 - barHeight / 2}
            width={xScale(char.causedLaughs.length / numLaughs)}
            height={barHeight}
            fill={char.color}
          />
          <text
            class="number"
            x={0}
            y={yScale(char.id) + yScale.bandwidth() / 2 - barHeight / 2 - 2}
          >
            {Math.round((char.causedLaughs.length / numLaughs) * 100)}%
          </text>
        {/each}
      </svg>
    </div>
  {/if}
</div>
