<script lang="ts">
  import { onMount } from "svelte";
  import SeasonsStrip from "../../UI/SeasonsStrip.svelte";
  import DataGatheringDetails from "./DataGatheringDetails.svelte";
  import EpisodeExample from "./EpisodeExample.svelte";
	import type { Episode } from "$lib/types/episode";
	import { episodesInfo } from '$lib/data/episodesInfo';
	import Bridge from "./Bridge.svelte";

  let { episodesData, ScrollTrigger } = $props();

	let innerHeight = $state(800);
	let isAllEpisodesInView = $state(false);
	let stripHeight = $derived(innerHeight);

  const currentSeason = 5;
	const currentEpisode = 14;
	const episodeInfo = episodesInfo.find(
		(e) => e.season === currentSeason && e.episode === currentEpisode
	);
	const episodeData = $derived(
		episodesData.filter(
			(d: Episode) =>
				d.season === 5 && d.episode === 14
		).map((d: Episode) => d.data)[0]
	);
	const laughData = $derived(
		episodesData.filter(
			(d: Episode) =>
				d.season === 5 && d.episode === 14
		).map((d: { laughs: any; }) => d.laughs)[0]
	);

  onMount(() => {
    setTimeout(() => {
			// Pin seasons strip
			ScrollTrigger.create({
				trigger: '#data-gathering',
				start: 'top top',
				end: 'bottom bottom',
				pin: '#data-gathering #seasons-strip',
				preventOverlaps: true
			});
			
			// Change seasons strip height on scroll
			ScrollTrigger.create({
				trigger: '#all-episodes',
				start: 'top center',
				end: 'bottom top',
				preventOverlaps: true,
				onEnter: () => isAllEpisodesInView = true,
				onLeave: () => isAllEpisodesInView = false,
				onEnterBack: () => isAllEpisodesInView = true,
				onLeaveBack: () => isAllEpisodesInView = false,
			});
		}, 3000);
  })
</script>

<svelte:window bind:innerHeight />

<section id="data-gathering" class="relative">
		<div class="absolute top-0 left-0">
    	<SeasonsStrip {stripHeight} />
		</div>
    <div class="w-screen" style="padding-left: 25px;">
        <DataGatheringDetails {laughData} />
				<Bridge />
        <EpisodeExample {episodeInfo} {episodeData} {laughData} {ScrollTrigger} />
				<!-- <AllEpisodes {episodesData} {stripHeight} {ScrollTrigger} /> -->
    </div>
</section>