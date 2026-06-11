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
            trigger: '#prologue-before-book',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        })
        .to('#prologue-before-book .highlight', {
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

<div id="prologue-before-book" class="w-screen h-[100dvh] bg-black">
  <div class="h-[100dvh] container flex content-center flex-wrap">
    <div class="bg-black" style="max-width: 900px;">
      <p>
        I was intrigued by the possibilities of mixing work with pleasure: <span class="highlight"
          >visually exploring a sitcom through its data</span
        >.
      </p>
      <p>
        Intrigued became compelled. I wanted to explore how Seinfeld and David, with the support of
        their evolving pool of talented writers, managed to achieve such sustained sitcom
        brilliance. Much like a sports coach seeks to assemble the right players in the right
        combinations, to win a game, how did the Seinfeld ‘coaching team’ use their resources to
        assemble the right characters in the right scenes, in order to score the laughs and create
        TV gold?
      </p>
    </div>
  </div>
</div>
