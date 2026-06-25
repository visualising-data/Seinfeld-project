<script>
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import tv_noise from '$lib/assets/tv_noise.png';
  import { soundIsAuth } from '../../stores/soundAuthStore';
  import { enterSoundSection, leaveSoundSection } from '../../stores/soundSectionIsInView';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {(HTMLVideoElement | undefined)[]} */
  let videoEls = Array(5);
  let currentIndex = 0;
  let inSection = false;
  let showPlayButton = false;

  $: videoEls.forEach((v, i) => {
    if (!v) return;
    v.muted = !($soundIsAuth && inSection && i === currentIndex);
  });

  const jerryImg = getCharacterImagePath('JERRY');
  const georgeImg = getCharacterImagePath('GEORGE');
  const elaineImg = getCharacterImagePath('ELAINE');
  const kramerImg = getCharacterImagePath('KRAMER');
  const colleagueImg = getCharacterImagePath('Work colleague');
  const otherPersonImg = getCharacterImagePath('Other');
  const jerrysHomeImg = getLocationIconPath("Jerry's home");
  const dinerImg = getLocationIconPath('Diner');
  const placeOfLeisureImg = getLocationIconPath('Place of leisure');
  const otherLocationImg = getLocationIconPath('Other');

  /** @type {gsap.Context | undefined} */
  let ctx;
  let videosFreed = false;

  /** @type {IntersectionObserver | undefined} */
  let mobileIO;

  /** @type {((index: number) => void) | undefined} */
  let mobileTransitionTo;

  const baseVideoUrl = 'https://amdufour.github.io/hosted-data/apis/videos/';

  /** @param {number} index */
  const playVideo = (index) => {
    videoEls[index]?.play().catch(() => {});
  };

  onMount(() => {
    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /** @param {boolean} isMobile */
      const buildAnimations = (isMobile) => {
        const infoId = (/** @type {number} */ n) =>
          isMobile ? `#show-info-mobile-${n}` : `#show-info-${n}`;

        // Initial state
        for (let j = 0; j < 5; j++) {
          gsap.set(`#show-text-${j}`, {
            opacity: j === 0 ? 1 : 0,
            pointerEvents: j === 0 ? 'auto' : 'none',
          });
          gsap.set(infoId(j), { opacity: j === 0 ? 1 : 0 });
          if (isMobile) {
            gsap.set(`#show-video-${j}`, { opacity: j === 0 ? 1 : 0 });
          } else {
            gsap.set(`#show-video-${j}`, { flexGrow: j === 0 ? 4 : 1 });
          }
        }
        // HTML autoplay doesn't fire for sections below the fold at load time.
        // Use rAF so GSAP's initial state renders before play() checks visibility.
        requestAnimationFrame(() => {
          if (isMobile) {
            videoEls[0]?.play().catch(() => { showPlayButton = true; });
          } else {
            for (let j = 0; j < 5; j++) playVideo(j);
          }
        });

        gsap.set(
          [
            '#show-text-0 .highlight',
            '#show-text-1 .highlight',
            '#show-text-2 .highlight',
            '#show-text-3 .highlight',
            '#show-text-4 .highlight',
          ],
          { webkitTextFillColor: 'currentColor', backgroundPosition: '0% center' },
        );

        /** @param {number} index */
        const transitionTo = (index) => {
          const prevIndex = currentIndex;
          // Kill all in-progress transitions first
          for (let j = 0; j < 5; j++) {
            gsap.killTweensOf(`#show-text-${j}`);
            gsap.killTweensOf(infoId(j));
            gsap.killTweensOf(`#show-video-${j}`);
          }
          gsap.killTweensOf('#show-text-0 .highlight');
          gsap.killTweensOf('#show-text-1 .highlight');
          gsap.killTweensOf('#show-text-2 .highlight');
          gsap.killTweensOf('#show-text-3 .highlight');
          gsap.killTweensOf('#show-text-4 .highlight');

          // Snap all texts/info to hidden, then fade in the target
          for (let j = 0; j < 5; j++) {
            gsap.set(`#show-text-${j}`, { opacity: 0, pointerEvents: 'none' });
            gsap.set(infoId(j), { opacity: 0 });
          }
          gsap.set(`#show-text-${index}`, { pointerEvents: 'auto' });
          gsap.to(`#show-text-${index}`, { opacity: 1, duration: 0.3 });
          gsap.to(infoId(index), { opacity: 1, duration: 0.3 });
          currentIndex = index;

          // Videos
          if (isMobile) {
            videoEls[prevIndex]?.pause();
            for (let j = 0; j < 5; j++) gsap.set(`#show-video-${j}`, { opacity: 0 });
            gsap.set(`#show-video-${index}`, { opacity: 1 });
            // rAF gives iOS Safari a render cycle to recognise the opacity:1
            // change before play() checks element visibility
            requestAnimationFrame(() => {
              const v = videoEls[index];
              if (v) {
                v.currentTime = 0;
                v.play()
                  .then(() => { if (index === 0) showPlayButton = false; })
                  .catch(() => {});
              }
            });
          } else {
            for (let j = 0; j < 5; j++) {
              playVideo(j);
              gsap.to(`#show-video-${j}`, {
                flexGrow: j === index ? 4 : 1,
                duration: 0.3,
                ease: 'power2.inOut',
              });
            }
          }

          // Highlight animations
          gsap.set('#show-text-0 .highlight', {
            webkitTextFillColor: 'currentColor',
            backgroundPosition: '0% center',
          });
          gsap.set('#show-text-1 .highlight', {
            webkitTextFillColor: 'currentColor',
            backgroundPosition: '0% center',
          });
          gsap.set('#show-text-2 .highlight', {
            webkitTextFillColor: 'currentColor',
            backgroundPosition: '0% center',
          });
          gsap.set('#show-text-3 .highlight', {
            webkitTextFillColor: 'currentColor',
            backgroundPosition: '0% center',
          });
          gsap.set('#show-text-4 .highlight', {
            webkitTextFillColor: 'currentColor',
            backgroundPosition: '0% center',
          });
          if (index === 0) {
            gsap.to('#show-text-0 .highlight', {
              webkitTextFillColor: 'transparent',
              backgroundPosition: '200% center',
              duration: 1.5,
              ease: 'power3.out',
              delay: 0.3,
            });
          } else if (index === 1) {
            gsap.to('#show-text-1 .highlight', {
              webkitTextFillColor: 'transparent',
              backgroundPosition: '200% center',
              duration: 1.5,
              ease: 'power3.out',
              delay: 0.3,
            });
          } else if (index === 2) {
            gsap.to('#show-text-2 .highlight', {
              webkitTextFillColor: 'transparent',
              backgroundPosition: '200% center',
              duration: 1.5,
              ease: 'power3.out',
              delay: 0.3,
            });
          } else if (index === 3) {
            gsap.to('#show-text-3 .highlight', {
              webkitTextFillColor: 'transparent',
              backgroundPosition: '200% center',
              duration: 1.5,
              ease: 'power3.out',
              delay: 0.3,
            });
          } else if (index === 4) {
            gsap.to('#show-text-4 .highlight', {
              webkitTextFillColor: 'transparent',
              backgroundPosition: '200% center',
              duration: 1.5,
              stagger: 0.4,
              ease: 'power3.out',
              delay: 0.3,
            });
          }
        };

        if (!isMobile) {
          for (let i = 0; i < 4; i++) {
            ScrollTrigger.create({
              trigger: `#show-step-${i + 1}`,
              start: 'top top',
              invalidateOnRefresh: true,
              onEnter: () => transitionTo(i + 1),
              onLeaveBack: () => transitionTo(i),
            });
          }
        } else {
          mobileTransitionTo = transitionTo;
        }

        // Text 0 highlight: animate on initial section entry
        gsap.to('#show-text-0 .highlight', {
          webkitTextFillColor: 'transparent',
          backgroundPosition: '200% center',
          duration: 1.5,
          ease: 'power3.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: '#show-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      };

      mm.add('(min-width: 1024px)', () => buildAnimations(false));
      mm.add('(max-width: 1023px)', () => buildAnimations(true));

      ScrollTrigger.create({
        trigger: '#show-section',
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          inSection = true;
          enterSoundSection();
          if (videosFreed) {
            videosFreed = false;
            videoEls.forEach((v, i) => {
              if (!v) return;
              v.removeAttribute('src'); // remove the 'about:blank' placeholder
              v.load(); // browser falls back to <source> children
              if (i === currentIndex) v.play().catch(() => {});
            });
          }
        },
        onEnterBack: () => {
          inSection = true;
          enterSoundSection();
          if (videosFreed) {
            videosFreed = false;
            videoEls.forEach((v, i) => {
              if (!v) return;
              v.removeAttribute('src');
              v.load();
              if (i === currentIndex) v.play().catch(() => {});
            });
          }
        },
        onLeave: () => {
          inSection = false;
          leaveSoundSection();
          // Free decoded video memory: 5 looping videos staying in memory while
          // the user is 8+ sections lower is a primary cause of OOM on mobile.
          videosFreed = true;
          videoEls.forEach(v => {
            if (!v) return;
            v.pause();
            v.src = 'about:blank';
            v.load();
          });
        },
        onLeaveBack: () => {
          inSection = false;
          leaveSoundSection();
        },
      });
    });

    // IntersectionObserver is the reliable way to trigger play() on iOS when a
    // muted inline video enters the viewport — scroll-event callbacks don't work.
    if (window.matchMedia('(max-width: 1023px)').matches && videoEls[0]) {
      mobileIO = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            videoEls[0]?.play()
              .then(() => { showPlayButton = false; })
              .catch(() => { showPlayButton = true; });
            mobileIO?.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      mobileIO.observe(videoEls[0]);
    }
  });

  onDestroy(() => {
    ctx?.revert();
    mobileIO?.disconnect();
  });
</script>

<div id="show-section" class="relative">
  <!-- Sticky container -->
  <div id="show-sticky" class="sticky top-0 h-[100dvh] self-start flex flex-col bg-black">
    <!-- Video strip -->
    <div class="show-video-strip flex w-full h-[40vh] lg:h-[65vh]">
      <div
        id="show-video-0"
        class="show-video-item relative overflow-hidden min-w-0"
        style="flex: 4 1 0%"
      >
        <video
          bind:this={videoEls[0]}
          playsinline
          autoplay
          muted
          loop
          preload="auto"
          class="h-full w-full object-cover"
        >
          <source
            src="https://amdufour.github.io/hosted-data/apis/videos/6c.ShowAboutNothing(CC).mp4"
            type="video/mp4"
          />
        </video>
        <div class="readable-layer z-1 absolute inset-0"></div>
        <div class="absolute inset-0" style="background-image: url('{tv_noise}')"></div>
        {#if showPlayButton}
          <button
            aria-label="Play video"
            class="lg:hidden absolute inset-0 flex items-center justify-center z-10"
            onclick={() => { if (videoEls[0]) { videoEls[0].currentTime = 0; videoEls[0].play().then(() => { showPlayButton = false; }).catch(() => {}); } }}
          >
            <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-8 h-8 ml-1">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </button>
        {/if}
        <!-- Desktop info overlay only -->
        <div
          id="show-info-0"
          class="hidden lg:flex absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black to-transparent items-end justify-between gap-4"
        >
          <div class="number">S4E3 - The Pitch</div>
          <div class="flex items-start gap-2 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({jerryImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({georgeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">George</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({dinerImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Diner</div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="show-video-1"
        class="show-video-item relative overflow-hidden min-w-0"
        style="flex: 1 1 0%"
      >
        <video
          bind:this={videoEls[1]}
          playsinline
          autoplay
          muted
          loop
          preload="auto"
          class="h-full w-full object-cover"
        >
          <source
            src="https://amdufour.github.io/hosted-data/apis/videos/32.Minutiae(CC).mp4"
            type="video/mp4"
          />
        </video>
        <div class="readable-layer z-1 absolute inset-0"></div>
        <div class="absolute inset-0" style="background-image: url('{tv_noise}')"></div>
        <div
          id="show-info-1"
          class="hidden lg:flex absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black to-transparent items-end justify-between gap-4"
        >
          <div class="number">S8E3 - The Bizzaro Jerry</div>
          <div class="flex items-start gap-2 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({jerryImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({elaineImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Elaine</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({jerrysHomeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry's home</div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="show-video-2"
        class="show-video-item relative overflow-hidden min-w-0"
        style="flex: 1 1 0%"
      >
        <video
          bind:this={videoEls[2]}
          playsinline
          autoplay
          muted
          loop
          preload="auto"
          class="h-full w-full object-cover"
        >
          <source
            src="https://amdufour.github.io/hosted-data/apis/videos/KramerJeans2(CC).mp4"
            type="video/mp4"
          />
        </video>
        <div class="readable-layer z-1 absolute inset-0"></div>
        <div class="absolute inset-0" style="background-image: url('{tv_noise}')"></div>
        <div
          id="show-info-2"
          class="hidden lg:flex absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black to-transparent items-end justify-between gap-4"
        >
          <div class="number">S7E3 - The Wait Out</div>
          <div class="flex items-start gap-2 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({jerryImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({kramerImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Kramer</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({jerrysHomeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry's home</div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="show-video-3"
        class="show-video-item relative overflow-hidden min-w-0"
        style="flex: 1 1 0%"
      >
        <video
          bind:this={videoEls[3]}
          playsinline
          autoplay
          muted
          loop
          preload="auto"
          class="h-full w-full object-cover"
        >
          <source
            src="https://amdufour.github.io/hosted-data/apis/videos/8.KramerCigarette(CC).mp4"
            type="video/mp4"
          />
        </video>
        <div class="readable-layer z-1 absolute inset-0"></div>
        <div class="absolute inset-0" style="background-image: url('{tv_noise}')"></div>
        <div
          id="show-info-3"
          class="hidden lg:flex absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black to-transparent items-end justify-between gap-4"
        >
          <div class="number">S5E4 - The Sniffing Accountant</div>
          <div class="flex items-start gap-2 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({kramerImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Kramer</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({colleagueImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Colleague</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({placeOfLeisureImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Place of leisure</div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="show-video-4"
        class="show-video-item relative overflow-hidden min-w-0"
        style="flex: 1 1 0%"
      >
        <video
          bind:this={videoEls[4]}
          playsinline
          autoplay
          muted
          loop
          preload="auto"
          class="h-full w-full object-cover"
        >
          <source
            src="https://amdufour.github.io/hosted-data/apis/videos/14.ElaineDancing(CC).mp4"
            type="video/mp4"
          />
        </video>
        <div class="readable-layer z-1 absolute inset-0"></div>
        <div class="absolute inset-0" style="background-image: url('{tv_noise}')"></div>
        <div
          id="show-info-4"
          class="hidden lg:flex absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black to-transparent items-end justify-between gap-4"
        >
          <div class="number">S8E4 - The Little Kicks</div>
          <div class="flex items-start gap-2 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({elaineImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Elaine</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({georgeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">George</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({otherPersonImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Other person</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[40px] h-[40px]"
                style="background-image: url({otherLocationImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Other location</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile info bar: title + icons below video, hidden on desktop -->
    <div class="lg:hidden shrink-0 border-t border-white/10">
      <div class="grid">
        <div
          id="show-info-mobile-0"
          class="col-start-1 row-start-1 px-4 py-3 flex items-start justify-between gap-4 text-[#f9f5f7]"
        >
          <div class="number">S4E3 - The Pitch</div>
          <div class="flex items-start gap-0 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({jerryImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({georgeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">George</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({dinerImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Diner</div>
            </div>
          </div>
        </div>
        <div
          id="show-info-mobile-1"
          class="col-start-1 row-start-1 px-4 py-3 flex items-start justify-between gap-4 text-[#f9f5f7]"
          style="opacity: 0"
        >
          <div class="number">S8E3 - The Bizzaro Jerry</div>
          <div class="flex items-start gap-0 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({jerryImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({elaineImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Elaine</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({jerrysHomeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry's home</div>
            </div>
          </div>
        </div>
        <div
          id="show-info-mobile-2"
          class="col-start-1 row-start-1 px-4 py-3 flex items-start justify-between gap-4 text-[#f9f5f7]"
          style="opacity: 0"
        >
          <div class="number">S7E3 - The Wait Out</div>
          <div class="flex items-start gap-0 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({jerryImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({kramerImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Kramer</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({jerrysHomeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Jerry's home</div>
            </div>
          </div>
        </div>
        <div
          id="show-info-mobile-3"
          class="col-start-1 row-start-1 px-4 py-3 flex items-start justify-between gap-4 text-[#f9f5f7]"
          style="opacity: 0"
        >
          <div class="number">S5E4 - The Sniffing Accountant</div>
          <div class="flex items-start gap-0 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({kramerImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Kramer</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({colleagueImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Colleague</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({placeOfLeisureImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Place of leisure</div>
            </div>
          </div>
        </div>
        <div
          id="show-info-mobile-4"
          class="col-start-1 row-start-1 px-4 py-3 flex items-start justify-between gap-4 text-[#f9f5f7]"
          style="opacity: 0"
        >
          <div class="number">S8E4 - The Little Kicks</div>
          <div class="flex items-start gap-0 shrink-0">
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({elaineImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Elaine</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({georgeImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">George</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({otherPersonImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Other person</div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div
                class="rounded-full bg-contain bg-center w-[32px] h-[32px]"
                style="background-image: url({otherLocationImg})"
              ></div>
              <div class="w-[60px] text-xs text-center leading-tight">Other location</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile tab navigation (lg:hidden) -->
    <div class="lg:hidden flex shrink-0 bg-black">
      {#each ['Nothing', 'Flawed', 'Irreverent', 'Musicality', 'Sit-com'] as tabLabel, tabIdx}
        <button
          class="show-tab flex-1 py-2 text-xs"
          class:show-tab-active={currentIndex === tabIdx}
          onclick={() => mobileTransitionTo?.(tabIdx)}
        >
          {tabLabel}
        </button>
      {/each}
    </div>

    <!-- Text area -->
    <div class="relative flex-1 bg-black overflow-hidden">
      <!-- Text 0 -->
      <div id="show-text-0" class="absolute inset-0 container py-6 flex flex-col overflow-y-auto">
        <p>
          Seinfeld is considered a unique sitcom in how it deviated from the traditional rules of
          the time, rejecting the classic three-act story in favour of a faster-paced multi-story
          structure. It was essentially written in a <span class="highlight">different key</span>,
          focusing on - and amplifying - the minutiae of daily life, and earning its reputation as
          <a
            href="https://www.latimes.com/archives/la-xpm-1993-03-04-ca-474-story.html"
            target="_blank">the show about nothing</a
          >.
        </p>
      </div>

      <!-- Text 1 -->
      <div
        id="show-text-1"
        class="absolute inset-0 container py-6 flex flex-col overflow-y-auto"
        style="opacity: 0; pointer-events: none"
      >
        <p>
          Seinfeld sidestepped sentimentality as well as the pursuit of resolution. With its mantra
          of <a
            href="https://www.theguardian.com/tv-and-radio/2018/may/10/no-hugging-no-learning-20-years-on-seinfelds-mantra-still-looms-large"
            target="_blank">no hugging*, no learning</a
          >
          the lead characters were insecure and
          <span class="highlight">entertainingly flawed</span>, lacking any desire or capability for
          personal growth when faced with the slightest adversity or annoyance, and especially in
          their romantic encounters.
        </p>
        <p class="number">*the first clip notwithstanding!</p>
      </div>

      <!-- Text 2 -->
      <div
        id="show-text-2"
        class="absolute inset-0 container py-6 flex flex-col overflow-y-auto"
        style="opacity: 0; pointer-events: none"
      >
        <p>
          Despite their flaws, I loved the <span class="highlight">irreverent characters</span>,
          with their absurd obsessions and neurotic tendencies, and the hilariously avoidable
          situations they found themselves in.
        </p>
      </div>

      <!-- Text 3 -->
      <div
        id="show-text-3"
        class="absolute inset-0 container py-6 flex flex-col overflow-y-auto"
        style="opacity: 0; pointer-events: none"
      >
        <p>
          As I <a href="https://jenniferkarmstrong.com/books/seinfeldia/" target="_blank"
            >read more about the show</a
          >, my fascination with the creative process behind it grew. It was the
          <span class="highlight">musicality</span> of the show I found particularly intriguing, orchestrated
          by the comedic talents of co-creators Jerry Seinfeld and Larry David.
        </p>
      </div>

      <!-- Text 4 -->
      <div
        id="show-text-4"
        class="absolute inset-0 container py-6 flex flex-col overflow-y-auto"
        style="opacity: 0; pointer-events: none"
      >
        <p>
          Like music, situation comedy has rhythm and it has texture: <span class="highlight"
            >rhythm</span
          >
          is shaped by a show's timing, its scene-structures, and its pacing;
          <span class="highlight">textures</span> are created by the 'instruments' of characters and their
          locations, which amalgamate to create the situations from which the comedy manifests.
        </p>
      </div>
    </div>
  </div>

  <!-- Spacers as scroll triggers (one per transition = 4 total) -->
  <div id="show-step-1" class="h-[100dvh]"></div>
  <div id="show-step-2" class="h-[100dvh]"></div>
  <div id="show-step-3" class="h-[100dvh]"></div>
  <div id="show-step-4" class="h-[100dvh]"></div>
  <!-- Extra spacer so the last video/text has reading time before sticky releases -->
  <div id="show-step-5" class="h-[100dvh]"></div>
</div>

<style>
  @media (min-width: 1024px) {
    #show-section p {
      max-width: 900px;
    }
  }

  @media (max-width: 1023px) {
    #show-sticky {
      position: static;
    }
    #show-step-1,
    #show-step-2,
    #show-step-3,
    #show-step-4,
    #show-step-5 {
      display: none;
    }
    .show-video-strip {
      position: relative;
    }
    .show-video-item {
      position: absolute;
      inset: 0;
      width: 100% !important;
    }
    #show-text-0 p,
    #show-text-1 p {
      margin: 0.5rem 0;
    }
    .show-tab {
      color: rgba(255, 255, 255, 0.4);
      border-bottom: 2px solid transparent;
      background: none;
      cursor: pointer;
    }
    .show-tab-active {
      color: white;
      border-bottom-color: #e71d80;
    }
  }
</style>
