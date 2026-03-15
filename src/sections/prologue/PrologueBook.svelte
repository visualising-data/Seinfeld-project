<script>
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import Lenis from 'lenis';

  import BookCover from '$lib/assets/book/book_cover.jpg';
  import BookIntro from '$lib/assets/book/book_intro.jpg';
  import BookCalendar from '$lib/assets/book/book_calendar.jpg';
  import BookLaughs from '$lib/assets/book/book_laughs.jpg';
  import BookScatterplot from '$lib/assets/book/book_scatterplot.jpg';
  import BookQuotes from '$lib/assets/book/book_quotes.jpg';
  import BookCatalog1 from '$lib/assets/book/book_catalog1.png';
  import BookCatalog2 from '$lib/assets/book/book_catalog2.png';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {Lenis | undefined} */
  let lenis;
  /** @type {((time: number) => void) | undefined} */
  let lenisTicker;
  /** @type {gsap.core.Timeline | undefined} */
  let tl;

  onMount(() => {
    const setup = () => {
      const imgSlider = document.getElementById('books-inner-container');
      const imgSliderMain = document.getElementById('books-outer-container');

      if (!imgSlider || !imgSliderMain) return;

      tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to(imgSlider, { x: () => -(imgSlider.scrollWidth - imgSliderMain.offsetWidth) });
      tl.to('#book-cover', { scale: 1.08 }, 0);
      tl.from('#accent-line', { width: 0 }, 0);

      ScrollTrigger.create({
        trigger: '#book-scroll-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.refresh();
    };

    setTimeout(setup, 100);
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

    lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    lenisTicker = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);
  });

  onDestroy(() => {
    tl?.kill();
    ScrollTrigger.getAll().forEach((st) => st.kill());
    lenis?.off('scroll', ScrollTrigger.update);
    lenis?.destroy();
    if (lenisTicker) gsap.ticker.remove(lenisTicker);
  });
</script>

<div id="book-images-section" class="bg-black">

  <!-- Mobile: text scrolls normally above the sticky image strip -->
  <div class="lg:hidden container px-4 py-8">
    <p>
      My curiosity transcended just <a
        href="https://jenniferkarmstrong.com/books/seinfeldia/"
        target="_blank">reading more about the show</a
      >, it was now time to go deep. I decided to immerse myself in an entirely unnecessary,
      self-motivated, long-running, data-driven exploration of every episode of Seinfeld. Why
      not!
    </p>
    <p>
      The first product of this work was my 2020 publishing of <a href="https://visualisingdata.com/work/#Seinfeld" target="_blank">The Seinfeld Chronicles</a>, a
      limited-edition printed book presenting all my extensive analysis. With 176 copies
      released, matching the number of written episodes, this reached a small but exclusive, passionate, and <a href="https://visualisingdata.com/2020/10/the-seinfeld-chronicles-prints-and-donations-update/" target="_blank">generous audience</a>.
    </p>
  </div>

  <!-- Scroll-driven section: sticky image strip on mobile, full-screen on desktop -->
  <div id="book-scroll-wrapper" class="relative">
    <div class="sticky lg:top-0 bg-black overflow-x-clip lg:h-[100dvh] lg:flex lg:flex-col lg:justify-between book-strip-sticky">

      <!-- Desktop only: text + book cover -->
      <div
        id="book-cover-container"
        class="hidden lg:flex flex-1 items-center container"
      >
        <div class="flex-1 px-4">
          <p>
            My curiosity transcended just <a
              href="https://jenniferkarmstrong.com/books/seinfeldia/"
              target="_blank">reading more about the show</a
            >, it was now time to go deep. I decided to immerse myself in an entirely unnecessary,
            self-motivated, long-running, data-driven exploration of every episode of Seinfeld. Why
            not!
          </p>
          <p>
            The first product of this work was my 2020 publishing of <a href="https://visualisingdata.com/work/#Seinfeld" target="_blank">The Seinfeld Chronicles</a>, a
            limited-edition printed book presenting all my extensive analysis. With 176 copies
            released, matching the number of written episodes, this reached a small but exclusive, passionate, and <a href="https://visualisingdata.com/2020/10/the-seinfeld-chronicles-prints-and-donations-update/" target="_blank">generous audience</a>.
          </p>
        </div>
        <div class="flex-1 px-4">
          <img loading="lazy" id="book-cover" src={BookCover} alt="Cover of the book The Seinfeld Chronicles." />
        </div>
      </div>

      <!-- Image strip: GSAP-animated on both mobile and desktop -->
      <div id="books-outer-container" class="lg:shrink-0">
        <div id="accent-line" class="mb-3 h-2 w-full" style="background-color: #E71D80;"></div>
        <div id="books-inner-container" class="flex">
          <!-- Book cover as first image on mobile only -->
          <img loading="lazy" class="book-img mx-4 lg:hidden" src={BookCover} alt="Cover of the book The Seinfeld Chronicles." />
          <img loading="lazy" class="book-img mx-4" src={BookIntro} alt="Introduction of the book." />
          <img loading="lazy" class="book-img mx-4" src={BookCalendar} alt="Calendar of the nine seasons of Seinfeld." />
          <img loading="lazy" class="book-img mx-4" src={BookLaughs} alt="Data visualizations of the laughs caused by the four main characters." />
          <img loading="lazy" class="book-img mx-4" src={BookScatterplot} alt="Data visualizations of the peak performances of the four main characters." />
          <img loading="lazy" class="book-img mx-4" src={BookQuotes} alt="Famous quotes from each episode." />
          <img loading="lazy" class="book-img mx-4" src={BookCatalog1} alt="Data visualization of season 4 episode 11 'The Contest'." />
          <img loading="lazy" class="book-img mx-4" src={BookCatalog2} alt="Data visualization of season 7 episode 6 'The Soup Nazi'." />
        </div>
      </div>
    </div>

    <!-- Scroll spacer: provides scroll distance for the GSAP animation -->
    <div class="h-[300vh]"></div>
  </div>

</div>

<style>
  .book-img {
    height: calc(100dvh / 3.5);
  }
  @media (max-width: 1023px) {
    .book-img {
      height: 200px;
    }
    /* Pin strip so its bottom aligns with the viewport bottom */
    .book-strip-sticky {
      top: calc(100dvh - 228px);
    }
  }
</style>
