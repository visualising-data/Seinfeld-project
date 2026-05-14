<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      gsap.to('#bridge-to-catalog .highlight-reverse', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        ease: 'power3.out',
        stagger: 0.3,
        scrollTrigger: {
          trigger: '#bridge-to-catalog',
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

<div id="bridge-to-catalog" class="h-[100dvh]">
  <div class="h-[100dvh] container flex content-center flex-wrap">
    <h2 class="mb-2">Episode Catalogue</h2>
    <div style="max-width: 900px;">
      <p>
        You can now browse through an interactive catalogue of episodes, showing visual compositions
        of the synthesised data depicting the rhythm and texture of each. You can also experience a
        unique translation of the data patterns through experimental sound representation or
        <span class="highlight-reverse">sonification</span>.
      </p>
      <p>
        Just as every episode had a unique variation on the famous theme tune, tweaked and performed
        each time by composer <a
          href="https://www.vice.com/en/article/how-seinfelds-theme-song-was-created"
          target="_blank">Jonathan Wolff</a
        >, you can now hear the unique sonic signatures of each episode’s character and location,
        using a bespoke repertoire of instruments and sounds drawn from the show. Be prepared, it’s
        about to get <span class="highlight-reverse">weird</span>, but, good-weird, maybe even funky
        weird.
      </p>
    </div>
  </div>
</div>
