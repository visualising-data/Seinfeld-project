<script>
	import { fade, fly } from 'svelte/transition';
	import CloseIcon from '../icons/CloseIcon.svelte';
	import ArrowRight from '../icons/ArrowRight.svelte';

	let { toggleMenu } = $props();

	const menuLinks = [
		{ label: 'Prologue', anchor: 'intro' },
		{ label: 'The Show', anchor: 'intro-calendar-container' },
		{ label: 'Lead Characters', anchor: 'lead-chars' },
		{ label: 'Supporting Characters', anchor: 'supporting-chars' },
		{ label: 'Locations', anchor: 'locations' },
		{ label: 'Laughs Exploration', anchor: 'laughs-exploration' },
		{ label: 'Episode Catalog', anchor: 'catalog-section' },
		{ label: 'Methodology & Credits', anchor: 'methodology' }
	];
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div in:fade={{ duration: 250 }} out:fade={{ duration: 250 }} class="backdrop" onclick={toggleMenu}>
	<div
		in:fly={{ duration: 250, x: 500 }}
		out:fly={{ duration: 250, x: 500 }}
		class="menu-container h-screen"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="h-screen flex flex-col justify-center px-12 py-8">
			<ul id="menu-links">
				{#each menuLinks as menuItem}
					<li class="py-5">
						<a class="no-underline text-white uppercase flex justify-between items-center" 
						   href="#{menuItem.anchor}" 
							 aria-label="Go to {menuItem.label}"
							 onclick={(e) => {
								 e.stopPropagation();
								 toggleMenu();
							 }}>
							{menuItem.label}
							<span class="menu-arrow-right"><ArrowRight /></span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
		<button
			class="menu-close-button"
			onclick={(e) => {
				e.stopPropagation();
				toggleMenu();
			}}
		>
			<CloseIcon color="#E71D80" />
		</button>
	</div>
</div>

<style>
	.menu-container {
		position: absolute;
		top: 0;
		right: 0px;
		z-index: 100;
		width: 450px;
		max-width: 100vw;
		background-color: #12020a;
		color: #e71d80;
	}
	.menu-close-button {
		position: absolute;
		top: 24px;
		right: 24px;
	}
	#menu-links li {
		border-bottom: 1px solid #F9F5F7;
	}
	#menu-links li:first-of-type {
		border-top: 1px solid #F9F5F7;
	}
	#menu-links a {
		font-size: 20px;
		font-weight: 400;
	}
	#menu-links .menu-arrow-right {
		transform: translateX(-20px);
		opacity: 0;
		transition: all 200ms ease-out;
	}
	#menu-links a:hover .menu-arrow-right {
	transform: translateX(0px);
	opacity: 1;
	}
</style>
