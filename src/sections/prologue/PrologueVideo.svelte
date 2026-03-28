<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';

  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import tv_noise from '$lib/assets/tv_noise.png';

  const jerryImg = getCharacterImagePath('JERRY');
  const georgeImg = getCharacterImagePath('GEORGE');
  const elaineImg = getCharacterImagePath('ELAINE');
  const kramerImg = getCharacterImagePath('KRAMER');
  const jerrysHomeImg = getLocationIconPath("Jerry's home");

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      const wrapper = document.querySelector('#video-text-wrapper');
      const heights = [1, 2, 3].map((i) => {
        const el = document.querySelector(`#video-text-${i}`);
        return el ? /** @type {HTMLElement} */ (el).scrollHeight : 0;
      });

      gsap.set('.video-char-icon', { opacity: 0, translateY: 20 });
      gsap.set('#video-text-2', { opacity: 0 });
      gsap.set('#video-text-3', { opacity: 0 });

      // text-2 replaces text-1 when step-2 enters the viewport
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: '#video-step-2',
          start: 'top top',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
      tl2
        .to('#video-text-1', { opacity: 0, duration: 0.3 })
        .to('#video-text-2', { opacity: 1, duration: 0.3 }, '<')
        .to('#video-text-2 .color-jerry', {
          color: '#5FA8D3',
          duration: 0.6,
          ease: 'back.out(1.7)',
        })
        .to('#icon-jerry', { opacity: 1, translateY: 0, duration: 0.4, ease: 'power3.out' }, '<')
        .to(
          '#video-text-2 .color-george',
          { color: '#EB6447', duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.2',
        )
        .to('#icon-george', { opacity: 1, translateY: 0, duration: 0.4, ease: 'power3.out' }, '<')
        .to(
          '#video-text-2 .color-elaine',
          { color: '#FBBA3A', duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.2',
        )
        .to('#icon-elaine', { opacity: 1, translateY: 0, duration: 0.4, ease: 'power3.out' }, '<')
        .to(
          '#video-text-2 .color-kramer',
          { color: '#83C8C3', duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.2',
        )
        .to('#icon-kramer', { opacity: 1, translateY: 0, duration: 0.4, ease: 'power3.out' }, '<')
        .to(
          '#icon-jerrys-home',
          { opacity: 1, translateY: 0, duration: 0.4, ease: 'power3.out' },
          '-=0.2',
        )
        .to(
          '#video-text-2 .jerrys-apartment',
          { color: '#5FA8D3', duration: 0.6, ease: 'back.out(1.7)' },
          '<',
        );

      // text-3 replaces text-2 when step-3 enters the viewport
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: '#video-step-3',
          start: 'top top',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
      tl3
        .to('#video-text-2', { opacity: 0, duration: 0.5 })
        .to('#video-text-3', { opacity: 1, duration: 0.5 }, '<');

      // Height animation on desktop only (mobile uses flex-1 to fill remaining space)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        tl2.to(wrapper, { height: heights[1], duration: 0.3, ease: 'power2.inOut' }, 0);
        tl3.to(wrapper, { height: heights[2], duration: 0.3, ease: 'power2.inOut' }, 0);
      });
    });
  });

  onDestroy(() => {
    ctx?.revert();
  });
</script>

<div id="video-scroll-container" class="relative">
  <!-- Sticky full-screen video + text overlay -->
  <div
    id="video-sticky"
    class="sticky top-0 h-screen self-start flex flex-col lg:block"
    role="presentation"
  >
    <!-- Video: top half on mobile, full screen on desktop -->
    <div class="relative h-[50vh] lg:absolute lg:inset-0 lg:h-auto">
      <video playsinline autoplay muted loop preload="metadata">
        <source
          src="https://amdufour.github.io/hosted-data/apis/videos/1a.ElaineArrives.mp4"
          type="video/mp4"
        />
      </video>
      <div class="readable-layer z-1 absolute inset-0"></div>
      <div class="absolute inset-0" style="background-image: url('{tv_noise}')"></div>
    </div>

    <!-- Text panels: below video on mobile, overlaid at bottom on desktop -->
    <div
      class="flex-1 bg-black lg:flex-none lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:bg-black/50 lg:overflow-hidden"
    >
      <div id="video-text-wrapper" class="relative container">
        <!-- Text 1: in normal flow — sets natural wrapper height -->
        <div id="video-text-1" class="py-12">
          <div class="md:w-[620px]">
            There's a good chance you've seen this popular gif. It shows a clip taken from episode 4
            of season 4, titled <span class="em">'The Wallet'</span>.
          </div>
        </div>
        <!-- Texts 2-3: absolutely positioned so scrollHeight reflects real content height -->
        <div id="video-text-2" class="absolute inset-x-0 top-0 py-12">
          <div class="flex flex-col lg:flex-row lg:justify-between gap-4 lg:gap-8">
            <div style="max-width: 820px;">
              Here we see the four lead characters: <span class="color color-jerry">Jerry</span>
              - the show's eponymous character - his friends
              <span class="color color-george">George</span>
              and <span class="color color-elaine">Elaine</span>, plus next-door neighbour,
              <span class="color color-kramer">Kramer</span>. They are in
              <span class="jerrys-apartment em">Jerry's apartment</span>, set in New York City,
              which acts as the main location base for lots of the show's stories.
            </div>
            <div class="flex items-start gap-4 md:gap-8">
              <div
                id="icon-jerry"
                class="video-char-icon flex flex-col justify-center items-center gap-2"
              >
                <div
                  class="rounded-full bg-contain bg-center w-[50px] h-[50px] lg:w-[80px] lg:h-[80px]"
                  style="background-image: url({jerryImg})"
                ></div>
                <div>Jerry</div>
              </div>
              <div
                id="icon-george"
                class="video-char-icon flex flex-col justify-center items-center gap-2"
              >
                <div
                  class="rounded-full bg-contain bg-center w-[50px] h-[50px] lg:w-[80px] lg:h-[80px]"
                  style="background-image: url({georgeImg})"
                ></div>
                <div>George</div>
              </div>
              <div
                id="icon-elaine"
                class="video-char-icon flex flex-col justify-center items-center gap-2"
              >
                <div
                  class="rounded-full bg-contain bg-center w-[50px] h-[50px] lg:w-[80px] lg:h-[80px]"
                  style="background-image: url({elaineImg})"
                ></div>
                <div>Elaine</div>
              </div>
              <div
                id="icon-kramer"
                class="video-char-icon flex flex-col justify-center items-center gap-2"
              >
                <div
                  class="rounded-full bg-contain bg-center w-[50px] h-[50px] lg:w-[80px] lg:h-[80px]"
                  style="background-image: url({kramerImg})"
                ></div>
                <div>Kramer</div>
              </div>
              <div
                id="icon-jerrys-home"
                class="video-char-icon flex flex-col justify-center items-center gap-2"
              >
                <div
                  class="rounded-full bg-contain bg-center w-[50px] h-[50px] lg:w-[80px] lg:h-[80px]"
                  style="background-image: url({jerrysHomeImg})"
                ></div>
                <div class="w-[50px] lg:w-[80px] text-center leading-tight">Jerry's home</div>
              </div>
            </div>
          </div>
        </div>
        <div id="video-text-3" class="absolute inset-x-0 top-0 py-12">
          <div class="md:w-[620px]">
            We'll learn a lot more about all the characters and locations later.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Scroll spacers — provide scroll distance and act as GSAP triggers -->
  <!-- Extra spacer so text-1 has 2 viewports of reading time -->
  <div class="h-screen"></div>
  <div id="video-step-2" class="h-screen"></div>
  <div id="video-step-3" class="h-screen"></div>
  <!-- Extra spacer so text-3 has a full viewport of reading time before sticky releases -->
  <div class="h-screen"></div>
</div>

<style>
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .color {
    font-weight: 600;
  }
</style>
