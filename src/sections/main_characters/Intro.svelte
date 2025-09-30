<script>
  import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import Lenis from 'lenis';
	import { soundIsAuth } from '../../stores/soundAuthStore';
  import { characters } from "$lib/data/characters";
  import { getCharacterImagePath } from "../../utils/getCharacterImagePath";

  const mainChars = characters.slice(0, 4);

  onMount(() => {
    gsap.set('#lead-chars-intro p', { translateY: 100, opacity: 0 });

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#lead-chars-intro',
        start: 'top top',
        end: 'bottom top',
        pin: '#lead-chars-intro-text-container'
      }
    });
    tl1
      .to('#lead-chars-intro p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 }
      })
      .to('#lead-chars-intro .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out',
        stagger: { each: 0.3, ease: 'power3.out' }
      }, '<-0.7');

    // Add parallax effect to videos
		let chars = gsap.utils.toArray('.lead-char-parallax');
		chars.forEach((char) => {
			const speed = char.dataset.speed;
			gsap.to(char, {
				yPercent: speed * 50,
				ease: 'none',
				scrollTrigger: {
					trigger: char,
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
  })
</script>

<div id="lead-chars-intro" class="bg-black text-white relative" style="padding-bottom: 100vh;">
  <div class="container">
    <div class="grid grid-cols-12 gap-4">
      <div id="lead-chars-intro-text-container" class="col-span-12 md:col-span-7 h-screen flex flex-col justify-center">
        <p>It was no surprise to find the majority of screen-time was dominated by the four leading characters - <span class="highlight">Jerry</span>, <span class="highlight">George</span>, <span class="highlight">Elaine</span>, and <span class="highlight">Kramer</span>.</p>
        <p>They were the stars who delivered most of the lines, acted out the stories, and ultimately caused the majority of the laughs.</p>
        <p>In this section we’ll explore the time they spent on screen, their individual shares of laughs, and how they were used in combinations in scenes to create memorable moments.</p>
      </div>
    </div>

      <!-- Characters -->
    <div class="container absolute z-1" style="height: 1400px; top: 100vh; left: 0; right: 0;">
      <div class="grid grid-cols-12 gap-4">
        <div class="md:col-span-1"></div>
          <div class="col-span-12 md:col-span-11 h-screen flex flex-col justify-center">
            <ul class="flex justify-between mt-4">
              {#each mainChars as char, i}
                <li class="my-2">
                  <div 
                    class="lead-char-parallax relative flex flex-col items-center"
                    style="top: {i % 2 === 0 ? 0 : '160px'}; background-color: rgba(18, 2, 10, 0.7);"
                    data-speed={i % 2 === 0 ? 3 : 0.5} 
                  >
                    <div 
                      class="relative character rounded-full bg-contain bg-center shadow-md" 
                      style="
                        background-image: url('{getCharacterImagePath(char.id)}'); 
                        width: 100px; 
                        height: 100px;
                      "></div>
                    <div>{char.label}</div>
                  </div>
                </li>
              {/each}
            </ul>
          </div> 
        </div>
      </div>
  </div>
</div>