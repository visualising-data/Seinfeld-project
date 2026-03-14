<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';

  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import tv_noise from '$lib/assets/tv_noise.png';

  /** @type {gsap.Context | undefined} */
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {
      gsap.set('.video-char-icon', { opacity: 0, translateY: 20 });

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
        .to('#video-text-1', { opacity: 0, duration: 0.5 })
        .to('#video-text-2', { opacity: 1, duration: 0.5 }, '<')
        .to('#video-text-2 .color-jerry', { color: '#5FA8D3', duration: 1, ease: 'back.out(1.7)' })
        .to(
          '#video-text-2 .color-george',
          { color: '#EB6447', duration: 1, ease: 'back.out(1.7)' },
          '-=0.5',
        )
        .to(
          '#video-text-2 .color-elaine',
          { color: '#FBBA3A', duration: 1, ease: 'back.out(1.7)' },
          '-=0.8',
        )
        .to(
          '#video-text-2 .color-kramer',
          { color: '#83C8C3', duration: 1, ease: 'back.out(1.7)' },
          '-=0.9',
        )
        .to(
          '.video-char-icon',
          { opacity: 1, translateY: 0, duration: 0.6, ease: 'power3.out', stagger: { each: 0.15 } },
          '-=0.5',
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
    });
  });

  onDestroy(() => {
    ctx?.revert();
  });
</script>

<div id="video-scroll-container" class="relative">
  <!-- Sticky full-screen video + text overlay -->
  <div id="video-sticky" class="sticky top-0 h-screen self-start" role="presentation">
    <video playsinline autoplay muted loop>
      <source
        src="https://amdufour.github.io/hosted-data/apis/videos/1a.ElaineArrives(CC).mp4"
        type="video/mp4"
      />
    </video>
    <div class="readable-layer z-1 absolute inset-0"></div>
    <div class="absolute inset-0" style="background-image: url('{tv_noise}')"></div>

    <!-- Text panels — stacked, opacity-switched by GSAP -->
    <div class="absolute bottom-0 left-0 right-0 bg-black/50">
      <div class="grid">
        <div id="video-text-1" class="col-start-1 row-start-1 container py-12">
          <div style="max-width: 620px;">
            There’s a good chance you’ve seen this popular gif. It shows a clip taken from episode 4
            of season 4, titled <span class="em">’The Wallet’</span>.
          </div>
        </div>
        <div id="video-text-2" class="col-start-1 row-start-1 container py-12" style="opacity: 0">
          <div class="flex justify-between gap-8">
            <div style="max-width: 820px;">
              Here we see the four lead characters: <span class="color color-jerry">Jerry</span>
              - the show’s eponymous character - his friends
              <span class="color color-george">George</span>
              and <span class="color color-elaine">Elaine</span>, plus next-door neighbour,
              <span class="color color-kramer">Kramer</span>. They are in Jerry’s apartment, set in
              New York City, which acts as the main location base for lots of the show’s stories.
            </div>
            <div class="flex items-start gap-8">
              <div class="video-char-icon flex flex-col justify-center items-center gap-2">
                <div
                  class="rounded-full bg-contain bg-center w-[80px] h-[80px]"
                  style="background-image: url('{getCharacterImagePath('JERRY')}');"
                ></div>
                <div>Jerry</div>
              </div>
              <div class="video-char-icon flex flex-col justify-center items-center gap-2">
                <div
                  class="rounded-full bg-contain bg-center w-[80px] h-[80px]"
                  style="background-image: url('{getCharacterImagePath('GEORGE')}');"
                ></div>
                <div>George</div>
              </div>
              <div class="video-char-icon flex flex-col justify-center items-center gap-2">
                <div
                  class="rounded-full bg-contain bg-center w-[80px] h-[80px]"
                  style="background-image: url('{getCharacterImagePath('ELAINE')}');"
                ></div>
                <div>Elaine</div>
              </div>
              <div class="video-char-icon flex flex-col justify-center items-center gap-2">
                <div
                  class="rounded-full bg-contain bg-center w-[80px] h-[80px]"
                  style="background-image: url('{getCharacterImagePath('KRAMER')}');"
                ></div>
                <div>Kramer</div>
              </div>
              <div class="video-char-icon flex flex-col justify-center items-center gap-2">
                <div
                  class="rounded-full bg-contain bg-center w-[80px] h-[80px]"
                  style="background-image: url('{getLocationIconPath("Jerry's home")}');"
                ></div>
                <div class="w-[80px] text-center leading-tight">Jerry's home</div>
              </div>
            </div>
          </div>
        </div>
        <div id="video-text-3" class="col-start-1 row-start-1 container py-12" style="opacity: 0">
          <div style="max-width: 620px;">
            We’ll learn a lot more about all the characters and locations later.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Scroll spacers — provide scroll distance and act as GSAP triggers -->
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
