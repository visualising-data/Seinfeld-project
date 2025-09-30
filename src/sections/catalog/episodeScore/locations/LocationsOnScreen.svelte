<script>
	// @ts-nocheck

	let { locations, xScale, yScale, isHover, hoveredTime, scenes, isPlaying, playingScene } =
		$props();

	const locationsData = $derived.by(() => {
		const locationsArray = structuredClone(locations);
		locationsArray.forEach((location) => {
			location.momentsOnScreen = [];
			let startTime;
			let currentTime;
			let currentScene;
			if (location.timesOnScreen) {
				location.timesOnScreen.forEach((time, i) => {
					const scene = scenes.find((s) => time >= s.startTime && time < s.endTime)?.sceneNum;

					switch (true) {
						case i === 0:
							startTime = time;
							currentTime = time;
							break;
						case i === location.timesOnScreen.length - 1:
						case time - currentTime > 5:
						case scene > currentScene:
							const addedTime = i === location.timesOnScreen.length - 1 ? 10 : 5;
							location.momentsOnScreen.push({
								startTime: startTime,
								duration: currentTime - startTime + addedTime,
								scene: currentScene
							});
							startTime = time;
							currentTime = time;
							break;
						case time - currentTime === 5:
							currentTime = time;
							break;
					}

					currentScene = scene;
				});
			}
		});

		return locationsArray;
	});
</script>

<g>
	{#each locationsData as location}
		<g transform={`translate(0, ${yScale(location.id)})`}>
			{#each location.momentsOnScreen as moment}
				<rect
					class="catalog-location-on-screen"
					x={xScale(moment.startTime)}
					y={0}
					width={xScale(moment.duration)}
					height={yScale.bandwidth()}
					fill="#12020A"
					fill-opacity={(!isHover && !isPlaying) ||
					(isHover &&
						hoveredTime >= moment.startTime &&
						hoveredTime <= moment.startTime + moment.duration) ||
					(isPlaying && playingScene === moment.scene)
						? 1
						: 0.1}
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
