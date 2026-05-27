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
            trigger: '#prologue-end',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        })
        .to('#prologue-end .highlight', {
          webkitTextFillColor: 'transparent',
          backgroundPosition: '200% center',
          duration: 2,
          ease: 'power3.out',
        });
    });
  });

  onDestroy(() => ctx?.revert());
</script>

<div id="prologue-end" class="w-screen h-[100dvh]" style="margin-top: 800px;">
  <div class="h-[100dvh] container flex content-center flex-wrap">
    <div style="max-width: 520px;">
      <p>
        A few years later, I decided it was time to revisit this work and develop a new format that
        could reach a wider audience.
      </p>
      <p>Presenting, <span class="highlight">The Seinfeld Chronicles</span> digital edition.</p>
    </div>
  </div>
</div>
