<script>
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  import BookCover from '$lib/assets/book/book_cover.jpg';
  import BookIntro from '$lib/assets/book/book_intro.jpg';
  import BookCalendar from '$lib/assets/book/book_calendar.jpg';
  import BookLaughs from '$lib/assets/book/book_laughs.jpg';
  import BookScatterplot from '$lib/assets/book/book_scatterplot.jpg';
  import BookQuotes from '$lib/assets/book/book_quotes.jpg';
  import BookCatalog1 from '$lib/assets/book/book_catalog1.png';
  import BookCatalog2 from '$lib/assets/book/book_catalog2.png';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {gsap.core.Timeline | undefined} */
  let tl;
  /** @type {ScrollTrigger | undefined} */
  let st;

  onMount(() => {
    const imgSlider = document.getElementById('books-inner-container');
    const imgSliderMain = document.getElementById('books-outer-container');

    if (!imgSlider || !imgSliderMain) return;

    // Create the pin immediately (synchronously) so the pin spacer exists in the
    // DOM before downstream components' onMount callbacks (Title, Calendar) run.
    // In dev mode, images may not be loaded yet — scrollWidth could be 0 —
    // but invalidateOnRefresh:true recalculates the end value on every refresh,
    // and the post-load refresh below corrects the pin spacer size.
    tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(imgSlider, { x: () => -(imgSlider.scrollWidth - imgSliderMain.offsetWidth) });
    tl.to('#book-cover', { scale: 1.08 }, 0);
    tl.from('#accent-line', { width: 0 }, 0);

    st = ScrollTrigger.create({
      trigger: '#book-sticky',
      start: 'top top',
      end: () => `+=${(imgSlider.scrollWidth - imgSliderMain.offsetWidth) * 3}`,
      scrub: 1,
      pin: true,
      animation: tl,
      invalidateOnRefresh: true,
    });

    // After images load, refresh so the pin spacer gets the correct size and
    // all downstream ScrollTriggers (Calendar etc.) recalculate their positions.
    const imgs = [...imgSlider.querySelectorAll('img')];
    Promise.all(
      imgs.map((img) =>
        /** @type {HTMLImageElement} */ (img).complete
          ? Promise.resolve()
          : new Promise((r) => img.addEventListener('load', r, { once: true })),
      ),
    ).then(() => ScrollTrigger.refresh());

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });

  onDestroy(() => {
    tl?.kill();
    st?.kill();
  });
</script>

<div id="book-images-section" class="bg-black">
  <div id="book-scroll-wrapper" class="relative">
    <!--
      #book-sticky is the pinned element.
      GSAP pins it at top:0 the moment it hits the viewport top, then holds it
      there for exactly the horizontal scroll distance — no manual spacer needed.
    -->
    <div id="book-sticky" class="bg-black h-[100dvh] flex flex-col justify-between">
      <!-- Desktop: text + book cover -->
      <div id="book-cover-container" class="hidden lg:flex flex-1 items-center container">
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
            The first product of this work was my 2020 publishing of <a
              href="https://visualisingdata.com/work/#Seinfeld"
              target="_blank">The Seinfeld Chronicles</a
            >, a limited-edition printed book presenting all my extensive analysis. With 176 copies
            released, matching the number of written episodes, this reached a small but exclusive,
            passionate, and
            <a
              href="https://visualisingdata.com/2020/10/the-seinfeld-chronicles-prints-and-donations-update/"
              target="_blank">generous audience</a
            >.
          </p>
        </div>
        <div class="flex-1 px-4">
          <img
            loading="eager"
            id="book-cover"
            src={BookCover}
            alt="Cover of the book The Seinfeld Chronicles."
          />
        </div>
      </div>

      <!-- Mobile: text fills the top of the pinned screen -->
      <div class="lg:hidden flex-1 container py-8 flex flex-col justify-center overflow-y-auto">
        <p>
          My curiosity transcended just <a
            href="https://jenniferkarmstrong.com/books/seinfeldia/"
            target="_blank">reading more about the show</a
          >, it was now time to go deep. I decided to immerse myself in an entirely unnecessary,
          self-motivated, long-running, data-driven exploration of every episode of Seinfeld. Why
          not!
        </p>
        <p>
          The first product of this work was my 2020 publishing of <a
            href="https://visualisingdata.com/work/#Seinfeld"
            target="_blank">The Seinfeld Chronicles</a
          >, a limited-edition printed book presenting all my extensive analysis. With 176 copies
          released, matching the number of written episodes, this reached a small but exclusive,
          passionate, and
          <a
            href="https://visualisingdata.com/2020/10/the-seinfeld-chronicles-prints-and-donations-update/"
            target="_blank">generous audience</a
          >.
        </p>
      </div>

      <!-- Image strip: GSAP-animated on both mobile and desktop -->
      <div id="books-outer-container" class="shrink-0">
        <div id="accent-line" class="mb-3 h-2 w-full" style="background-color: #E71D80;"></div>
        <div id="books-inner-container" class="flex">
          <!-- Book cover as first image on mobile only -->
          <img
            loading="eager"
            class="book-img mx-4 lg:hidden"
            src={BookCover}
            alt="Cover of the book The Seinfeld Chronicles."
          />
          <img
            loading="eager"
            class="book-img mx-4"
            src={BookIntro}
            alt="Introduction of the book."
          />
          <img
            loading="eager"
            class="book-img mx-4"
            src={BookCalendar}
            alt="Calendar of the nine seasons of Seinfeld."
          />
          <img
            loading="eager"
            class="book-img mx-4"
            src={BookLaughs}
            alt="Data visualizations of the laughs caused by the four main characters."
          />
          <img
            loading="eager"
            class="book-img mx-4"
            src={BookScatterplot}
            alt="Data visualizations of the peak performances of the four main characters."
          />
          <img
            loading="eager"
            class="book-img mx-4"
            src={BookQuotes}
            alt="Famous quotes from each episode."
          />
          <img
            loading="eager"
            class="book-img mx-4"
            src={BookCatalog1}
            alt="Data visualization of season 4 episode 11 'The Contest'."
          />
          <img
            loading="eager"
            class="book-img mx-4"
            src={BookCatalog2}
            alt="Data visualization of season 7 episode 6 'The Soup Nazi'."
          />
        </div>
      </div>
    </div>
    <!-- No manual spacer: GSAP pin:true inserts its own pin spacer -->
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
  }
  /* will-change forces its own GPU compositing layer so iOS Chrome renders
     the GSAP translateX correctly inside the pinned container */
  #books-inner-container {
    will-change: transform;
  }
</style>
