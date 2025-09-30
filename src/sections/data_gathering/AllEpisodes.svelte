<script lang="ts">
	import { onMount } from 'svelte';
    import { scaleBand, scaleLinear } from 'd3-scale';
    import { episodesInfo } from '$lib/data/episodesInfo';
    import EpisodeBars from '../Laughs/EpisodeBars.svelte';
    import LaughRate from '../Laughs/LaughRate.svelte';
    import ImDbRating from '../Laughs/IMDbRating.svelte';
    import type { Episode } from '$lib/types/episode';
    import EpisodeTooltip from '../../UI/EpisodeTooltip.svelte';
    import AllEpisodesTexts from './AllEpisodesTexts.svelte';
	import { gsap } from 'gsap/dist/gsap';

    let { episodesData, stripHeight, ScrollTrigger } = $props();

    let innerWidth = $state(1600);
    let innerHeight = $state(800);
    let topMargin = $derived((innerHeight - (innerHeight - 130)) / 2);
    let smallChartWidth = $derived(innerWidth / 10);

    let episodeVerticalPositionScale = $derived(
        scaleBand()
            .domain(episodesInfo.map(d => `${d.season}-${d.episode}`))
            .range([0, stripHeight])
    );
    let percentageScale = $derived(
        scaleLinear()
            .domain([0, 1])
            .range([0, smallChartWidth])
    );


    let isTooltipVisible = $state(false);
	let hoveredEpisode = $state();
	let mousePosition = $state();
	function handleMouseEnter(
		e: MouseEvent & { currentTarget: EventTarget & SVGRectElement; },
		episode: Episode
	) {
		mousePosition = [e.clientX, e.clientY];
		isTooltipVisible = true;    
		hoveredEpisode = episodesInfo.find(
            (e) => e.season === episode.season && e.episode === episode.episode
        );
	};
	function handleMouseLeave() {
		isTooltipVisible = false;
	};

    onMount(() => {
		setTimeout(() => {
            // Pin vsualizations
		ScrollTrigger.create({
			trigger: '#all-episodes',
			start: 'top top',
            end: 'bottom bottom',
			pin: '#all-episodes-visualizations',
			preventOverlaps: true
		});

        // Texts timelines
        gsap.set('#all-episodes .episode-bar, #all-episodes #laugh-rate .bar, #all-episodes #imdb-rating .bar', {
            translateX: -300,
            opacity: 0
        });
        gsap.set('#all-episodes #laughs', {
            translateY: 50,
            opacity: 0
        });
        gsap.set('#all-episodes #episode-bars .label', {
            translateY: -50,
            opacity: 0
        });
        gsap.set('#laugh-rate .label, #all-episodes #imdb-rating .label', {
            translateX: -50,
            opacity: 0
        });
        gsap.set('#all-episodes .avg-label, #all-episodes .avg-line', {
            translateY: 50,
            opacity: 0
        });

        const tl1 = gsap.timeline({
			scrollTrigger: {
				trigger: '#all-episodes-1',
				start: 'top center'
			}
		});
        tl1
            .to('#all-episodes .episode-bar',{
                translateX: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            })
            .to('#all-episodes #laughs', {
                translateY: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 0.8
            }, '>-1')
            .to('#all-episodes #episode-bars .label', {
                translateY: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            }, '>-1');

        const tl2 = gsap.timeline({
			scrollTrigger: {
				trigger: '#all-episodes-2',
				start: 'top center'
			}
		});
        tl2
            .to('#all-episodes #laugh-rate .bar',{
                translateX: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            })
            .to('#all-episodes #laugh-rate .label',{
                translateX: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            }, '<-0.8')
            .to('#all-episodes #laugh-rate .avg-label, #all-episodes #laugh-rate .avg-line',{
                translateY: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            }, '<-0.8');

        const tl3 = gsap.timeline({
			scrollTrigger: {
				trigger: '#all-episodes-3',
				start: 'top center'
			}
		});
        tl3
            .to('#all-episodes #imdb-rating .bar',{
                translateX: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            })
            .to('#all-episodes #imdb-rating .label',{
                translateX: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            }, '<-0.8')
            .to('#all-episodes #imdb-rating .avg-label, #all-episodes #imdb-rating .avg-line',{
                translateY: 0,
                opacity: 1,
                ease: 'power3.out',
                duration: 1
            }, '<-0.8')
        }, 3000);
	});
</script>

<svelte:window bind:innerWidth />

<div id="all-episodes" class="relative mt-96 mb-0 pb-80" style="width: calc(100vw - 25px);">
    <div id="all-episodes-visualizations" class="h-screen flex absolute top-0 left-0" style="width: calc(100vw - 25);">
        <EpisodeBars 
            {episodesData} 
            barsHeight={stripHeight} 
            width={ innerWidth >= 1066 ? 2 * innerWidth / 3 - 25 : innerWidth - 50} 
            {topMargin} 
            {episodeVerticalPositionScale}
            bind:handleMouseEnter
            bind:handleMouseLeave />
        {#if innerWidth >= 1066}
            <LaughRate 
                {episodesData} 
                barsHeight={stripHeight} 
                width={smallChartWidth} 
                {topMargin} 
                {episodeVerticalPositionScale} 
                {percentageScale}
                bind:handleMouseEnter
                bind:handleMouseLeave />
            <ImDbRating
                {episodesData} 
                barsHeight={stripHeight} 
                width={smallChartWidth} 
                {topMargin} 
                {episodeVerticalPositionScale} 
                {percentageScale}
                bind:handleMouseEnter
                bind:handleMouseLeave />
        {/if}
    </div>

    <!-- Scrolling Texts -->
	<div class="z-10 relative" style="pointer-events: none">
		<AllEpisodesTexts />
	</div>


    <!-- Tooltip -->
	{#if isTooltipVisible && innerWidth >= 793}
        <div class="fixed top-0 z-20 h-screen" style="width: calc(100vw - 25px); left: 25px; pointer-events: none;">
		    <EpisodeTooltip episode={hoveredEpisode} position={mousePosition} />
        </div>
	{/if}
</div>