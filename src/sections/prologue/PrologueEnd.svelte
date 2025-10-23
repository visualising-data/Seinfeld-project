<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';

  onMount(() => {
    const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '#prologue-end',
				start: 'top top',
        end: 'bottom top',
				toggleActions: 'play reverse play reverse'
			}
		});

    tl.to('#prologue-end .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
    })
  })
</script>

<div id="prologue-end" class="w-screen h-screen" style="margin-top: 800px;">
  <div class="h-screen container flex content-center flex-wrap">
    <div style="max-width: 900px;">In 2024 I decided it was time to work on a new product, to reach a wider
					audience with a completely new format: The Seinfeld Chronicles <span class="highlight">digital edition</span>.</div>
  </div>
</div>