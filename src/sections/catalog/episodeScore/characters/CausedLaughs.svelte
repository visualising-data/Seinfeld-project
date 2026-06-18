<script>
  let { characters, xScale, yScale, isHover, hoveredTime, isPlaying, playingScene, scenes } =
    $props();

  let laughWidth = $derived(xScale(5));

  const playingSceneData = $derived(
    scenes.find((/** @type {{ sceneNum: number; }} */ s) => s.sceneNum === playingScene),
  );

  const hoveredSceneData = $derived(
    scenes.find((/** @type {{ startTime: number; endTime: number; }} */ s) => hoveredTime >= s.startTime && hoveredTime <= s.endTime),
  );
</script>

<g>
  {#each characters as char}
    <g transform={`translate(0, ${yScale(char.id)})`}>
      {#each char.causedLaughs as laugh}
        <rect
          class="catalog-laugh-bar pointer-events-none"
          x={xScale(laugh)}
          y={-10}
          width={laughWidth}
          height={yScale.bandwidth() + 20}
          fill={char.color}
          fill-opacity={(!isHover && !isPlaying) ||
          (isHover && hoveredSceneData && laugh >= hoveredSceneData.startTime && laugh <= hoveredSceneData.endTime) ||
          (isPlaying &&
            laugh >= playingSceneData.startTime &&
            laugh <= playingSceneData.endTime)
            ? 1
            : 0.2}
          stroke="#F9F5F7"
          stroke-opacity={(!isHover && !isPlaying) ||
          (isHover && hoveredSceneData && laugh >= hoveredSceneData.startTime && laugh <= hoveredSceneData.endTime) ||
          (isPlaying &&
            laugh >= playingSceneData.startTime &&
            laugh <= playingSceneData.endTime)
            ? 1
            : 0}
        />
      {/each}
    </g>
  {/each}
</g>

<style>
  rect {
    transition: all 150ms ease-out;
  }
</style>
