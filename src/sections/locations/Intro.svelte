<script>
  import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import Lenis from 'lenis';
	import { soundIsAuth } from '../../stores/soundAuthStore';
	import tv_noise from '$lib/assets/tv_noise.png';
  import { locations } from '$lib/data/locations';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';

  onMount(() => {
    gsap.set('#locations p, #locations .supporting-char', { translateY: 100, opacity: 0 });

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#locations_screen_1',
        start: 'top center'
      }
    });
    tl1
      .to('#locations_screen_1 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 }
      })
      .to('#locations_screen_1 .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
      }, '<-0.5');

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#locations_screen_2',
        start: 'top top<20%'
      }
    });
    tl2
      .to('#locations_screen_2 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
      })
      .to('#locations_screen_2 .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
      }, '<-0.5');

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#locations_screen_3',
        start: 'top center'
      }
    });
    tl3
      .to('#locations_screen_3 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 }
      })
      .to('#locations_screen_3 .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
      }, '<-0.5')
      .to('#locations_screen_3 .supporting-char', {
        translateY: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: { each: 0.1, from: 'random' }
      }, '<-0.5');

    // Add parallax effect to videos
		let videos = gsap.utils.toArray('.parallax');
		videos.forEach((video) => {
			const speed = video.dataset.speed;
			gsap.to(video, {
				yPercent: speed * 50,
				ease: 'none',
				scrollTrigger: {
					trigger: video,
					start: 'top bottom',
					scrub: true
				}
			});
		});

		// Smooth scroll
		const lenis = new Lenis();

		/**
		 * @param {number} time
		 */
		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);
  });

  let video1IsMuted = $state(true);
  let video2IsMuted = $state(true);
  const handleVideoMouseEnter = (/** @type {number} */ video) => {
    if ($soundIsAuth) {
			video1IsMuted = video === 1 ? false : true;
			video2IsMuted = video === 2 ? false : true;
		}
	};
	const handleVideoMouseLeave = (/** @type {{ target: any; }} */ e) => {
		video1IsMuted = true;
		video2IsMuted = true;
	};
</script>

<div id="locations" class="bg-black text-white">
  <!-- Screen 1 -->
  <div id="locations_screen_1" class="md:h-screen w-screen py-60 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 h-screen flex flex-col justify-center">
          <p>After examining the use of characters - lead and supporting, the people in the show - the next dimension that has an influence on the texture of sitcom relates to the classification of locations - <span class="highlight">the where of the show</span>.</p>
          <p>Classifying locations concerns defining the characteristics and use of different settings as the physical backdrop to each scene. Sometimes scenes were set indoors, sometimes outdoors: sometimes scenes were shot in a studio, sometimes they were shot on location.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 2 -->
  <div id="locations_screen_2" class="md:h-screen w-screen py-30 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 md:h-screen flex flex-col justify-center">
          <p>Just as the list of characters grew, so too did the spatial ambitions of the storylines. Once the show became a fixture in NBC's Fall schedule, from Season Three onwards, it gained a significant production budget increase. As Jennifer Keishin Armstrong noted in her book, S3E6 "The Parking Garage" marked the first episode in which an outside custom set, away from a studio audience, was built and used.</p>
          <p>This began a pattern of filming on-location and off-set that gradually expanded the physicality of the Seinfeld universe and signposted the <span class="highlight">commencing of the single-camera comedy era</span>.</p>
        </div>
        <div class="col-span-12 md:col-span-5">
          <div class="grid grid-cols-5 mt-16">
            <div class="col-span-3">
              <div
                class={`parallax`}
                data-speed={0.5}
                role="presentation"
                onmouseenter={() => handleVideoMouseEnter(1)}
                onmouseleave={handleVideoMouseLeave}
              >
                <!-- svelte-ignore a11y_media_has_caption -->
                <video playsinline autoplay loop bind:muted={video1IsMuted}>
                  <source
                    src={`https://amdufour.github.io/hosted-data/apis/videos/2.APlaceToLive.mp4`}
                    type="video/mp4"
                  />
                </video>
                <div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
                <div
                  class="absolute z-10 bottom-0 left-0 right-0 top-0"
                  style="background-image: url('{tv_noise}')"
                ></div>
                <div class="episode">S1E3 - The Robbery</div>
              </div>
            </div>
            <div class="col-span-2"></div>
            <div class="col-span-1"></div>
            <div class="col-span-4 mt-16">
              <div
                class={`parallax`}
                data-speed={-1.2}
                role="presentation"
                onmouseenter={() => handleVideoMouseEnter(2)}
                onmouseleave={handleVideoMouseLeave}
              >
                <!-- svelte-ignore a11y_media_has_caption -->
                <video playsinline autoplay loop bind:muted={video2IsMuted}>
                  <source
                    src={`https://amdufour.github.io/hosted-data/apis/videos/5b.ParkingLot.mp4`}
                    type="video/mp4"
                  />
                </video>
                <div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
                <div
                  class="absolute z-10 bottom-0 left-0 right-0 top-0"
                  style="background-image: url('{tv_noise}')"
                ></div>
                <div class="episode">S3E6 - The Parking Garage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 3 -->
  <div id="locations_screen_3" class="md:h-screen w-screen py-60 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 md:gap-20">
        <div class="col-span-12 md:col-span-7 md:h-screen md:flex md:flex-col md:justify-center">
          <p>As with the task of classifying characters, there were challenges with establishing a robust taxonomy for distinguishing different types of locations. You don't want too many distinct groups, but you want enough to capture the variety of different physical settings.</p>
          <p>The final list of distinct locations would include the homes of the four leads, as well as a further family home to cover all and any family setting. The diner was another common hangout location, but separate from other places of leisure, which would include other restaurants as well as cinemas and indoor sports venues. The lead characters' workplace would be a recurring setting, from Jerry doing his stand-up routines to George working at Yankee Stadium. Scenes set in various forms of transport, like taxis, planes, or cars, were common, as were outside locations like visits to the Hamptons or when disputes arose about street-side parking. An ‘other’ grouping would be necessary to organise together the many other residual additional types of locations used.</p>
        </div>
        <div class="col-span-12 md:col-span-4 flex items-center">
          <div class="grid grid-cols-2 gap-8 flex-wrap">
            {#each locations as location}
              <div class="supporting-char flex flex-col items-center">
                <div class="character rounded-full bg-contain bg-center" 
                     style="background-image: url('{getLocationIconPath(location.id)}'); width: 75px; height: 75px;"></div>
                <div>{location.label}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
	.parallax {
		box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	}
	.episode {
		position: absolute;
		z-index: 2;
		left: 5px;
		bottom: 0;
		font-size: 1.125rem;
		line-height: 1.2;
		font-weight: 600;
		transform: translateY(15px);
		opacity: 0;
		transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.parallax:hover .episode {
		transform: translateY(0);
		opacity: 1;
	}
</style>