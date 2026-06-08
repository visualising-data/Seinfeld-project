<!-- Text 1 -->
<div class="flex w-screen items-center justify-center text-1-container">
  <div id="calendar-text-overlay-1" class="text-overlay">
    Let’s go back to the start. Seinfeld aired on US TV for the first time on Wednesday 5th July
    <span class="highlight">1989</span>, with a pilot episode titled 'Good News, Bad News'.
  </div>
</div>

<!-- Text 2 -->
<div class="flex h-[100dvh] w-screen items-center justify-center">
  <div id="calendar-text-overlay-2" class="text-overlay">
    Though it was watched by 15.4M viewers, the <span class="highlight"
      >early reviews were mixed</span
    > - test audiences hated it, TV critics liked it - so its future was initially uncertain. However,
    thanks to the perseverance and persuasion of NBC executive Rick Ludwin, four more episodes were belatedly
    ordered to complete the unusually short first season.
  </div>
</div>

<!-- Text 3 -->
<div class="flex h-[100dvh] w-screen items-center justify-center">
  <div id="calendar-text-overlay-3" class="text-overlay">
    This opening season belatedly wrapped a year later, in the summer of 1990, and was now receiving
    warmer ratings from critics and audiences alike. This response was positive enough to convince
    NBC to commission a <span class="highlight">second season</span>, this time comprising 12
    episodes.
  </div>
</div>

<!-- Text 4 -->
<div class="flex h-[100dvh] w-screen items-center justify-center">
  <div id="calendar-text-overlay-4" class="text-overlay">
    Despite a slightly rocky start with Season Two, critical reviews and audience ratings continued
    to improve giving NBC reason to not only green-light a third season but to move the show into
    the sought-after <span class="highlight">Fall schedule</span>, where buzz, anticipation, and
    advertising revenues peak.
  </div>
</div>

<!-- Text 5 -->
<div class="flex h-[100dvh] w-screen items-center justify-center">
  <div id="calendar-text-overlay-5" class="text-overlay">
    Towards the middle of Season Four the show was moved to Thursdays, straight after Cheers, in the
    most popular <span class="highlight">prime-time slot</span>.
  </div>
</div>

<!-- Text 6 -->
<div class="flex h-[100dvh] w-screen items-center justify-center">
  <div id="calendar-text-overlay-6" class="text-overlay">
    When the final episode was broadcast, on 14th May 1998, it brought to an end <span
      class="highlight">nine seasons</span
    >
    and a total of
    <span class="highlight">180 episodes</span>.
  </div>
</div>

<div
  id="calendar-text-overlay-7"
  class="flex h-[100dvh] w-screen items-center justify-center"
></div>

<style>
  /* Desktop: large spacer so text-1 appears only after significant scroll */
  .text-1-container {
    height: calc(150vh + 260px);
    padding-top: calc(50vh + 260px);
  }
  /* Mobile/tablet: calendar is in-flow (sticky) above this content, so the
     extra push-down padding is not needed — text-1 appears after ~half a
     viewport of scrolling past the sticky calendar. */
  @media (max-width: 1023px) {
    .text-1-container {
      height: 100dvh;
      padding-top: 0;
    }
  }
</style>
