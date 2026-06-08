<script>
  import { onMount, onDestroy } from 'svelte';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  import BookCover from '$lib/assets/book/book_cover.jpg';

  let { scheduleRefresh = () => ScrollTrigger.refresh() } = $props();
  import BookIntro from '$lib/assets/book/book_intro.jpg';
  import BookCalendar from '$lib/assets/book/book_calendar.jpg';
  import BookLaughs from '$lib/assets/book/book_laughs.jpg';
  import BookScatterplot from '$lib/assets/book/book_scatterplot.jpg';
  import BookQuotes from '$lib/assets/book/book_quotes.jpg';
  import BookCatalog1 from '$lib/assets/book/book_catalog1.png';
  import BookCatalog2 from '$lib/assets/book/book_catalog2.png';

  gsap.registerPlugin(ScrollTrigger);

  /** @type {gsap.MatchMedia | undefined} */
  let mm;

  onMount(() => {
    const imgSlider = document.getElementById('books-inner-container');
    const imgSliderMain = document.getElementById('books-outer-container');

    if (!imgSlider || !imgSliderMain) return;

    // Refresh after desktop strip images load — downstream sections depend on it.
    const imgs = [...imgSlider.querySelectorAll('img')];
    Promise.all(
      imgs.map((img) =>
        /** @type {HTMLImageElement} */ (img).complete
          ? Promise.resolve()
          : new Promise((r) => img.addEventListener('load', r, { once: true })),
      ),
    ).then(() => scheduleRefresh());
    window.addEventListener('load', scheduleRefresh, { once: true });

    mm = gsap.matchMedia();

    // Desktop only: GSAP pin + horizontal scroll.
    mm.add('(min-width: 1024px)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to(imgSlider, { x: () => -(imgSlider.scrollWidth - imgSliderMain.offsetWidth) });
      tl.to('#book-cover', { scale: 1.08 }, 0);
      tl.from('#accent-line', { width: 0 }, 0);

      const st = ScrollTrigger.create({
        trigger: '#book-sticky',
        start: 'top top',
        end: () => `+=${(imgSlider.scrollWidth - imgSliderMain.offsetWidth) * 3}`,
        scrub: 1,
        pin: true,
        animation: tl,
        invalidateOnRefresh: true,
      });

      gsap.set('#book-cover-container .highlight', {
        webkitTextFillColor: 'currentColor',
        backgroundPosition: '0% center',
      });
      gsap.to('#book-cover-container .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.3,
        scrollTrigger: {
          trigger: '#book-sticky',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      return () => {
        tl.kill();
        st.kill();
      };
    });

    // Mobile/tablet: alternating offset stack, slide-in reveal on scroll.
    mm.add('(max-width: 1023px)', () => {
      const wraps = [...document.querySelectorAll('.book-img-wrap')];
      /** @type {IntersectionObserver[]} */
      const observers = [];

      wraps.forEach((wrap, i) => {
        const fromLeft = i % 2 === 0;
        gsap.set(wrap, { opacity: 0, x: fromLeft ? -40 : 40 });

        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              gsap.to(wrap, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' });
              obs.disconnect();
            }
          },
          { threshold: 0.15 },
        );
        obs.observe(wrap);
        observers.push(obs);
      });

      return () => {
        observers.forEach((o) => o.disconnect());
        gsap.set(document.querySelectorAll('.book-img-wrap'), { clearProps: 'all' });
      };
    });
  });

  onDestroy(() => {
    mm?.revert();
  });
</script>

<div id="book-images-section" class="bg-black">
  <div id="book-scroll-wrapper" class="relative">

    <!-- ── DESKTOP ── sticky section with text + GSAP horizontal strip -->
    <div id="book-sticky" class="bg-black h-[100dvh] hidden lg:flex flex-col justify-between">
      <div id="book-cover-container" class="flex flex-1 items-center container">
        <div class="flex-1 px-4">
          <p>
            And so began a self-motivated, long-running, <span class="highlight"
              >entirely unnecessary</span
            >, data-driven exploration of every episode of Seinfeld.
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
          <a
            href="https://indd.adobe.com/view/564a8d63-0130-4473-a04f-d17346526502"
            target="_blank"
          >
            <img
              loading="eager"
              id="book-cover"
              src={BookCover}
              alt="Cover of the book The Seinfeld Chronicles."
            />
          </a>
        </div>
      </div>

      <div id="books-outer-container" class="shrink-0">
        <div id="accent-line" class="mb-3 h-2 w-full" style="background-color: #E71D80;"></div>
        <div id="books-inner-container" class="flex items-start" style="will-change: transform;">
          <img loading="eager" class="book-img mx-4" src={BookIntro} alt="Introduction of the book." />
          <img loading="eager" class="book-img mx-4" src={BookCalendar} alt="Calendar of the nine seasons of Seinfeld." />
          <img loading="eager" class="book-img mx-4" src={BookLaughs} alt="Data visualizations of the laughs caused by the four main characters." />
          <img loading="eager" class="book-img mx-4" src={BookScatterplot} alt="Data visualizations of the peak performances of the four main characters." />
          <img loading="eager" class="book-img mx-4" src={BookQuotes} alt="Famous quotes from each episode." />
          <img loading="eager" class="book-img mx-4" src={BookCatalog1} alt="Data visualization of season 4 episode 11 'The Contest'." />
          <img loading="eager" class="book-img mx-4" src={BookCatalog2} alt="Data visualization of season 7 episode 6 'The Soup Nazi'." />
        </div>
      </div>
    </div>

    <!-- ── MOBILE/TABLET ── text + alternating offset image stack -->
    <div class="lg:hidden bg-black overflow-x-hidden">
      <div class="container py-8 flex flex-col justify-center">
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
      <div class="flex flex-col" style="gap: 4px;">
        <div class="book-img-wrap"><img loading="eager" src={BookCover} alt="Cover of the book The Seinfeld Chronicles." /></div>
        <div class="book-img-wrap"><img loading="eager" src={BookIntro} alt="Introduction of the book." /></div>
        <div class="book-img-wrap"><img loading="eager" src={BookCalendar} alt="Calendar of the nine seasons of Seinfeld." /></div>
        <div class="book-img-wrap"><img loading="eager" src={BookLaughs} alt="Data visualizations of the laughs caused by the four main characters." /></div>
        <div class="book-img-wrap"><img loading="eager" src={BookScatterplot} alt="Data visualizations of the peak performances of the four main characters." /></div>
        <div class="book-img-wrap"><img loading="eager" src={BookQuotes} alt="Famous quotes from each episode." /></div>
        <div class="book-img-wrap"><img loading="eager" src={BookCatalog1} alt="Data visualization of season 4 episode 11 'The Contest'." /></div>
        <div class="book-img-wrap"><img loading="eager" src={BookCatalog2} alt="Data visualization of season 7 episode 6 'The Soup Nazi'." /></div>
      </div>
    </div>

  </div>
</div>

<style>
  /* Desktop strip images */
  .book-img {
    height: calc(100dvh / 3.5);
  }

  /* Mobile alternating offset stack */
  .book-img-wrap {
    width: 88%;
    position: relative;
  }
  .book-img-wrap:nth-child(odd) {
    margin-right: auto;
    border-left: 3px solid #E71D80;
  }
  .book-img-wrap:nth-child(even) {
    margin-left: auto;
    border-right: 3px solid #E71D80;
  }
  .book-img-wrap img {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
