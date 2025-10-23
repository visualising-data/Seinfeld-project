<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';

  onMount(() => {
    const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '#intro-end',
				start: 'top top',
        end: 'bottom top',
				toggleActions: 'play reverse play reverse'
			}
		});

    tl.to('#intro-end .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
    })
  })
</script>

<div class="pt-80 bg-black text-white">
  <div id="intro-end" class="h-screen w-screen">
    <div class="h-screen container flex content-center flex-wrap">
      <div style="max-width: 900px;">
        <p>But ‘why!’ you might ask.</p> 
        <p>It was all done to explore how Jerry Seinfeld and Larry David, with the support of their group of talented writers, managed to achieve such <span class="highlight">sustained sit-com brilliance</span>. Much like a football coach seeks to assemble the right players, in the right combinations, to win a game, we wanted to explore how the Seinfeld coaching team used their resources, assembling the right characters, in the right scenes, to score the laughs and create a winning sit-com.</p>
        <p>Let’s look closer at the data and see what it’s showing.</p>
      </div>
    </div>
  </div>
</div>