<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      gsap.to('#before-video .highlight-reverse', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#before-video',
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

<div id="before-video" class="h-screen container flex items-center">
  <p class="max-w-[900px]">
    As well as capturing moments of laughter, the aim of this exploration was to also determine
    which character (or in some cases, just the 'situation') was responsible for delivering the line
    that <span class="highlight-reverse">caused the laughter</span>. Let's look at a worked example,
    using a longer annotated clip from "The Marine Biologist', the 14th episode of season five.
  </p>
</div>
