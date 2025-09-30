<script>
	import { fade, fly } from 'svelte/transition';
	import CloseIcon from '../../../icons/CloseIcon.svelte';
	import SonificationLegendContent from './SonificationLegendContent.svelte';
	import { stopPropagation } from 'svelte/legacy';

	let { toggleLegend } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	in:fade={{ duration: 250 }}
	out:fade={{ duration: 250 }}
	class="backdrop"
	onclick={toggleLegend}
>
	<div
		in:fly={{ duration: 250, x: 500 }}
		out:fly={{ duration: 250, x: 500 }}
		class="sonification-legend-container h-screen"
		onclick={(e) => e.stopPropagation()}
	>
		<SonificationLegendContent />
		<button
			class="menu-close-button"
			onclick={(e) => {
				e.stopPropagation();
				toggleLegend();
			}}
		>
			<CloseIcon color="#12020a" />
		</button>
	</div>
</div>

<style>
	.sonification-legend-container {
		position: absolute;
		top: 0;
		right: 0px;
		z-index: 100;
		width: 500px;
		max-width: 100vw;
		padding: 24px;
		background-color: #f9f5f7;
		color: #e71d80;
	}
	.menu-close-button {
		position: absolute;
		top: 24px;
		right: 24px;
	}
</style>
