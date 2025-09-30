<script>
	import { scaleLinear } from 'd3-scale';
	import { sum } from 'd3-array';

	let { width, height, yScale, charactersOnScreen, charactersCausedLaughs, episodeDuration } =
		$props();

	let columnWidth = $derived(width / 2 - 8);
	const barHeight = 10;
	const xScale = $derived(scaleLinear().domain([0, 1]).range([0, columnWidth]));
	const numLaughs = $derived(sum(charactersCausedLaughs, (d) => d.causedLaughs.length));
</script>

<div class="flex pl-6" style="width: {width}px;">
	<div class="relative mr-4" style="width: {columnWidth}px;">
		<div class="small accent absolute" style="width: {columnWidth}px;">
			% of episode appeared in
		</div>
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
	</div>
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
				<text class="number" x={0} y={yScale(char.id) + yScale.bandwidth() / 2 - barHeight / 2 - 2}>
					{Math.round((char.causedLaughs.length / numLaughs) * 100)}%
				</text>
			{/each}
		</svg>
	</div>
</div>
