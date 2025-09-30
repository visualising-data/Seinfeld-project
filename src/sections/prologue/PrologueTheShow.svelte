<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import Lazy from 'svelte-lazy';
	import { soundIsAuth } from '../../stores/soundAuthStore';
	import tv_noise from '$lib/assets/tv_noise.png';

	let innerWidth = $state(1600);
	let sideSpacing = $derived(innerWidth >= 1536 ? (innerWidth - 1536) / 2 : 30);
	let gridWidth = $state(1500);
	let colWidth = $derived((gridWidth - 11 * 16) / 12);

	let isMouseOn1 = $state(false);
	let isMouseOn2 = $state(false);
	let isMouseOn3 = $state(false);
	let isMouseOn4 = $state(false);
	let isMouseOn5 = $state(false);
	let isMuted1 = $state(true);
	let isMuted2 = $state(true);
	let isMuted3 = $state(true);
	let isMuted4 = $state(true);
	let isMuted5 = $state(true);

	$effect(() => {
		isMuted1 = !(isMouseOn1 && $soundIsAuth);
		isMuted2 = !(isMouseOn2 && $soundIsAuth);
		isMuted3 = !(isMouseOn3 && $soundIsAuth);
		isMuted4 = !(isMouseOn4 && $soundIsAuth);
		isMuted5 = !(isMouseOn5 && $soundIsAuth);
	});

	const handleMouseEnter = (/** @type {number} */ section) => {
		switch (section) {
			case 1:
				isMouseOn1 = true;
				return;
			case 2:
				isMouseOn2 = true;
				return;
			case 3:
				isMouseOn3 = true;
				return;
			case 4:
				isMouseOn4 = true;
				return;
			case 5:
				isMouseOn5 = true;
				return;
		}
	};
	const handleMouseLeave = (/** @type {number} */ section) => {
		switch (section) {
			case 1:
				isMouseOn1 = false;
				return;
			case 2:
				isMouseOn2 = false;
				return;
			case 3:
				isMouseOn3 = false;
				return;
			case 4:
				isMouseOn4 = false;
				return;
			case 5:
				isMouseOn5 = false;
				return;
		}
	};

	onMount(() => {
		const tl1 = gsap.timeline({
			scrollTrigger: {
				trigger: '#the-show-1',
				start: 'bottom bottom',
				end: 'top top'
			}
		});
		const tl2 = gsap.timeline({
			scrollTrigger: {
				trigger: '#the-show-2',
				start: 'bottom bottom',
				end: 'top top'
			}
		});
		const tl3 = gsap.timeline({
			scrollTrigger: {
				trigger: '#the-show-3',
				start: 'top bottom-=20%',
				end: 'top top-=20%'
			}
		});
		const tl4 = gsap.timeline({
			scrollTrigger: {
				trigger: '#the-show-4',
				start: 'bottom bottom',
				end: 'top top-=20%'
			}
		});
		const tl5 = gsap.timeline({
			scrollTrigger: {
				trigger: '#the-show-5',
				start: 'top bottom',
				end: 'bottom top-=20%'
			}
		});

		const videoTransform =  {
                scaleY: 0,
                ease: 'power3.out',
                duration: 1
            };

		tl1.from(["#the-show-1 .text, #the-show-1 h5"], {
                xPercent: -140,
                stagger: .1
            })
            .from('#the-show-1 .video-container', videoTransform, "-=.3")
		tl2.from(["#the-show-2 .text, #the-show-2 h5"], {
                xPercent: 140,
                stagger: .1
            })
            .from('#the-show-2 .video-container', videoTransform, "-=.3")
		tl3.from(["#the-show-3 .text, #the-show-3 h5"], {
                yPercent: 140,
                stagger: .1
            })
            .from('#the-show-3 .video-container', videoTransform, "-=.3")
		tl4.from(["#the-show-4 .text, #the-show-4 h5"], {
                xPercent: 140,
                stagger: .1
            })
            .from('#the-show-4 .video-container', videoTransform, "-=.3")
		tl5.from(["#the-show-5 .text, #the-show-5 h5"], {
                yPercent: 140,
                stagger: .1
            })
            .from('#the-show-5 .video-container', videoTransform, "-=.3")
	});
</script>

<svelte:window bind:innerWidth />

<section id="the-show">
	<div class="container pt-96">
		<!-- The show about nothing -->
		<div
			id="the-show-1"
			class="grid grid-cols-12 gap-4 mb-24" 
			role="presentation"
			bind:clientWidth={gridWidth}
			onmouseenter={() => handleMouseEnter(1)}
			onmouseleave={() => handleMouseLeave(1)}
		>
			<div class="col-span-7 md:col-span-4 mask">
				<div class="text">It only took a handful of episodes for me to find myself completely hooked. Seinfeld was written in a different key, deviating from the traditional rules of sitcoms, focusing on - and amplifying - the minutiae of daily life, earning its reputation as <a href="https://www.latimes.com/archives/la-xpm-1993-03-04-ca-474-story.html" target="_blank">the show about nothing</a>.</div></div>
			<div class="col-span-5">
				<!-- svelte-ignore a11y_media_has_caption -->
				 <div class="relative video-container">
					<!-- <Lazy keep={true} height={340 * 5 * colWidth / 604} offset="100vh"> -->
						<video playsinline autoplay bind:muted={isMuted1} loop>
							<source
								src="https://amdufour.github.io/hosted-data/apis/videos/6c.ShowAboutNothing.mp4"
								type="video/mp4"
							/>
						</video>
					<!-- </Lazy> -->
					<div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
					<div
						class="absolute z-10 bottom-0 left-0 right-0 top-0"
						style="background-image: url('{tv_noise}')"
					></div>
				</div>
				<div class="mask">
					<h5 class="mt-2">S4E3 - The Pitch</h5>
				</div>
			</div>
		</div>
		
		<!--  Irreverent characters -->
		<div 
			id="the-show-2"
			class="grid grid-cols-12 gap-4 mb-52" role="presentation"
			style="margin-left: -{sideSpacing}px;"
			onmouseenter={() => handleMouseEnter(2)}
			onmouseleave={() => handleMouseLeave(2)}
		>
			<div class="col-span-5 md:col-span-7">
				<!-- svelte-ignore a11y_media_has_caption -->
				 <div class="relative video-container">
					<!-- <Lazy keep={true} height={340 * 7 * colWidth / 604} offset="100vh"> -->
						<video playsinline autoplay bind:muted={isMuted2} loop>
							<source
								src="https://amdufour.github.io/hosted-data/apis/videos/32.Minutiae.mp4"
								type="video/mp4"
							/>
						</video>
					<!-- </Lazy> -->
					<div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
					<div
						class="absolute bottom-0 left-0 right-0 top-0"
						style="background-image: url('{tv_noise}')"
					></div>
				</div>
				<div class="mask">
					<h5 class="mt-2">S8E3 - The Bizzaro Jerry</h5>
				</div>
			</div>
			<div class="col-span-7 md:col-span-3 mask">
				<div class="text">I loved the irreverent characters, with their absurd obsessions and neurotic tendencies, and the hilariously avoidable situations they found themselves in.</div>
			</div>
		</div>

		<!--  No hugging, no learning -->
		<div 
			id="the-show-3"
			class="grid grid-cols-12 gap-4 mb-52" role="presentation"
			style="margin-left: {innerWidth >= 768 ? -sideSpacing : 0}px;"
			onmouseenter={() => handleMouseEnter(3)}
			onmouseleave={() => handleMouseLeave(3)}
		>
			<div class="col-auto md:col-span-2"></div>
			<div class="col-span-12 md:col-span-8">
				<div class="mask">
					<div class="text">
						<div>It rejected the classic three-act story, sidestepping sentimentality and the pursuit of resolution. With its mantra of <span class="highlight" style="-webkit-text-fill-color: transparent">no hugging*, no learning</span> the lead characters were insecure and entertainingly flawed, lacking any desire and capability for personal growth.</div>
						<div class="number mb-2 text-right">*the earlier clip notwithstanding!</div>
					</div>
				</div>
				<div>
					<!-- svelte-ignore a11y_media_has_caption -->
					<div class="relative video-container">
						<!-- <Lazy keep={true} height={340 * 8 * colWidth / 604} offset="100vh"> -->
							<video playsinline autoplay bind:muted={isMuted3} loop>
								<source
									src="https://amdufour.github.io/hosted-data/apis/videos/11a.GoodSamaritan.mp4"
									type="video/mp4"
								/>
							</video>
						<!-- </Lazy> -->
						<div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
						<div
							class="absolute bottom-0 left-0 right-0 top-0"
							style="background-image: url('{tv_noise}')"
						></div>
					</div>
					<div class="mask">
						<h5 class="mt-2">S9E24 - The Good Samaritan Law</h5>
					</div>
				</div>
			</div>
		</div>

		<!-- Anti heroes -->
		<div 
			id="the-show-4"
			class="grid grid-cols-12 gap-4 mb-44" role="presentation"
			style="margin-right: {innerWidth >= 768 ? -sideSpacing : -sideSpacing}px;"
			onmouseenter={() => handleMouseEnter(4)}
			onmouseleave={() => handleMouseLeave(4)}
		>
			<div class="col-span-1 md:col-span-2"></div>
			<div class="col-span-6 md:col-span-5 mask">
				<div class="text">As with any shows from its time, as <a href="https://www.theguardian.com/culture/2024/oct/16/jerry-seinfeld-tom-papa-breaking-bad-podcast-interview-politics-comedy-extreme-left-pc-crap-#:~:text=%E2%80%9CDoes%20culture%20change,my%20skiing%20analogy.%E2%80%9D" target="_blank">culture and society evolve</a> a contemporary lens exposes negative stereotypes and flashes of chauvinism and sizeism, to name but two isms. The amoral instincts of these <a href="https://www.theguardian.com/tv-and-radio/2018/may/10/no-hugging-no-learning-20-years-on-seinfelds-mantra-still-looms-large" target="_blank">anti-heroes</a> was most on-show in their romantic encounters and when faced with the slightest adversity or irrational annoyance.</div>
			</div>
			<div class="col-span-5">
				<!-- svelte-ignore a11y_media_has_caption -->
				 <div class="relative video-container">
					<!-- <Lazy keep={true} height={340 * 5 * colWidth / 604} offset="100vh"> -->
						<video playsinline autoplay bind:muted={isMuted4} loop>
							<source
								src="https://amdufour.github.io/hosted-data/apis/videos/13a.TheNose.mp4"
								type="video/mp4"
							/>
						</video>
					<!-- </Lazy> -->
					<div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
					<div
						class="absolute bottom-0 left-0 right-0 top-0"
						style="background-image: url('{tv_noise}')"
					></div>
				</div>
				<div class="mask">
					<h5 class="mt-2">S3E9 - The Nose Job</h5>
				</div>
			</div>
		</div>


		<!--  The dancing -->
		<div 
			id="the-show-5"
			class="grid grid-cols-12 gap-4 pb-52" role="presentation"
			style="margin-left: {innerWidth >= 768 ? -sideSpacing : 0}px;"
			onmouseenter={() => handleMouseEnter(5)}
			onmouseleave={() => handleMouseLeave(5)}
		>
			<div class="col-auto md:col-span-2"></div>
			<div class="col-span-12 md:col-span-10">
				<div class="mb-2 mask">
					<div class="text">And then there’s the dancing.</div>
				</div>
				<div>
					<!-- svelte-ignore a11y_media_has_caption -->
					<div class="relative video-container">
						<!-- <Lazy keep={true} height={340 * 10 * colWidth / 604} offset="100vh"> -->
							<video playsinline autoplay bind:muted={isMuted5} loop>
								<source
									src="https://amdufour.github.io/hosted-data/apis/videos/14.ElaineDancing.mp4"
									type="video/mp4"
								/>
							</video>
						<!-- </Lazy> -->
						<div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
						<div
							class="absolute bottom-0 left-0 right-0 top-0"
							style="background-image: url('{tv_noise}')"
						></div>
					</div>
					<div class="mask">
						<h5 class="mt-2">S8E4 - The Little Kicks</h5>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>