<script lang="ts">
  import CloseIcon from '../icons/CloseIcon.svelte';

  interface Finding {
    id: number;
    category: string;
    text: string;
    barColor?: string;
    barGradient?: string;
  }

  const CATEGORIES: { name: string; color: string }[] = [
    { name: 'Episodes & Scenes', color: '#453782' },
    { name: 'Laughs', color: '#E71D80' },
    { name: 'Lead Characters', color: '#5FA8D3' },
    { name: 'Supporting Characters', color: '#B3478B' },
    { name: 'Locations', color: '#4CB278' },
  ];

  const findings: Finding[] = [
    // Episodes & Scenes
    {
      id: 1,
      category: 'Episodes & Scenes',
      barGradient: 'linear-gradient(to right, #228A8D, #453782)', // S6 → S9
      text: 'To mark the milestone of the 100th episode, NBC broadcast a special, double-episode (S6E14, S6E15) showing stand-out clips from the series to date. There was another double-episode (S9E21, S9E22) highlights compilation, ahead of the final ever episodes. These are the four episodes that were excluded from the scope of this work.',
    },
    {
      id: 2,
      category: 'Episodes & Scenes',
      barGradient:
        'linear-gradient(to right, #7DBA57, #4CB278, #1DA388, #228A8D, #2F708E, #39578D, #453782)', // S3 → S9
      text: 'After getting established as a show during its first two seasons — only 5 and 12 episodes respectively — all future seasons comprised between 22 and 24 episodes each.',
    },
    {
      id: 3,
      category: 'Episodes & Scenes',
      barColor: '#B8CE32', // S2
      text: 'The start of Season Two was delayed by a week due to the outbreak of conflict in Baghdad, Iraq, and the start of the Gulf War.',
    },
    {
      id: 4,
      category: 'Episodes & Scenes',
      barColor: '#FDE824', // S1
      text: 'Only eight episodes were ever aired in the month of March and just seven during the summer months of June, July and August — four of which were in Season One.',
    },
    {
      id: 5,
      category: 'Episodes & Scenes',
      barColor: '#453782', // S9 finale
      text: 'The special double final episodes were aired on US TV on 14th May 1998 and were estimated to have been watched by 76.3M viewers. On the same night, Frank Sinatra died.',
    },
    {
      id: 6,
      category: 'Episodes & Scenes',
      barColor: '#928D90', // general across all seasons
      text: 'Aside from slight variation, and a handful of substantial exceptions, the length of each episode generally converged around an average duration of 22 minutes — typical for US TV shows, allowing 8 minutes of commercial breaks during 30-minute scheduling blocks.',
    },
    {
      id: 7,
      category: 'Episodes & Scenes',
      barGradient: 'linear-gradient(to right, #1DA388, #39578D, #453782)', // S5, S8, S9
      text: 'S5E19 "The Raincoats (Part 2)" was the shortest episode at just 16m35s. S9E24 "The Finale (Part 2)" was the longest at 30m35s, with S8E19 "The Yada Yada" having the second longest run-time of 25m25s.',
    },
    {
      id: 8,
      category: 'Episodes & Scenes',
      barGradient:
        'linear-gradient(to right, #FDE824, #B8CE32, #7DBA57, #4CB278, #1DA388, #228A8D, #2F708E, #39578D, #453782)', // S1 → S9
      text: 'The second scenes in each episode — normally used to establish and instigate the main storylines — gradually reduced in duration across each season, from an average of 3m40s in Season One to 59s in Season Eight, before increasing slightly in Season Nine.',
    },
    {
      id: 9,
      category: 'Episodes & Scenes',
      barColor: '#928D90', // general observation
      text: 'Within each episode, scene durations varied wildly — from 20-minute continuous stories down to rapid-fire 5-second moments. Changing the pace of a story was a key device to keep the show fresh and enabled experimentation.',
    },
    {
      id: 10,
      category: 'Episodes & Scenes',
      barGradient:
        'linear-gradient(to right, #FDE824, #B8CE32, #7DBA57, #4CB278, #1DA388, #228A8D, #2F708E, #39578D, #453782)', // S1 → S9
      text: 'Conventional sitcoms were organised around three main acts with 3–5 scenes per act (around 10–12 scenes per episode). From Season Four especially, the count of distinct recognised scenes per episode averaged above 20, reaching over 27 by Season Eight. Individual episodes fluctuated from as low as 3 scenes (S2E11) to as many as 54 (S9E24).',
    },
    {
      id: 11,
      category: 'Episodes & Scenes',
      barGradient: 'linear-gradient(to right, #39578D, #453782)', // S8 → S9
      text: 'When Seinfeld took over from David for the final two seasons as Head Writer and Exec Producer, this marked an increase in the pace of the show — a rise in discrete scenes, greater variety of character combinations, and a growth in script length across the seasons.',
    },
    // Laughs
    {
      id: 12,
      category: 'Laughs',
      text: 'The range of laughter counts per episode varies from a low of 107 in S7E22 "The Bottle Deposit (Part 2)" up to a high of 215 in S9E15 "The Wizard".',
    },
    {
      id: 13,
      category: 'Laughs',
      text: 'With the exception of S7E23 "The Wait Out", the laughter rate dropped significantly below average for the later episodes of Season Seven — the final episodes of Larry David\'s tenure as Exec Producer.',
    },
    {
      id: 14,
      category: 'Laughs',
      text: 'The rhythm of laughs within an episode shifted from a consistent even distribution in early seasons to a more skewed one during the middle seasons (Six and Seven especially), as expanded scene counts created a story structure with scope to vary the laughter density.',
    },
    {
      id: 15,
      category: 'Laughs',
      text: 'S9E11 "The Dealership" had the highest laughter rate (81.6%), soon followed by S9E24 "The Finale (Part 2)" which had the lowest laughter rate (39.8%), continuing a late Season Nine downward trend.',
    },
    {
      id: 16,
      category: 'Laughs',
      text: 'As seen in the "Peak performances?" chart, the two finale shows (S9E23 and S9E24) both show a unique pattern: the four lead characters had a low laughter rate and a low share of laughs despite their lengthy on-screen time.',
    },
    {
      id: 17,
      category: 'Laughs',
      text: 'S3E1 "The Note" had the second-highest laughter rate and is the first episode where Jerry loses out to George for the top ranking of most laughs caused.',
    },
    {
      id: 18,
      category: 'Laughs',
      text: 'In S3E3 "The Pen", it is Jerry\'s family who cause the most laughs — the first episode without a lead character topping the ranks, indicating a slight shift in the show\'s writing.',
    },
    {
      id: 19,
      category: 'Laughs',
      text: 'Season Four sees the first occasions in which Kramer (S4E6 "The Watch") and Elaine (S4E14 "The Movie") cause the most laughs in an episode.',
    },
    {
      id: 20,
      category: 'Laughs',
      text: 'In only two episodes — S7E22 "The Bottle Deposit (Part 2)" and S9E11 "The Dealership" — was Jerry ranked outside the top 4 for episode laughter share.',
    },
    {
      id: 21,
      category: 'Laughs',
      text: "Kramer tops the laughter share rankings on ten occasions during Seasons Eight and Nine, indicating the shift towards using him more to deliver the comedy under Seinfeld's stewardship.",
    },
    {
      id: 22,
      category: 'Laughs',
      text: "Jerry was on-screen more than any other character but had a lower overall laughter rate than both the Neighbours and George's family character groups.",
    },
    {
      id: 23,
      category: 'Laughs',
      text: 'Love interests were not on-screen to cause the laughs — they were the character group with the lowest laughter rate.',
    },
    {
      id: 24,
      category: 'Laughs',
      text: "There were some instances of recorded laughs not attributable to a character, but rather to the situation in general. 499 (1.6%) of the show's total laughs fell under this classification, peaking at 3% during Season Four.",
    },
    // Lead Characters
    {
      id: 25,
      category: 'Lead Characters',
      barColor: '#5FA8D3', // Jerry
      text: "Across 30.3% of Season One's total run-time, Jerry was on-screen but with none of the other lead characters — the highest such proportion of on-screen time where a lead character appears alone.",
    },
    {
      id: 26,
      category: 'Lead Characters',
      barColor: '#5FA8D3', // Jerry
      text: 'S2E7 "The Revenge" is the first episode in which Jerry does not have the most screen-time.',
    },
    {
      id: 27,
      category: 'Lead Characters',
      barColor: '#FBBA3A', // Elaine
      text: 'S7E4 "The Wink" is the only episode in which Elaine tops the relative screen-time rankings.',
    },
    {
      id: 28,
      category: 'Lead Characters',
      barColor: '#83C8C3', // Kramer
      text: 'S9E7 "The Slicer" was Kramer\'s only top-ranked screen-time episode (shared with George).',
    },
    {
      id: 29,
      category: 'Lead Characters',
      barColor: '#928D90', // no specific lead character
      text: 'S3E13 "The Subway" is the first episode where none of the lead characters had the most screen-time — with "other persons" taking the top rank at 49% of on-screen time.',
    },
    {
      id: 30,
      category: 'Lead Characters',
      barColor: '#5FA8D3', // Jerry
      text: 'S7E15 "The Cadillac (Part 2)" was the only episode in which Jerry is outside the top four rankings for screen-time.',
    },
    {
      id: 31,
      category: 'Lead Characters',
      barColor: '#928D90', // all four leads
      text: "The four leads were on-screen together in the same scene for just 4.8% of the show's entire run time.",
    },
    // Supporting Characters
    {
      id: 32,
      category: 'Supporting Characters',
      barColor: '#835330', // family
      text: "Characters depicting Elaine's and Kramer's family were both used fleetingly, appearing in just one episode each. Laurence Tierney (Elaine's father in S2E3) was potentially being lined up as a recurring character, but was reportedly a somewhat intimidating presence off-screen and was never written back in. Kramer's mother Babs has a single brief appearance in S6E11 \"The Switch\", memorable for revealing his first name: Cosmo.",
    },
    {
      id: 33,
      category: 'Supporting Characters',
      barColor: '#835330', // family (siblings never seen)
      text: 'Though Jerry, George, and Elaine all have siblings mentioned during the show, they are never seen — and there is no mention of any Kramer sibling relation at all.',
    },
    {
      id: 34,
      category: 'Supporting Characters',
      barColor: '#B3478B', // love interest
      text: "Love was often in the air, with some form of love interest a recurring component of the show's storylines. According to DVD commentary on Season Nine, Jerry dated 73 different women. Love interest characters were active on-screen in 86% of episodes, with scene appearances and total screen-time noticeably peaking during Season Five.",
    },
    {
      id: 35,
      category: 'Supporting Characters',
      barColor: '#B3478B', // friends/acquaintances
      text: "The Friends character group plays a limited role across the whole show: despite appearing in over half of the episodes (92), they command relatively little screentime (8%) and only 2.5% of total laughs. The most frequently mentioned friend — Kramer's pal Bob Sacamano, referred to in ten episodes — is never seen on screen.",
    },
    {
      id: 36,
      category: 'Supporting Characters',
      barColor: '#835330', // George's family
      text: 'S4E11 "The Contest" marked the first appearance of George\'s family.',
    },
    {
      id: 37,
      category: 'Supporting Characters',
      barColor: '#B3478B', // neighbour
      text: 'Newman only appeared in storylines from the middle of Season Three (S3E15 "The Suicide"). Despite being Kramer\'s friend and appearing in nearly 50 episodes, he was categorised as a neighbour rather than a friend for this analysis — and is often ranked by fans as the fifth favourite character.',
    },
    // Locations
    {
      id: 38,
      category: 'Locations',
      barColor: '#12020A',
      text: 'Jerry\'s home was not used as the setting of any scene in just 12 episodes, the first of which was S2E11 "The Chinese Restaurant".',
    },
    {
      id: 39,
      category: 'Locations',
      barColor: '#12020A',
      text: "The use of the other lead characters' homes in scenes peaks in the later seasons — George's home in Season Seven, Kramer's in Eight, and Elaine's in Nine.",
    },
    {
      id: 40,
      category: 'Locations',
      barColor: '#12020A',
      text: 'No episodes used locations from every category, but there were seven episodes where ten different location settings were used.',
    },
    {
      id: 41,
      category: 'Locations',
      barColor: '#12020A',
      text: 'Workplace was the second most used location during Season One but dropped to the fifth-ranked setting by Season Nine.',
    },
    {
      id: 42,
      category: 'Locations',
      barColor: '#12020A',
      text: 'Places of leisure rose to the third-ranked location by Season Five but appeared in relatively few scenes by Season Nine.',
    },
    {
      id: 43,
      category: 'Locations',
      barColor: '#12020A',
      text: "Although Kramer's home was seldom used as the setting for a scene, it was the dominant location for laughter intensity — with a laughter rate of 74%, meaning for every 60 seconds of a scene set there, 45 seconds were filled with laughter.",
    },
  ];

  const textLengths = findings.map((f) => f.text.length);
  const minLen = Math.min(...textLengths);
  const maxLen = Math.max(...textLengths);

  function getBarWidth(f: Finding): number {
    const normalized = (f.text.length - minLen) / (maxLen - minLen);
    return 25 + normalized * 65; // 25% to 90%
  }

  const findingsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    findings: findings.filter((f) => f.category === cat.name),
  }));

  let hoveredFinding = $state<Finding | null>(null);

  const CHAR_COLORS: Record<string, string> = {
    // Locations — longest first so "Kramer's home" beats "Kramer", etc.
    'Places of leisure': '#12020A',
    'Place of leisure': '#12020A',
    "Jerry's home": '#12020A',
    "George's home": '#12020A',
    "Kramer's home": '#12020A',
    "Kramer's": '#12020A',
    "Elaine's home": '#12020A',
    "Elaine's": '#12020A',
    'Family home': '#12020A',
    Workplace: '#12020A',
    Diner: '#12020A',
    Transport: '#12020A',
    Outside: '#12020A',
    // Lead characters
    Jerry: '#5FA8D3',
    George: '#EB6447',
    Elaine: '#FBBA3A',
    Kramer: '#83C8C3',
    // Supporting characters
    'Bob Sacamano': '#B3478B',
    Newman: '#B3478B',
    Cosmo: '#83C8C3',
    Babs: '#835330',
  };

  const _charPattern = new RegExp(
    `\\b(${Object.keys(CHAR_COLORS)
      .sort((a, b) => b.length - a.length)
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})\\b`,
    'g',
  );

  function highlightText(text: string): string {
    let matchIndex = 0;
    return text.replace(_charPattern, (name) => {
      const color = CHAR_COLORS[name];
      const delay = matchIndex++ * 0.15;
      return `<span class="char-highlight" style="--char-color: ${color}; animation-delay: ${delay}s;">${name}</span>`;
    });
  }
</script>

<section id="what-have-we-learned" class="min-h-screen bg-[#F9F5F7] flex flex-col">
  <div class="container flex flex-col flex-1 py-12 desktop:py-16">
    <h3 class="mb-2 desktop:mb-4">What have we learned?</h3>

    <div class="flex flex-col desktop:grid desktop:grid-cols-12 desktop:gap-16 flex-1">
      <!-- Left: bars grouped by category (rendered after detail on mobile) -->
      <div class="order-last desktop:order-none desktop:col-span-5 flex flex-col gap-5">
        {#each findingsByCategory as group}
          <div class="flex flex-col gap-1">
            <span class="text-[11px] font-mono uppercase tracking-widest mb-1 text-[#12020A]">
              {group.name}
            </span>
            {#each group.findings as finding}
              <div
                role="button"
                tabindex="0"
                class="bar-row py-0.5 cursor-pointer"
                onmouseenter={() => (hoveredFinding = finding)}
                onmouseleave={() => (hoveredFinding = null)}
                ontouchend={(e) => {
                  e.preventDefault();
                  hoveredFinding = hoveredFinding?.id === finding.id ? null : finding;
                }}
                onkeydown={(e) =>
                  e.key === 'Enter' &&
                  (hoveredFinding = hoveredFinding?.id === finding.id ? null : finding)}
              >
                <div
                  class="bar h-2 rounded-full transition-all duration-150"
                  style="
                    width: {getBarWidth(finding)}%;
                    background: {finding.barGradient ?? finding.barColor ?? group.color};
                    opacity: {!hoveredFinding || hoveredFinding.id === finding.id ? 1 : 0.25};
                    transform: scaleY({hoveredFinding?.id === finding.id ? 1.5 : 1});
                    transform-origin: center left;
                  "
                ></div>
              </div>
            {/each}
          </div>
        {/each}
      </div>

      <!-- Detail panel: sticky at top on mobile, right column on desktop -->
      <div
        class="order-first desktop:order-none desktop:col-span-7 sticky top-0 desktop:static z-10 bg-[#F9F5F7] py-4 desktop:py-0 border-b border-[#928D90]/20 desktop:border-none mb-6 desktop:mb-0 min-h-[80px] desktop:min-h-0 flex flex-col desktop:justify-center"
      >
        {#if hoveredFinding}
          <div class="finding-detail">
            <span
              class="inline-block text-[14px] font-mono uppercase tracking-widest mb-3 text-[#12020A]"
            >
              {hoveredFinding.category}
            </span>
            <p class="text-[#12020A] leading-relaxed m-0">
              {@html highlightText(hoveredFinding.text)}
            </p>
            <div class="desktop:hidden flex justify-end mt-3">
              <button
                class="opacity-40 hover:opacity-80 transition-opacity"
                onclick={() => (hoveredFinding = null)}
                aria-label="Close"
              >
                <CloseIcon color="#12020A" size={18} />
              </button>
            </div>
          </div>
        {:else}
          <p class="text-[#928D90] text-[1.2rem] italic m-0">
            <span class="hidden desktop:inline">Hover</span><span class="desktop:hidden">Tap</span> a
            bar to read the finding
          </p>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  :global(.char-highlight) {
    font-weight: 600;
    color: var(--char-color);
    animation: charReveal 0.8s ease-out both;
  }

  @keyframes charReveal {
    from {
      color: #12020a;
    }
    to {
      color: var(--char-color);
    }
  }
</style>
