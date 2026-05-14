<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      gsap.to('#data-gathering-bridge .highlight-reverse', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#data-gathering-bridge',
          start: 'top center',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
    });
  });

  onDestroy(() => {
    ctx?.revert();
  });
</script>

<div id="data-gathering-bridge" class="h-[100dvh]">
  <div class="h-[100dvh] container flex content-center flex-wrap">
    <div style="max-width: 900px;">
      <p>
        In addition to measuring the comedy, extensive data was captured about <span
          class="highlight-reverse">the situation</span
        >: which characters were used in each scene, for how long, and where were the scenes set.
      </p>
      <p>
        Let’s see how the laughter data was blended with the character and location data to build a
        unique profile of each episode’s rhythm and texture.
      </p>
    </div>
  </div>
</div>
