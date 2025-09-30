<script>
	let {
		scenes,
		xScale,
		height,
		isNumbersUp = true,
		isHover,
		hoveredTime,
		isPlaying,
		playingScene
	} = $props();
</script>

<g>
	{#each scenes as scene, j}
		<rect
			x={xScale(scene.startTime)}
			y={0}
			width={xScale(scene.endTime) - xScale(scene.startTime)}
			{height}
			fill={(j % 2 && !isHover && !isPlaying) ||
			(isHover && hoveredTime >= scene.startTime && hoveredTime <= scene.endTime) ||
			(isPlaying && playingScene === scene.sceneNum)
				? '#DDDBDC'
				: '#EEECED'}
			fill-opacity={(!isHover && !isPlaying) ||
			(isHover && hoveredTime >= scene.startTime && hoveredTime <= scene.endTime) ||
			(isPlaying && playingScene === scene.sceneNum)
				? 0.7
				: 0.2}
		/>
		{#if xScale(scene.endTime) - xScale(scene.startTime) >= 20}
			<text
				class="number"
				x={xScale(scene.startTime) + (xScale(scene.endTime) - xScale(scene.startTime)) / 2}
				y={isNumbersUp ? 15 : height - 15}
				fill-opacity={(isHover && hoveredTime >= scene.startTime && hoveredTime <= scene.endTime) ||
				!isHover
					? 1
					: 0.2}
				text-anchor="middle"
				dominant-baseline="middle"
			>
				{scene.sceneNum}
			</text>
		{/if}
	{/each}
</g>

<style>
	rect,
	text {
		transition: all 150ms ease-out;
	}
</style>
