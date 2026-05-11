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

<div id="data-gathering-bridge" class="h-[100dvh]">
  <div class="h-[100dvh] container flex content-center flex-wrap">
    <div style="max-width: 900px;">
      <p>
        In addition to measuring the comedy, extensive data was captured about the situation
        [emphasise]: which characters were used in each scene, for how long, and where were the
        scenes set.
      </p>
      <p>
        Let’s see how the laughter data was blended with the character and location data to build a
        unique profile of each episode’s rhythm and texture.
      </p>
    </div>
  </div>
</div>
