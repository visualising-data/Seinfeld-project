<script lang="ts">
    import { mean } from "d3-array";
    import type { Episode } from "$lib/types/episode";
    import type { ScaleBand, ScaleLinear } from "d3-scale";
    import PercentageAxes from "./PercentageAxes.svelte";

    let { 
          episodesData, 
          barsHeight, 
          width, 
          topMargin, 
          episodeVerticalPositionScale, 
          percentageScale, 
          handleMouseEnter = $bindable(), 
          handleMouseLeave = $bindable() 
        } : { 
          episodesData: Episode[]; 
          barsHeight: number; 
          width: number; topMargin: number; 
          episodeVerticalPositionScale: ScaleBand<string>; 
          percentageScale: ScaleLinear<number, number>, 
          handleMouseEnter: (e: MouseEvent & { currentTarget: EventTarget & SVGRectElement; }, episode: Episode) => void, 
          handleMouseLeave: () => void 
        } = $props();

    const laughRates = [] as number[];
    episodesData.forEach(episode => {
        const laughRate = episode.laughs.length * 5 / episode.duration;
        laughRates.push(laughRate);
    });
    const meanLaughRate = Math.round((mean(laughRates) ?? 0) * 100);
</script>

<div id="laugh-rate" class="relative ml-4">
    <svg width={width + 40} height={barsHeight + 70} style="margin-top: -35px; padding-top: {topMargin}px;">
        <g transform="translate(20, 0)">
            <!-- Background -->
            <rect 
                x={0} 
                y={35} 
                width={width} 
                height={barsHeight} 
                fill="rgba(231, 28, 128, 0.15)" />

            <!-- Percentages -->
            <PercentageAxes {barsHeight} {width} secondLabel="100%" />

            <!-- Label -->
            <text 
                class="small accent label" 
                x={6} 
                y={30}>Laugh rate</text>

            <g transform="translate(0, 35)">
                <!-- Laugh rate bars -->
                {#each episodesData as episode}
                    <rect
                        class="bar"
                        x={0}
                        y={episodeVerticalPositionScale(`${episode.season}-${episode.episode}`)}
                        width={percentageScale(episode.laughs.length * 5 / episode.duration)}
                        height={episodeVerticalPositionScale.bandwidth()}
                        fill="#E71D80"
                        role="document"
					    onmouseenter={(e) => handleMouseEnter(e, episode)}
					    onmouseleave={handleMouseLeave}
                    />
                {/each}

                <!-- Mean -->
                <line
                    class="avg-line"
                    x1={percentageScale(meanLaughRate / 100)}
                    y1={0}
                    x2={percentageScale(meanLaughRate / 100)}
                    y2={barsHeight}
                    stroke="#12020A"
                    stroke-width={2} />
            </g>
        </g>
    </svg>

    <!-- Average label -->
    <div class="avg-label small absolute text-center px-2 py-1 rounded-md"
         style="
            top: {100}px; 
            left: {percentageScale(meanLaughRate / 100) - 38}px; 
            background-color: rgba(249, 245, 247, 0.9);"
    >
        <div>avg</div>
        <div>{`${meanLaughRate}%`}</div>
    </div>
</div>