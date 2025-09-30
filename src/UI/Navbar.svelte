<script>
	import { soundIsAuth } from '../stores/soundAuthStore';
	import { catalogIsInView } from '../stores/catalogIsInView';
	import { navBarColor } from '../stores/navbarColor';
	import AudioOn from '../icons/AudioOn.svelte';
	import AudioOff from '../icons/AudioOff.svelte';
	import Burger from '../icons/Burger.svelte';
	import MainMenu from './MainMenu.svelte';

	let innerWidth = $state(1200);
	let showMenu = $state(false);

	const toggleSound = () => {
		$soundIsAuth = !$soundIsAuth;
	};

	const toggleMenu = () => {
		showMenu = !showMenu;
	};

	let color = $derived($navBarColor === 'white' ? '#F9F5F7' : '#E71D80');
</script>

<svelte:window bind:innerWidth />

<div
	class="fixed right-6 top-0 flex h-14 items-center"
	style="height: 56px; z-index: {catalogIsInView && innerWidth <= 539 ? 0 : 10};"
>
	<div class="flex">
		<button onclick={toggleSound}>
			{#if $soundIsAuth}
				<AudioOn {color} />
			{:else}
				<AudioOff {color} />
			{/if}
		</button>
		<button class="ml-4" onclick={toggleMenu} disabled={showMenu}><Burger {color} /></button>
	</div>
</div>
{#if showMenu}
	<MainMenu {toggleMenu} />
{/if}
