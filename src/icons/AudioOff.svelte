<script>
	let { color, animated = false } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke-width="1.5"
	style="stroke: {color}; transition: stroke 0.4s ease;"
	class={animated ? 'icon-wiggle' : ''}
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
	/>
</svg>

<style>
	.icon-wiggle {
		animation: icon-wiggle 3s ease-in-out infinite;
		transform-origin: center;
	}

	@keyframes icon-wiggle {
		0%  { transform: rotate(0deg); }
		8%  { transform: rotate(-14deg); }
		16% { transform: rotate(14deg); }
		24% { transform: rotate(-9deg); }
		32% { transform: rotate(9deg); }
		40% { transform: rotate(-4deg); }
		48% { transform: rotate(4deg); }
		56%, 100% { transform: rotate(0deg); }
	}
</style>
