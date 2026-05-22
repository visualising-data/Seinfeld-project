<script>
  import { scaleLinear } from 'd3-scale';

  import { catalogLegendIsVisible } from '../../../../stores/catalogLegendIsVisible';
  import { getLocationIconPath } from '../../../../utils/getLocationIconPath';

  import LaughIcon from '../../../../icons/Laugh.svelte';

  let {
    width,
    height,
    yScale,
    locationsOnScreen,
    episodeDuration,
    isHover,
    isPlaying,
    hoveredLocations = [],
  } = $props();

  const isHighlight = $derived.by(() => {
    return !isPlaying && !isHover ? false : true;
  });

  let columnWidth = $derived(width / 2 - 8);
  const barHeight = 10;
  const xScale = $derived(scaleLinear().domain([0, 1]).range([0, columnWidth]));
</script>

<div class="catalog-location-stats flex pl-6" style="width: {width}px;">
  <div
    class="relative mr-4"
    style="width: {$catalogLegendIsVisible ? 'auto' : `${columnWidth}px`};"
  >
    <div class="small accent absolute -top-2 w-[300px]">
      {#if !$catalogLegendIsVisible}
        % of episode appeared in
      {/if}
    </div>
    {#if $catalogLegendIsVisible}
      <div class="flex flex-col gap-[13px] mt-[22px]">
        {#each locationsOnScreen as location}
          <div
            class="flex items-center gap-4"
            style="opacity: {!isHighlight || (isHighlight && hoveredLocations.includes(location.id))
              ? 1
              : 0.2}"
          >
            <div
              class="w-8 h-8 bg-no-repeat bg-contain bg-center rounded-full"
              style="background-image: url({getLocationIconPath(location.id)});"
            ></div>
            <LaughIcon width={26} height={26} />
          </div>
        {/each}
      </div>
    {:else}
      <svg width={columnWidth} {height}>
        {#each locationsOnScreen as location}
          <rect
            x={0}
            y={Math.max(yScale(location.id) + yScale.bandwidth() / 2 - barHeight / 2, 0)}
            width={columnWidth > 0 ? columnWidth : 0}
            height={barHeight}
            fill="#EEECED"
          />
          <rect
            x={0}
            y={Math.max(yScale(location.id) + yScale.bandwidth() / 2 - barHeight / 2, 0)}
            width={Math.max(xScale((location.timesOnScreen.length * 5) / episodeDuration), 0)}
            height={barHeight}
            fill="#12020A"
          />
          <text
            class="number"
            x={0}
            y={yScale(location.id) + yScale.bandwidth() / 2 - barHeight / 2 - 2}
          >
            {Math.round(((location.timesOnScreen.length * 5) / episodeDuration) * 100) === 100
              ? 99
              : Math.round(((location.timesOnScreen.length * 5) / episodeDuration) * 100)}%
          </text>
        {/each}
      </svg>
    {/if}
  </div>
</div>
