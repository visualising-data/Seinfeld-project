<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  onMount(() => {
    gsap.set('#data-gathering-bridge p', { translateY: 100, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#data-gathering-bridge',
        start: 'top 80%',
      },
    });

    tl.to('#data-gathering-bridge p', {
      translateY: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  });
</script>

<div id="data-gathering-bridge" class="h-screen">
  <div class="h-screen container flex content-center flex-wrap">
    <p style="max-width: 900px;">Let's look at how we took this laughter data and used it to build a profile of each episode's rhythm and texture.</p>
  </div>
</div>
