<script lang="ts">
    import { max } from "d3-array";
    import { scaleLinear } from "d3-scale";
    import type { Episode } from "$lib/types/episode";
    import type { ScaleBand } from "d3-scale";
    import ArrowDown from "../../icons/ArrowDown.svelte";

    let { 
          episodesData, 
          barsHeight, 
          width, 
          topMargin, 
          episodeVerticalPositionScale,
          handleMouseEnter = $bindable(), 
          handleMouseLeave = $bindable() 
        } : { 
          episodesData: Episode[]; 
          barsHeight: number; 
          width: number; 
          topMargin: number; 
          episodeVerticalPositionScale: ScaleBand<string>;
          handleMouseEnter: (e: MouseEvent & { currentTarget: EventTarget & SVGRectElement; }, episode: Episode) => void, 
          handleMouseLeave: () => void  
        } = $props();

    let innerWidth = $state(1600);
    let innerHeight = $state(800);

    let episodeMaxDuration = $derived(max(episodesData, d => d.duration) ?? 0);

    let episodeTimeScale = $derived(
        scaleLinear()
            .domain([0, episodeMaxDuration])
            .range([0, width])
    );

    let minutes = ['00', "05", "10", "15", "20", "25", "30"];
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="episode-bars" class="relative z-10" style="padding-top: {topMargin}px;">
    <svg id="episodes" width={width + 50} height={barsHeight + 70} style="margin-top: -35px; margin-left: -25px;">
        <g class="label">
            <g transform="translate(20, 105) rotate(-90)">
                <text class="small accent">Episodes</text>
            </g>
            <g transform="translate(13, 111)">
                <ArrowDown />
            </g>
        </g>

        <g transform="translate(25, 0)">
            <!-- Time -->
            {#each minutes as minute}
                <g transform={`translate(${episodeTimeScale(+minute * 60)}, 0)`}>
                    <text
                        class="number"
                        x={0}
                        y={20}
                        text-anchor="middle"
                        fill="#928D90"
                    >
                        {`${minute}:00`}
                    </text>
                    <line
                        x1={0}
                        y1={25}
                        x2={0}
                        y2={barsHeight + 45}
                        stroke="#928D90"
                    />
                    <text
                        class="number"
                        x={0}
                        y={barsHeight + 60}
                        text-anchor="middle"
                        fill="#928D90"
                    >
                        {`${minute}:00`}
                    </text>
                </g>
            {/each}
        </g>

        <g transform="translate(25, 35)">
            <!-- Episodes bars -->
            {#each episodesData as episode}
                <rect
                    class="episode-bar"
                    x={0}
                    y={episodeVerticalPositionScale(`${episode.season}-${episode.episode}`)}
                    width={episodeTimeScale(episode.duration)}
                    height={episodeVerticalPositionScale.bandwidth()}
                    fill="#DDDBDC"
                    role="document"
					onmouseenter={(e) => handleMouseEnter(e, episode)}
					onmouseleave={handleMouseLeave}
                />
            {/each}
        </g>
    </svg>
    <svg id="laughs" class="absolute top-0 left-0 pointer-events-none" width={width + 50} height={barsHeight + 70} style="margin-left: -25px;">
        <g transform="translate(25, 65)">
            {#each episodesData as episode}
                <!-- Laugh bars -->
                {#each episode.laughs as laugh}
                    <rect
                        class="laugh-bar"
                        x={episodeTimeScale(+laugh.eventTimeSeconds)}
                        y={episodeVerticalPositionScale(`${episode.season}-${episode.episode}`)}
                        width={episodeTimeScale(5)}
                        height={episodeVerticalPositionScale.bandwidth()}
                        fill="#12020A"
                        pointer-events="none"
                    />
                {/each}
            {/each}
        </g>
    </svg>
</div>