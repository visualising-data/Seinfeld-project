<script>
  import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import Lenis from 'lenis';
	import { soundIsAuth } from '../../stores/soundAuthStore';
	import tv_noise from '$lib/assets/tv_noise.png';
  import { characters } from '$lib/data/characters';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';

  const supportingChars = $derived(characters.slice(4, characters.length - 1));

  onMount(() => {
    gsap.set('#supporting_chars p, #supporting_chars .supporting-char', { translateY: 100, opacity: 0 });

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#supporting_chars_screen_1',
        start: 'top center'
      }
    });
    tl1
      .to('#supporting_chars_screen_1 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 }
      })
      .to('#supporting_chars_screen_1 .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
      }, '<-0.5');

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#supporting_chars_screen_2',
        start: 'top top<20%'
      }
    });
    tl2
      .to('#supporting_chars_screen_2 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
      })
      .to('#supporting_chars_screen_2 .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
      }, '<-0.5');

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#supporting_chars_screen_3',
        start: 'top center'
      }
    });
    tl3
      .to('#supporting_chars_screen_3 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 }
      })
      .to('#supporting_chars_screen_3 .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
      }, '<-0.5')
      .to('#supporting_chars_screen_3 .supporting-char', {
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

<div id="supporting_chars" class="bg-black text-white">
  <!-- Screen 1 -->
  <div id="supporting_chars_screen_1" class="md:h-screen w-screen py-60 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 h-screen flex flex-col justify-center">
          <p>As a show grows, it is inevitable that so does the universe of different characters. And as the list of potential characters grows, so too does the temptation to use them more to deliver the storylines.</p>
          <p><span class="highlight">Supporting characters</span> come and go but will appear quite frequently, are quite popular, and are usually played by the same actors for continuity. <span class="highlight">Transient characters</span> tend to appear just once, are often unnamed, and primarily exist to help progress a single strand of an episode story.</p>
          <p>In any sitcom, you will have permanent lead characters, supporting or recurring characters, and transient characters. At the start of the data-gathering exercise, it wasn't necessarily obvious how to best categorise and distinguish those non-lead characters.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 2 -->
  <div id="supporting_chars_screen_2" class="md:h-screen w-screen py-30 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 md:col-span-7 md:h-screen flex flex-col justify-center">
          <p>The main struggle was to strike a balance between creating enough distinct character categories, with sufficient individuality for those who warrant it, but not carving out too many that the list becomes excessive and unwieldy. For instance, recurring characters like Jerry and Kramer's neighbour, <span class="highlight">Newman</span>, or Elaine's boss, <span class="highlight">J. Peterman</span>, have a cult following that made it tempting to mark them out as distinct individual characters.</p>
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
                    src={`https://amdufour.github.io/hosted-data/apis/videos/${'17.Jerry_Newman'}.mp4`}
                    type="video/mp4"
                  />
                </video>
                <div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
                <div
                  class="absolute z-10 bottom-0 left-0 right-0 top-0"
                  style="background-image: url('{tv_noise}')"
                ></div>
                <div class="episode">S8E2 - The Soulmate</div>
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
                    src={`https://amdufour.github.io/hosted-data/apis/videos/${'7a.Peterman'}.mp4`}
                    type="video/mp4"
                  />
                </video>
                <div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
                <div
                  class="absolute z-10 bottom-0 left-0 right-0 top-0"
                  style="background-image: url('{tv_noise}')"
                ></div>
                <div class="episode">S9E18 - The Frogger</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Screen 3 -->
  <div id="supporting_chars_screen_3" class="md:h-screen w-screen py-60 md:py-0">
    <div class="container">
      <div class="grid grid-cols-12 md:gap-20">
        <div class="col-span-12 md:col-span-7 md:h-screen md:flex md:flex-col md:justify-center">
          <p>The ultimate decision was to create categories for the four respective families of the lead characters, as well as groupings for acquaintances - specifically, love interests, friends, neighbours, colleagues - and then a final other persons group to sweep up the growing list of transient characters.</p>
          <p>When classifying supporting characters, it was <span class="highlight">their central purpose in that episode</span> that informed their grouping, e.g. a friend of Elaine's who dates George would be considered a love interest, rather than a friend. Some supporting characters were therefore alternated into different groupings across the show (e.g. a former love interest may shift to become a friend, and vice-versa).</p>
        </div>
        <div class="col-span-12 md:col-span-4 flex items-center">
          <div class="grid grid-cols-2 gap-8 flex-wrap">
            {#each supportingChars as char}
              <div class="supporting-char flex flex-col items-center max-w-28">
                <div class="character rounded-full bg-contain bg-center" 
                     style="background-image: url('{getCharacterImagePath(char.id)}'); width: 75px; height: 75px;"></div>
                <div class="text-center pt-1" style="font-size: 1.25rem; line-height: 1.2;">{char.label}</div>
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