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

	let navBg = $derived($catalogIsInView && innerWidth < 1024 ? '#E71D80' : 'transparent');
	let color = $derived(navBg !== 'transparent' || $catalogIsInView || $navBarColor === 'white' ? '#F9F5F7' : '#E71D80');
</script>

<svelte:window bind:innerWidth />

<div
	class="fixed inset-x-0 top-0 flex h-14 items-center justify-end px-6"
	style="height: 56px; z-index: 10; background: {navBg}; transition: background 0.3s ease;"
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
