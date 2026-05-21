<script>
  import BrainIcon from '../icons/BrainIcon.svelte';
  import TableIcon from '../icons/TableIcon.svelte';
  import CodeIcon from '../icons/CodeIcon.svelte';
  import SoundIcon from '../icons/SoundIcon.svelte';
  import PaintIcon from '../icons/PaintIcon.svelte';
  import { seasons } from '$lib/data/seasons';

  const seasonGradient = `conic-gradient(${seasons.map((s) => s.accessibleOverDarkColor).join(', ')}, ${seasons[0].accessibleOverDarkColor})`;
  const linearGradient = `linear-gradient(to right, ${seasons.map((s) => s.accessibleOverDarkColor).join(', ')})`;

  const credits = [
    {
      name: 'Andy Kirk',
      url: 'https://visualisingdata.com/',
      role: 'Ideation, Data Analysis, Data Visualisation, Original Design & Illustrations',
      imgUrl: 'https://amdufour.github.io/hosted-data/apis/portraits/andy.jpg',
    },
    {
      name: 'Anne-Marie Dufour',
      url: 'https://www.delightfuldata.art/',
      role: 'Data Visualisation, Digital Design & Development',
      imgUrl: 'https://amdufour.github.io/hosted-data/apis/portraits/annemarie_square_closeup.jpg',
    },
    {
      name: 'Loud Numbers',
      url: 'https://www.loudnumbers.net/',
      role: 'Sound design, composition, and sonification',
    },
    { name: 'Matt Knott', role: 'Illustrations' },
    { name: 'Rob Barker', role: 'Data Collection Support' },
  ];
</script>

<section
  id="methodology"
  class="container mt-20"
  style="--ring-gradient: {seasonGradient}; --linear-gradient: {linearGradient}"
>

  <!-- Credits -->
  <div class="section-block px-4 mb-16">
    <h3 class="section-heading">Credits</h3>
    <div class="credits-grid">
      {#each credits as credit, i}
        <div class="credit-item flex">
          <div class="w-12 mt-1 flex-shrink-0">
            {#if i === 0}
              <BrainIcon />
            {:else if i === 1}
              <CodeIcon />
            {:else if i === 2}
              <SoundIcon />
            {:else if i === 3}
              <PaintIcon />
            {:else}
              <TableIcon />
            {/if}
          </div>
          <div class="pl-3 leading-tight">
            {#if credit.name === 'Loud Numbers'}
              <div class="credit-name font-semibold">
                <div class="credit-name-container relative">
                  <a href="https://www.miriamquick.com/" target="_blank">Miriam Quick</a>
                  <span class="portrait-ring">
                    <img
                      class="portrait"
                      alt="Portrait of Miriam Quick"
                      src="https://amdufour.github.io/hosted-data/apis/portraits/miriam_quick.jpg"
                    />
                  </span>
                </div>
                <span class="font-normal">{' and '}</span>
                <div class="credit-name-container relative">
                  <a href="https://www.duncangeere.com/" target="_blank">Duncan Geere</a>
                  <span class="portrait-ring">
                    <img
                      class="portrait"
                      alt="Portrait of Duncan Geere"
                      src="https://amdufour.github.io/hosted-data/apis/portraits/duncan_geere.jpeg"
                    />
                  </span>
                </div>
                <span class="font-normal">{'{ '}</span>
                <div class="credit-name-container relative">
                  <a href={credit.url} target="_blank">{credit.name}</a>
                  <span class="portrait-ring">
                    <img
                      class="portrait"
                      alt="Loud Numbers logo"
                      src="https://amdufour.github.io/hosted-data/apis/portraits/loud_numbers.jpg"
                    />
                  </span>
                </div>
                <span class="font-normal">{' }'}</span>
              </div>
            {:else if credit.url}
              <div class="credit-name-container relative">
                <a href={credit.url} target="_blank" class="credit-name font-semibold"
                  >{credit.name}</a
                >
                <span class="portrait-ring">
                  <img
                    class="portrait"
                    loading="lazy"
                    alt="Portrait of {credit.name}"
                    src={credit.imgUrl}
                  />
                </span>
              </div>
            {:else}
              <div class="credit-name font-semibold">{credit.name}</div>
            {/if}
            <div class="credit-role">{credit.role}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Methodology -->
  <div class="section-block px-4 mb-16">
    <h3 class="section-heading">Methodology</h3>
    <div class="methodology-columns">
      <p>
        The data used in this study did not exist; it had to be manually gathered by watching every
        episode, armed with a spreadsheet, to log all the timings, categories, and characteristics
        of different events. Some of the data gathering decisions and approaches have been explained
        elsewhere in the project but it's worth adding some further detail.
      </p>
      <p>
        As outlined earlier, with so many episodes to work through, a pragmatic approach was
        required to ensure the best quality data could be obtained in the most efficient way.
        Typically, each episode's data was gathered through two full viewings. The first viewing
        would focus on recording the times of when discrete scenes started and finished, the
        locations in which these scenes were set, and when characters appeared on-screen in those
        scenes. The second viewing was done to validate the first-pass data and additionally capture
        details about which characters caused the observed audience laughter.
      </p>
      <p>
        To help with the efficiency of the data collecting, all measurements were recorded in and
        against units of 5-seconds periods. This approach offered sufficient granularity to
        accurately quantify a character's appearance and laughter contributions and, as explained
        earlier, aligned with the typical length of a moment of audience laughter.
      </p>
      <p>
        Though every effort has been made to maximise the accuracy of this collected data, the
        nature of qualitative enquiries and the subjective classifications being made means
        perfection will always be an elusive and unrealistic goal. It is inevitable there will be a
        small number of mistakes in the absolute precision of the categorisations or timings. A
        third viewing might have enhanced this data quality by ~1%, but given the manual effort
        already expended, life was considered far too short.
      </p>
      <p>
        One peculiarity encountered in this work concerned how networks, streaming platforms, and
        publishers sequence episodes in different ways. It is not unusual, for some shows, for
        studios to force the release of shows in production order, in order to maintain continuity
        (perhaps in the appearance of characters, the cast, or the design of sets).
      </p>
      <p>
        All the data gathered and used in this analysis came from watching episodes from the DVD
        box-set. However, the date an episode was first aired on US TV was used to determine its
        sequencing, rather than when it was originally produced, arranged on the DVDs, or ordered on
        streaming platform menus.
      </p>
      <p>
        There were 180 broadcasted episodes, of which 176 are defined, for this analysis, as
        discrete written episodes. This distinction is important. To mark the milestone of the 100th
        episode, NBC broadcast a special, double-episode (S6E14, S6E15) showing stand-out clips from
        the series to date. There was another double-episode (S9E21, S9E22) highlights compilation,
        shown ahead of the final ever episodes. As none of these were original written episodes they
        do not align with the remit of this exploration and were excluded.
      </p>
      <p>
        The timing and counting of distinct scenes within each episode was made through common sense
        judgements. Typically, a scene would be considered to be the period of a continuous,
        unbroken acted section of the story. There was usually a clear breakpoint or gap to conclude
        one scene and lead into the next. An episode's opening scene was judged to commence when the
        first acted scene began and, likewise, the final scene was timed to have finished once the
        last acted scene ended.
      </p>
      <p>
        The show's credits were not counted as being part of the episode run-time unless they were
        overlaid during the continuation of an acted scene. For the second part of double-episodes,
        any recaps were ignored. If a scene moved between multiple locations, so long as the
        dialogue continued seamlessly between the two, this was considered a single scene (e.g. when
        characters started a scene in some form of transport then got out, or if a phone
        conversation was being shown with the callers in different locations).
      </p>
      <p>
        Additional data was collected about broadcast dates, plot synopses and ratings from the
        episode pages on <a href="https://www.imdb.com/title/tt0098904/" target="_blank">IMDb</a>.
        Further qualitative information relating to joke topics, specific patterns in language
        usage, or themes of character representation were considered but were ultimately considered
        beyond the scope of the main enquiry.
      </p>
    </div>
  </div>

  <!-- Copyright -->
  <div class="section-block copyright-section px-4 pb-16">
    <h3 class="section-heading">Copyright Statement</h3>
    <div class="copyright-text">
      <p>
        This digital artwork is a non-commercial project created to analyse and explore data
        patterns in Seinfeld. The inclusion of six short video clips is purely for the purpose of
        visual commentary, to introduce the essence of the show that motivated this analytical
        pursuit, and to demonstrate the data classification mapping. This is done in the spirit of
        and in consistency with the nature of fair use/fair dealing principles, as recognised under
        international copyright law. All rights to Seinfeld belong to and are distributed by Sony
        Pictures Television. These rights remain with their owners and no endorsement is implied.
      </p>
      <p>
        Audio clips are sourced from <a
          href="https://getyarn.io/tv-series/6e5aa574-9637-11e7-a34c-42010af00cf6"
          target="_blank">YARN</a
        > and still imagery sourced from <a
          href="https://www.imdb.com/title/tt0098904/"
          target="_blank">IMDb</a
        >. All illustrations are original artworks, all sonification tracks are original
        compositions.
      </p>
      <p>
        For any enquiries, please contact Andy Kirk via <a href="mailto:andy@visualisingdata.com"
          >andy@visualisingdata.com</a
        >.
      </p>
    </div>
  </div>

</section>

<style>
  /* Section headings with full-width gradient underline */
  .section-heading {
    position: relative;
    padding-bottom: 0.75rem;
    margin-bottom: 1.75rem;
  }
  .section-heading::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--linear-gradient);
  }

  /* Credits: 2-column grid on large screens */
  .credits-grid {
    display: grid;
    grid-template-columns: 1fr;
  }
  .credit-item {
    padding: 1rem 0;
  }
  @media (min-width: 1024px) {
    .credits-grid {
      grid-template-columns: repeat(2, 1fr);
      column-gap: 4rem;
    }
  }

  /* Methodology: 2-column magazine layout on large screens */
  .methodology-columns p {
    margin-top: 0;
    margin-bottom: 1em;
  }
  @media (min-width: 1024px) {
    .methodology-columns {
      columns: 2;
      column-gap: 4rem;
    }
    .methodology-columns p {
      break-inside: avoid;
    }
  }

  /* Copyright: slightly smaller, muted */
  .copyright-section {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: 2rem;
  }
  .copyright-text {
    font-size: 0.9rem;
    opacity: 0.75;
    max-width: 80ch;
  }

  /* Credit name & portrait hover */
  .credit-name {
    font-size: 1.2rem;
  }
  .credit-role {
    font-size: 1rem;
  }
  .credit-name-container {
    display: inline-block;
  }
  .portrait-ring {
    position: absolute;
    z-index: 2;
    left: 50%;
    top: -50px;
    width: 81px;
    height: 81px;
    padding: 3px;
    border-radius: 60% 40% 50% 50% / 50% 50% 60% 40%;
    background: var(--ring-gradient);
    opacity: 0;
    translate: -50% 0px;
    scale: 1;
    transition:
      opacity 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
      translate 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
      scale 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
    pointer-events: none;
    animation:
      ring-spin 4s linear infinite,
      ring-morph 6s ease-in-out infinite;
  }
  .credit-name-container:hover .portrait-ring {
    opacity: 1;
    translate: -50% -40px;
    scale: 1.2;
  }
  .portrait {
    display: block;
    width: 75px;
    height: 75px;
    object-fit: cover;
    border-radius: 50%;
    border: none;
    animation: counter-spin 4s linear infinite;
  }
  @keyframes ring-spin {
    to {
      rotate: 360deg;
    }
  }
  @keyframes counter-spin {
    to {
      rotate: -360deg;
    }
  }
  @keyframes ring-morph {
    0%,
    100% {
      border-radius: 60% 40% 50% 50% / 50% 50% 60% 40%;
    }
    25% {
      border-radius: 40% 60% 30% 70% / 60% 40% 70% 30%;
    }
    50% {
      border-radius: 70% 30% 60% 40% / 40% 60% 30% 70%;
    }
    75% {
      border-radius: 30% 70% 40% 60% / 70% 30% 50% 50%;
    }
  }
</style>
