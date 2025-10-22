<script>
// @ts-nocheck

    import { onMount } from 'svelte';
    import * as Tone from 'tone';
	import { gsap } from 'gsap/dist/gsap';
    import { scaleLinear } from 'd3-scale';
    import { flatGroup, range } from 'd3-array';

    import Laugh from '../../icons/Laugh.svelte';
    import tv_noise from '$lib/assets/tv_noise.png';
    import ReplayButton from '../../UI/ReplayButton.svelte';
    import { soundIsAuth } from '../../stores/soundAuthStore'
    import { laughterFiles, getRandomLaughterFile } from '$lib/data/laughterFiles';
    import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
    import { characters as charactersAll } from '$lib/data/characters';
    import { formatTimeLabel } from '../../utils/formatTime';

    let { laughData } = $props();

    const characters = charactersAll.slice(0, 4)

    const videoStartTime = 18 * 60 + 35 // 18:35
    const videoEndTime = 20 * 60 + 35 // 20:35
    const videoLaughs = laughData.filter((/** @type {{ eventTimeSeconds: string; }} */ d) => +d.eventTimeSeconds >= videoStartTime && +d.eventTimeSeconds <= videoEndTime);
    const videoDuration = videoEndTime - videoStartTime;
    const fiveSecondsArray = range(videoStartTime - 5, videoEndTime + 5, 5);

    let innerWidth = $state(1600);
    let videoWidth = $state(800);
	let sideSpacing = $derived(innerWidth >= 1280 ? (innerWidth - 1280) / 2 + 16 + 25 : 32)
    
    let isMuted = $state(true);
    $effect(() => {
		isMuted = !$soundIsAuth;
	});

    let laughsBarScale = $derived(
        scaleLinear()
            .domain([videoStartTime, videoEndTime + 1])
            .range([0, videoWidth])
    );
    let laughWidth = $derived(laughsBarScale(videoStartTime + 5) - 8);

    /**
	 * @type {Tone.Players}
	 */
	let laughTracks;
	const preloadLaughs = () => {
		// @ts-ignore
		laughTracks = new Tone.Players(laughterFiles).toDestination(); //connects to the system sound output
        laughTracks.fadeIn = 1;
        laughTracks.fadeOut = 1;
    };

    let isPlaying = $state(false)
    const playLaughs = () => {
        if ($soundIsAuth && laughTracks) {
            const file = getRandomLaughterFile()
            const player = laughTracks.player(file)
            
            player.onstop = () => {
                isPlaying = false
            }
                
            player.start();
            isPlaying = true
        }
    };
    const stopLaughs = () => {
        laughTracks.stopAll()
    }

    function handleClickOnReplay() {
        if (laughTracks.state === 'started') {
            laughTracks.stopAll()
        } else {
            playLaughs();
        }
    }

    let tlVideo;
    onMount(() => {
        preloadLaughs();
        
        const assetTransform =  {
                scaleY: 0,
                ease: 'power3.out',
                duration: 1
            };

		const tl1 = gsap.timeline({
			scrollTrigger: {
				trigger: '#data-gathering-1',
				start: 'top center',
                end: 'bottom top',
                onEnter: () => playLaughs(),
                onEnterBack: () => playLaughs(),
                onLeave: () => stopLaughs(),
                onLeaveBack: () => stopLaughs(),
			}
		});
		const tl2 = gsap.timeline({
			scrollTrigger: {
				trigger: '#data-gathering-2',
				start: 'top center'
			}
		});
		const tl3 = gsap.timeline({
			scrollTrigger: {
				trigger: '#data-gathering-3',
				start: 'top center'
			}
		});


		tl1
            .from(["#data-gathering-1 .text"], {
                xPercent: -140,
                stagger: .1
            })
            .from('#data-gathering-1 img', assetTransform, "-=.3")
            .to('#data-gathering-1 .highlight', {
                webkitTextFillColor: 'transparent',
                backgroundPosition: '200% center',
                duration: 2,
                delay: 1,
                ease: 'power3.out'
            }, "<0.5")
            .from(["#data-gathering-1 .laugh-icon-large svg"], {
                yPercent: 140,
                opacity: 0,
                duration: 1,
                ease: 'bounce.out'
            }, 0.5)
            .from(["#data-gathering-1 .replay-laugh"], {
                opacity: 0,
                duration: 0.5
            }, "-=0.5");

        tl2
            .from(["#data-gathering-2 .text"], {
                xPercent: 140,
                stagger: .1
            })
            .from('#data-gathering-2 img', assetTransform, "-=.3")
            .to('#data-gathering-2 .highlight', {
                webkitTextFillColor: 'transparent',
                backgroundPosition: '200% center',
                duration: 2,
                delay: 1,
                ease: 'power3.out'
            }, "-=2");

        tl3
            .from(["#data-gathering-3 .text"], {
                xPercent: -140,
                stagger: .1
            })
            .from('#data-gathering-3 .video-container', assetTransform, "-=.3")
            .to('#data-gathering-3 .highlight', {
                webkitTextFillColor: 'transparent',
                backgroundPosition: '200% center',
                duration: 2,
                delay: 1,
                ease: 'power3.out'
            }, "-=2");
        tlVideo = gsap.timeline({
			scrollTrigger: {
				trigger: '#data-gathering-3 svg',
				start: 'top top-=10%',
                end: 'bottom top',
				toggleActions: 'play reset play reset',
                onEnter: () => playVideo(),
                onLeave: () => pauseVideo(),
                onEnterBack: () => playVideo(),
                onLeaveBack: () => pauseVideo(),
			}
		});
        const laughIconReveal = { opacity: 0, yPercent: 50, duration: 1, ease: 'power3.out' };
        
        setTimeout(() => {
            laughsBarScale.range([0, videoWidth]);
            
            tlVideo
                .to('#data-gathering-3 circle', {
                    cx: laughsBarScale(videoEndTime),
                    ease: 'none',
                    duration: videoDuration
                })
                .from('.laugh-icon-1115', laughIconReveal, 1115 - videoStartTime)
                .from('.laugh-icon-1125', laughIconReveal, 1125 - videoStartTime)
                .from('.laugh-icon-1130', laughIconReveal, 1130 - videoStartTime)
                .from('.laugh-icon-1145', laughIconReveal, 1145 - videoStartTime)
                .from('.laugh-icon-1150', laughIconReveal, 1150 - videoStartTime)
                .from('.laugh-icon-1160', laughIconReveal, 1160 - videoStartTime)
                .from('.laugh-icon-1165', laughIconReveal, 1165 - videoStartTime)
                .from('.laugh-icon-1170', laughIconReveal, 1170 - videoStartTime)
                .from('.laugh-icon-1185', laughIconReveal, 1185 - videoStartTime)
                .from('.laugh-icon-1190', laughIconReveal, 1190 - videoStartTime)
                .from('.laugh-icon-1195', laughIconReveal, 1195 - videoStartTime)
                .from('.laugh-icon-1200', laughIconReveal, 1200 - videoStartTime)
                .from('.laugh-icon-1205', laughIconReveal, 1205 - videoStartTime)
                .from('.laugh-icon-1210', laughIconReveal, 1210 - videoStartTime)
                .from('.laugh-icon-1215', laughIconReveal, 1215 - videoStartTime)
                .from('.laugh-icon-1220', laughIconReveal, 1220 - videoStartTime)
                .from('.laugh-icon-1225', laughIconReveal, 1225 - videoStartTime)
                .from('.laugh-icon-1230', laughIconReveal, 1230 - videoStartTime)
        }, 3000)

        const video = document.getElementById("demo-video");

        const playVideo = () => {
            video?.play();
            tlVideo.restart()
        };
        const pauseVideo = () => {
            video?.pause();
            video.currentTime = 0;
            tlVideo.pause()
        };

        video.addEventListener('play', playVideo)
        video.addEventListener('pause', pauseVideo)
    });

    const getLaughVerticalIndex = (char) => {
        switch (char) {
            case 'JERRY':
                return 0;
            case 'GEORGE':
                return 1;
            case 'ELAINE':
                return 2;
            case 'KRAMER':
                return 3;
        }
    }
</script>

<svelte:window bind:innerWidth />

<div class="w-screen" style="margin-left: {innerWidth >= 768 ? -25 : 0}px;">
    <div class="container py-96">
        <div id="data-gathering-1" class="grid grid-cols-12 mb-48">
            <div class="col-span-10 md:col-span-6 relative">
                <div class="mask">
                    <div class="text">It doesn’t take a genius to recognise the main goal of a sitcom is to offer situational comedy. It also stands to reason that a reliable indicator of a situation comedy being funny is to measure the reaction of an audience’s laughter through the laugh track. These days it is rare to find laugh tracks on modern sitcoms, but Seinfeld had one and with the show always being filmed in front of a <span class="highlight pl-1">live studio audience</span> (any scenes filmed outside were played back in the studio) so the laughter heard is authentic.</div>
                </div>
                <div class="absolute flex items-end" style="top:-68px; right: {innerWidth >= 768 ? -140 : -50}px;">
                    <div class="laugh-icon-large w-20 md:w-36 h-20 md:h-32">
                        <Laugh isActive={isPlaying} />
                    </div>
                    <div class="replay-laugh" style="margin-left: -20px;">
                        <ReplayButton {isPlaying} bind:handleClickOnReplay />
                    </div>
                </div>
            </div>
            <div class="col-span-2 md:col-span-6"></div>
            <div class="col-span-2 md:col-span-4"></div>
            <div class="col-span-10 md:col-span-8 mt-8" style="margin-right: -{sideSpacing}px;">
                <img class="data-gathering-parallax" src="https://amdufour.github.io/hosted-data/apis/images/audience.jpg" alt="Jerry Seinfeld talking with the audience during taping." />
                <div class="number text pt-2" style="background-color: rgba(249, 245, 247, 0.6);">Photo source: <a href="https://www.facebook.com/story.php?story_fbid=539096318663826&id=100076903884453" target="_blank">The Seinfeld World</a></div>
            </div>
        </div>

        <div id="data-gathering-2" class="grid grid-cols-12 mb-48">
            <div class="col-auto md:col-span-1"></div>
            <div class="col-span-7" style="margin-right: -50px;">
                <img class="data-gathering-parallax" src="https://amdufour.github.io/hosted-data/apis/images/data_gathering.png" alt="Data spreadsheet and tv during data gathering." />
            </div>
            {#if innerWidth < 768}
                <div class="col-span-4"></div>
                <div class="col-span-2"></div>
            {/if}
            <div class="col-span-10 md:col-span-4 relative z-10 mask" style="background-color: rgba(249, 245, 247, 0.6);">
                <p class="text">We gathered all the data for this project by watching every Seinfeld episode and <span class="highlight">manually logging</span> the events and classifications established to serve the intention of the analysis.</p>
                <p class="text">Laughter has a spectrum of levels, from the subtle smile characteristic of ‘inner’ laughter, through to more external titters, chuckles, chortles, and through to belly laughs or howls. To establish a standard measurement any laughter heard during the episodes counted as a laughter moment”, regardless of whether it was loud or fleeting.</p>
            </div>
        </div>

        <div id="data-gathering-3" class="grid grid-cols-12">
            <div class="col-span-12 md:col-start-3 md:col-span-8 mask">
                <div class="text">
                    <p>For consistency, each observed laughter moment was recorded against an associated <span class="highlight">5-second</span> block of time. When testing out the data collection approach over three sample episodes, the 5-second duration proved to be the most reliable and representative ‘average’ duration, from the gag’s delivery to the audience’s laughter subsiding.</p>
                    <p>Occasionally, laughter would run for longer than 5 seconds, sometimes persisting for 10 and even 15 seconds. In these rare cases, each 5-second unit would count as a laughter moment.</p>
                </div>
            </div>
            <div class="col-start-3 col-span-8" style="margin-left: {innerWidth >= 768 ? 0 : -sideSpacing + 25}px; margin-right: {innerWidth >= 768 ? 0 : -sideSpacing}px;">
                <!-- svelte-ignore a11y_media_has_caption -->
				 <div class="relative video-container w-full">
					<video id="demo-video" playsinline controls bind:muted={isMuted} bind:clientWidth={videoWidth}>
						<source
							src="https://amdufour.github.io/hosted-data/apis/videos/MarineBiologist_edited.mp4"
							type="video/mp4"
						/>
					</video>
					<div class="z-1 absolute bottom-0 left-0 right-0 top-0 pointer-events-none" style="background: rgba(18, 2, 10, 0.3); width: {videoWidth}px;"></div>
					<div
						class="absolute z-10 bottom-0 left-0 right-0 top-0 pointer-events-none"
						style="background-image: url('{tv_noise}'); width: {videoWidth}px;"
					></div>
				</div>
            </div>
            <div class="col-start-1 col-span-2">
                <ul class="relative z-10 shrink-0 pt-8 pr-4" style="margin-top: 14px;">
                    {#each characters as char, i}
                        <li class="mask w-full my-4">
                            <div class="episode-example-character-label flex justify-end">
                                {#if innerWidth >= 1280}
                                    <div class="small flex items-center justify-end pr-2">{char.label}</div>
                                {/if}
                                <div
                                    class="image h-8 w-8 rounded-full"
                                    style="background-image: url({getCharacterImagePath(char.id)});"
                                ></div>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div> 
            <div class="col-span-8">
                <svg class="mt-8" width={videoWidth + 50} height={220} style="margin-left: {-25}px">
                    <g transform="translate(25, 10)">
                        <line x1={-6} y1={12} x2={videoWidth + 6} y2={12} stroke="#928D90" />

                        {#each characters as char, i}
                            <line x1={-6} y1={(i + 1) * 48 + 12} x2={videoWidth + 6} y2={(i + 1) * 48 + 12} stroke="#928D90" />
                        {/each}

                        {#each fiveSecondsArray as fiveSeconds, i}
                            <g transform={`translate(${laughsBarScale(fiveSeconds)}, 0)`}>
                                <line x1={0} y1={6} x2={0} y2={220} stroke="#928D90" />
                                {#if innerWidth >= 768 ? i % 2 !== 0 : i % 5 === 0 }
                                    <text class="number" y={2} text-anchor="middle" fill="#928D90" style="font-size: {innerWidth >= 758 ? 15 : 13}px;">
                                        {formatTimeLabel(fiveSeconds)}
                                    </text>
                                {/if}
                            </g>
                        {/each}
                        
                        {#each videoLaughs as laugh}
                            <g transform={`translate(${laughsBarScale(+laugh.eventTimeSeconds) + 4}, ${getLaughVerticalIndex(laugh.eventAttribute) * 48 + 20})`}>
                                <g class={`laugh-icon laugh-icon-${laugh.eventTimeSeconds}`}>
                                    <Laugh width={laughWidth} height={laughWidth} />
                                </g>
                            </g>
                        {/each}
                        
                        <circle cx={0} cy={12} r={8} fill="#E71D80" />
                    </g>
                </svg>
            </div>
        </div>
    </div>
</div>

<style>
    .image {
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
	}
</style>