<script>
  import { pack } from "d3-hierarchy"
  import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
  import { scaleBand } from "d3-scale";

  import { jsonToHierarchy } from "../../utils/jsonToHierarchy"
  import { characters } from "$lib/data/characters";
  import { combinedPerformances } from "$lib/data/combinedPerformances";
  import { getCharacterImagePath } from "../../utils/getCharacterImagePath";
  import { seasons } from "$lib/data/seasons";
  import { episodesInfo } from "$lib/data/episodesInfo";
  import HelpIcon from "../../icons/HelpIcon.svelte";

  let { episodesData } = $props()

  let currentChars = characters.slice(0, 4);
  let activeCharacter = $state(['JERRY', 'KRAMER']);
  // Get combined perf via worker and return hierarchical data with force layout
  const sharedData = $derived(combinedPerformances[activeCharacter.join('-')])
  $inspect(activeCharacter.join('-'))
  
  const handleCharacterClick = (char) => {
    let updatedActiveCharacters = [...activeCharacter]
    if (activeCharacter.includes(char.id)) {
      // Unselect character
      const charIndex = updatedActiveCharacters.indexOf(char.id)
      updatedActiveCharacters = updatedActiveCharacters.filter(c => c !== char.id)
    } else {
      // Select character
      updatedActiveCharacters.push(char.id)
    }
    
    activeCharacter = updatedActiveCharacters
  }

  let screenHeight = $state(800)
  let headerHeight = $state(300)
  let vizContainerWidth = $state(1200)
  // let vizContainerHeight = $derived(Math.max(screenHeight - headerHeight - 100, 600))
  $inspect('sharedData', sharedData)
  
  // Is data updating properly?
  const packLayoutGenerator = $derived(pack().size([vizContainerWidth, 600]).padding(3))
  const root = $derived.by(() => {
    const hierarchicalData = jsonToHierarchy(sharedData)
    const initialRoot = hierarchicalData[0].sum(d => d.duration)

    packLayoutGenerator(initialRoot)

    return initialRoot
  })
  const descendantsToDisplay = $derived.by(() => {
    return root.descendants().filter(d => d.depth > 0)
    // return root.descendants().filter(d => d.depth === 1 && d.children)
  })
  $inspect('circlePackData', descendantsToDisplay)

  // let nodes = $state([]);
  // const episodesScale = $derived(
  //   scaleBand()
  //     .domain(episodesInfo.map(d => `${d.season}-${d.episode}`))
  //     .range([0, vizContainerWidth])
  // )

	// $effect(() => {
  //   let simulation = forceSimulation(descendantsToDisplay);
  //   simulation.on('tick', () => {
  //     nodes = simulation.nodes();
  //   });
  //   simulation
  //     .force('x', forceX((d) => episodesScale(`${d.data.season}-${d.data.episode}`)).strength(1))
  //     .force('y', forceY(() => 300).strength(0.1))
  //     .force('collide', forceCollide().radius(d => d.r).strength(1))
  //     .alpha(0.5)
  //     .alphaDecay(0.1);
  // })
  // $inspect('nodes', nodes)
</script>

<svelte:window bind:innerHeight={screenHeight} />

<div class="w-screen mb-60">
  <div class="container">
    <!-- Header -->
    <div bind:clientHeight={headerHeight} class="mb-8">
      <h3>Better together</h3>
      <div style="max-width: 900px;">A sitcom like Seinfeld is comparable to a sports team: Sometimes players shine as individuals, but mostly it’s about the interactions and combination plays with other team mates.</div>
    </div>
    <div class="grid grid-cols-12 md:gap-8">

      <!-- Buttons -->
      <div class="col-span-12 md:col-span-2 flex flex-col items-center relative">
        <div class="hint small flex items-center gap-2 mb-6" style="max-width: 320px;">
          <span class="shrink"><HelpIcon color="#E71D80" /></span>
          <span class="relative top-1">Select a combination of characters to reveal their group performances</span>
        </div>
        <ul class="grid gap-6 flex-wrap grid-cols-1">
          {#each currentChars as char}
            <li class="flex justify-center">
              <button 
                class="character-button flex flex-col items-center max-w-28 {activeCharacter.includes(char.id) ? 'active' : ''}"
                onclick={() => handleCharacterClick(char)}>
                <div class="character rounded-full bg-contain bg-center opacity-50" 
                    style="background-image: url('{getCharacterImagePath(char.id)}'); width: 75px; height: 75px;"></div>
                <div class="text-center pt-1" style="font-size: 1.25rem; line-height: 1.2;">{char.label}</div>
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Visualizations -->
      <div bind:clientWidth={vizContainerWidth} class="col-span-8">
        {#if activeCharacter.length < 2}
          <div>Select at least two characters</div>
        {:else}
          <svg width={vizContainerWidth} height={600} style="border: 1px solid cyan;">
            {#each descendantsToDisplay as circle}
              <circle
                class={circle.depth === 1 ? `episode ${circle.data.name}` : circle.depth === 2 ? `scene ${circle.data.name}` : `location ${circle.data.location}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                fill={circle.depth === 1 ? seasons.find(s => s.seasonNum === circle.data.season)?.color : circle.depth === 2 ? 'none' : '#12020A'}
                stroke={circle.depth === 2 ? '#12020A' : 'none'}
              />
            {/each}
            <!-- {#each nodes as circle}
              <circle
                class={`episode ${circle.data.name}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                fill={seasons.find(s => s.seasonNum === circle.data.season)?.color}
              />
            {/each} -->
          </svg>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .character {
    transition: opacity 0.3s ease-out;
  }
  .character-button:hover .character,
  .character-button.active .character {
    opacity: 1;
  }
</style>