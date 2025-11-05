<script>
  let { visualizationsInnerHeight, isMouseOver, episodeTimeScale } = $props();

  const timeLabels = [0, 5, 10, 15, 20, 25, 30];
</script>

{#each timeLabels as timeLabel}
  <g transform="translate({episodeTimeScale(timeLabel * 60)}, 0)" class="pointer-events-none">
    <line
      x1={0}
      y1={-12}
      x2={0}
      y2={visualizationsInnerHeight + 12}
      stroke="#303843"
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