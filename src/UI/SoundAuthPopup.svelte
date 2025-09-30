<script>
	import { fly } from 'svelte/transition';
	import SoundIcon from '../icons/SoundIcon.svelte';
	import { soundIsAuth, soundAuthModaleIsOpen } from '../stores/soundAuthStore';

	/**
	 * @type {number}
	 */
	let innerWidth = $state(1600);

	const updateSoundAuth = (/** @type {boolean} */ isAuth) => {
		$soundIsAuth = isAuth;
		$soundAuthModaleIsOpen = false;
	};
</script>

<svelte:window bind:innerWidth />

<div
	class="sound-auth bg-white text-black"
	in:fly={{ duration: 500, y: 165 }}
	out:fly={{ duration: 500, y: 165 }}
>
	<div
		class="m-auto flex flex-col justify-between md:flex-row md:items-center"
		style="max-width: 1400px"
	>
		<div class="flex items-center">
			<div class="shrink-0">
				<SoundIcon width={100} height={165 / 2} />
			</div>
			<div class="ml-4 mt-2" style="max-width: {innerWidth >= 793 ? 'none' : '400px'}">
				<p>This project offers an immersive audio experience. Turn your sound on!</p>
			</div>
		</div>
		<div class="mt-8 flex leading-5 md:ml-4 md:mt-0 md:justify-end">
			<button class="btn btn-secondary" onclick={() => updateSoundAuth(false)}>No, thanks</button>
			<button class="btn btn-primary ml-4" onclick={() => updateSoundAuth(true)}>Allow sound</button
			>
		</div>
	</div>
</div>

<style>
	.sound-auth {
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 100;
		width: 100vw;
		padding: 40px 32px;
		box-shadow: rgba(48, 56, 67, 0.15) 0px 8px 24px;
	}
	.sound-auth p {
		margin: 0;
	}
</style>
