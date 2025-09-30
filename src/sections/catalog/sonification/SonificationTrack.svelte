<script>
	import { soundIsAuth } from '../../../stores/soundAuthStore';

	let { scenesWidth, scenes, xScale, playingScene, handleClickOnScene } = $props();

	let innerWidth = $state(1200);
	const height = 24;
</script>

<svelte:window bind:innerWidth />

<div class="relative">
	<svg
		class="mt-6"
		width={scenesWidth}
		{height}
		style="transform: translateX({playingScene && innerWidth <= 1000
			? xScale(
					scenes.find((/** @type {{ sceneNum: number; }} */ s) => s.sceneNum === playingScene)
						.startTime
				) * -1
			: 0}px);"
	>
		<g transform="translate(0, {height / 2})">
			{#each scenes as scene, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<line
					class="scene-player {playingScene === i + 1 ? 'playing' : ''} {$soundIsAuth
						? 'sound-is-auth'
						: ''}"
					x1={xScale(scene.startTime)}
					y1={0}
					x2={xScale(scene.endTime)}
					y2={0}
					stroke-width={10}
					role="button"
					tabindex={0}
					onclick={() => handleClickOnScene(i + 1)}
				/>
				{#if i > 0}
					<line
						x1={xScale(scene.startTime)}
						y1={-10}
						x2={xScale(scene.startTime)}
						y2={10}
						stroke="#BEBABC"
						stroke-width={3}
						stroke-linecap="round"
					/>
				{/if}
			{/each}
		</g>
	</svg>
</div>

<style>
	.scene-player {
		stroke: #bebabc;
		outline: none;
		transition: stroke 150ms ease-out;
	}
	.scene-player.sound-is-auth {
		cursor: pointer;
	}
	.scene-player.sound-is-auth.playing,
	.scene-player.sound-is-auth:hover {
		stroke: #e71d80;
	}
</style>
