<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';

  onMount(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#intro-end',
        start: 'top top',
        end: 'bottom top',
        toggleActions: 'play reverse play reverse',
      },
    });

    tl.to('#intro-end .highlight', {
      webkitTextFillColor: 'transparent',
      backgroundPosition: '200% center',
      duration: 2,
      delay: 1,
      ease: 'power3.out',
    });
  });
</script>

<div class="pt-80 bg-black text-white">
  <div id="intro-end" class="h-[100dvh] w-screen">
    <div class="h-[100dvh] container flex content-center flex-wrap">
      <div style="max-width: 900px;">
        <p>That’s what the rhythm and texture looks - and sounds! - like for each episode.</p>
        <p>
          Now let’s take a broader view of some of the <span class="highlight"
            >overall patterns</span
          > this episodic data reveals across the nine seasons, for each lead character, supporting character
          and for every location.
        </p>
      </div>
    </div>
  </div>
</div>
