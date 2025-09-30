<script>
	let { characters, xScale, yScale, isHover, hoveredTime, isPlaying, playingScene, scenes } =
		$props();

	let laughWidth = $derived(xScale(5));

	const playingSceneData = $derived(
		scenes.find((/** @type {{ sceneNum: number; }} */ s) => s.sceneNum === playingScene)
	);
</script>

<g>
	{#each characters as char}
		<g transform={`translate(0, ${yScale(char.id)})`}>
			{#each char.causedLaughs as laugh}
				<rect
					class="catalog-laugh-bar"
					x={xScale(laugh)}
					y={-10}
					width={laughWidth}
					height={yScale.bandwidth() + 20}
					fill={char.color}
					fill-opacity={(!isHover && !isPlaying) ||
					(isHover && hoveredTime >= laugh && hoveredTime <= laugh + laughWidth) ||
					(isPlaying &&
						laugh >= playingSceneData.startTime &&
						laugh + laughWidth <= playingSceneData.endTime)
						? 1
						: 0.2}
					stroke="#F9F5F7"
					stroke-opacity={(!isHover && !isPlaying) ||
					(isHover && hoveredTime >= laugh && hoveredTime <= laugh + laughWidth) ||
					(isPlaying &&
						laugh >= playingSceneData.startTime &&
						laugh + laughWidth <= playingSceneData.endTime)
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
