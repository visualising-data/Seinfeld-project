<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';

  let ctx: gsap.Context;

  onMount(() => {
    ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: '#prologue-after-video',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        })
        .to('#prologue-after-video .highlight', {
          webkitTextFillColor: 'transparent',
          backgroundPosition: '200% center',
          duration: 2,
          ease: 'power3.out',
          stagger: 0.5,
        });
    });
  });

  onDestroy(() => ctx?.revert());
</script>

<div id="prologue-after-video" class="w-screen h-[100dvh] bg-black">
  <div class="h-[100dvh] container flex content-center flex-wrap">
    <div class="bg-black" style="max-width: 900px;">
      We'll learn a lot more about all the <span class="highlight">characters</span> and
      <span class="highlight">locations</span> later.
    </div>
  </div>
</div>
