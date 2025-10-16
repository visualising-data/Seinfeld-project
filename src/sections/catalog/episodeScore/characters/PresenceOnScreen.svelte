<script>
	// @ts-nocheck

	let { characters, xScale, yScale, scenes, isHover, hoveredTime, isPlaying, playingScene } =
		$props();

	const charactersData = $derived.by(() => {
		const charactersArray = structuredClone(characters);
		charactersArray.forEach((char) => {
			if (char.id !== 'The situation') {
				char.momentsOnScreen = [];
				let startTime;
				let currentTime;
				let currentScene;
				if (char.timesOnScreen) {
					char.timesOnScreen.forEach((time, i) => {
						const scene = scenes.find((s) => time >= s.startTime && time < s.endTime)?.sceneNum;
						const addedTime = i === char.timesOnScreen.length - 1 ? 10 : 5;
						switch (true) {
							case i === 0:
								startTime = time;
								currentTime = time;
								currentScene = 1;
								break;
							case i === char.timesOnScreen.length - 1:
							case time - currentTime > 5:
							case scene > currentScene:
								char.momentsOnScreen.push({
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
			}
		});

		return charactersArray;
	});
</script>

<g>
	{#each charactersData as char}
		<g transform={`translate(0, ${yScale(char.id)})`}>
			{#each char.momentsOnScreen as moment}
				<rect
					class="catalog-character-on-screen"
					x={xScale(moment.startTime)}
					y={0}
					width={xScale(moment.duration)}
					height={yScale.bandwidth()}
					fill={char.color}
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
