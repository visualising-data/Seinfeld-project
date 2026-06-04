<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#dvd-set',
          start: 'top center',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
      tl.to('#dvd-set .highlight-reverse', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        ease: 'power3.out',
      });
    });
  });

  onDestroy(() => {
    ctx?.revert();
  });
</script>

<div id="dvd-set" class="h-screen flex items-center" style="background: rgba(231, 29, 128, 0.05)">
  <div class="container">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        The data for this project was <span class="highlight-reverse">manually recorded</span> through
        watching the DVD boxset of every one of the 176 written episodes (ignoring 4 specials/highlight
        shows).
      </div>
      <img
        class="max-h-[96vh]"
        src="https://amdufour.github.io/hosted-data/apis/images/DVDBoxset.png"
        alt="DVD boxset"
      />
    </div>
  </div>
</div>
