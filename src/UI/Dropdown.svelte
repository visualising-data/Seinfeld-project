<script>
	import UpDownCarets from '$lib/assets/UpDownCarets.svg';

	let { options, value = $bindable(), prefix } = $props();
</script>

<div class="dropdown">
	<select bind:value style="background-image: url({UpDownCarets});">
		{#each options as option}
			<option value={option}>{prefix}{option}</option>
		{/each}
	</select>
</div>

<style>
	.dropdown select {
		appearance: none;
		outline: none;
		min-width: 100px;
		height: 50px;
		padding: 0px 8px;
		font-size: 1.625rem;
		font-weight: 600;
		color: #f9f5f7;
		background-color: transparent;
		background-repeat: no-repeat;
		background-size: auto 27px;
		background-position: right 4px center;
		border: 3px solid #f9f5f7;
		border-radius: 8px;
	}
</style>
