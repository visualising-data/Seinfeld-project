<script>
  import { seasons } from '$lib/data/seasons';
  import { locationsAvgScreenTimePerSeason } from '$lib/data/locationsScreenTime';
  import { scaleLinear } from 'd3-scale';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import ArrowDown from '../../icons/ArrowDown.svelte';

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let containerWidth = $state(1200);
  let headerHeight = $state(100);

  // Icon dimensions (defined early for margin calculation)
  const iconSize = 50;
  const iconGap = 24;

  // Container padding (2rem on each side = 4rem total = 64px)
  const containerPadding = 64;

  // Chart dimensions
  const margin = {
    top: 20,
    right: iconSize + iconGap,
    bottom: 60,
    left: iconSize + iconGap,
  };

  let availableWidth = $derived(containerWidth - containerPadding);
  let chartWidth = $derived(availableWidth - margin.left - margin.right);
  let chartHeight = $derived.by(() => {
    const availableHeight = innerHeight - headerHeight - 200;
    return Math.max(500, Math.min(700, availableHeight));
  });

  // Prepare data for alluvial diagram
  const preparedData = $derived.by(() => {
    // Get unique seasons
    const seasonNumbers = Array.from({ length: 9 }, (_, i) => i + 1);

    // Padding between ribbons in proportion space
    const paddingPixels = 8;
    const paddingProportion = paddingPixels / chartHeight;

    // For each season, get locations sorted by avgScreenTimeShare (descending)
    const seasonData = seasonNumbers.map((seasonNum) => {
      const locationsForSeason = locationsAvgScreenTimePerSeason
        .map((location) => {
          const seasonData = location.seasons.find((s) => s.season === seasonNum);
          return {
            id: location.id,
            label: location.label,
            season: seasonNum,
            avgScreenTimeShare: seasonData?.avgScreenTimeShare || 0,
          };
        })
        .sort((a, b) => b.avgScreenTimeShare - a.avgScreenTimeShare);

      // Calculate y positions (cumulative) with padding
      let cumulativeY = 0;
      const locationsWithPositions = locationsForSeason.map((loc, index) => {
        const startY = cumulativeY;
        const height = loc.avgScreenTimeShare;
        cumulativeY += height;

        // Add padding after each location except the last one
        if (index < locationsForSeason.length - 1) {
          cumulativeY += paddingProportion;
        }

        return {
          ...loc,
          y0: startY,
          y1: startY + height,
        };
      });

      return {
        season: seasonNum,
        locations: locationsWithPositions,
        total: cumulativeY,
      };
    });

    return seasonData;
  });

  // Create scales
  const xScale = $derived.by(() => scaleLinear().domain([1, 9]).range([0, chartWidth]));

  const yScale = $derived.by(() => {
    // Find the maximum total across all seasons (including padding)
    const maxTotal = Math.max(...preparedData.map((d) => d.total));

    return scaleLinear().domain([0, maxTotal]).range([0, chartHeight]);
  });

  // Generate ribbon paths
  const ribbons = $derived.by(() => {
    const allRibbons = [];

    preparedData.forEach((seasonData, seasonIndex) => {
      if (seasonIndex < preparedData.length - 1) {
        const nextSeasonData = preparedData[seasonIndex + 1];

        seasonData.locations.forEach((location) => {
          const nextLocation = nextSeasonData.locations.find((l) => l.id === location.id);
          if (nextLocation) {
            const x0 = xScale(location.season);
            const x1 = xScale(nextLocation.season);
            const y0_top = yScale(location.y0);
            const y0_bottom = yScale(location.y1);
            const y1_top = yScale(nextLocation.y0);
            const y1_bottom = yScale(nextLocation.y1);

            // Create bezier curve path
            const controlPointOffset = (x1 - x0) * 0.5;

            const path = `
              M ${x0},${y0_top}
              C ${x0 + controlPointOffset},${y0_top} ${x1 - controlPointOffset},${y1_top} ${x1},${y1_top}
              L ${x1},${y1_bottom}
              C ${x1 - controlPointOffset},${y1_bottom} ${x0 + controlPointOffset},${y0_bottom} ${x0},${y0_bottom}
              Z
            `.trim();

            allRibbons.push({
              path,
              locationId: location.id,
              locationLabel: location.label,
              fromSeason: location.season,
              toSeason: nextLocation.season,
              value: location.avgScreenTimeShare,
            });
          }
        });
      }
    });

    return allRibbons;
  });

  // Generate nodes (vertical bars for each season)
  const nodes = $derived.by(() => {
    const allNodes = [];

    preparedData.forEach((seasonData) => {
      seasonData.locations.forEach((location) => {
        const x = xScale(location.season);
        const y0 = yScale(location.y0);
        const y1 = yScale(location.y1);
        const nodeWidth = 10;

        allNodes.push({
          x: x - nodeWidth / 2,
          y: y0,
          width: nodeWidth,
          height: y1 - y0,
          locationId: location.id,
          locationLabel: location.label,
          season: location.season,
          value: location.avgScreenTimeShare,
        });
      });
    });

    return allNodes;
  });

  // Ribbon color
  const ribbonColor = '#12020A';

  // Function to get season color
  const getSeasonColor = (seasonNum) => {
    const season = seasons.find((s) => s.seasonNum === seasonNum);
    return season?.color || '#CCC';
  };

  // Minimum bar height to show icon by default
  const minBarHeightForIcon = 50;

  // Get icons for left side (Season 1)
  const leftIcons = $derived.by(() => {
    const season1Data = preparedData.find((d) => d.season === 1);
    if (!season1Data) return [];

    return season1Data.locations.map((location) => {
      const y0 = yScale(location.y0);
      const y1 = yScale(location.y1);
      const centerY = (y0 + y1) / 2;
      const barHeight = y1 - y0;

      return {
        id: location.id,
        label: location.label,
        x: -(iconSize + iconGap), // Position icon to the left with 16px gap
        y: centerY - iconSize / 2,
        iconPath: getLocationIconPath(location.id),
        isVisibleByDefault: barHeight >= minBarHeightForIcon,
      };
    });
  });

  // Get icons for right side (Season 9)
  const rightIcons = $derived.by(() => {
    const season9Data = preparedData.find((d) => d.season === 9);
    if (!season9Data) return [];

    return season9Data.locations.map((location) => {
      const y0 = yScale(location.y0);
      const y1 = yScale(location.y1);
      const centerY = (y0 + y1) / 2;
      const barHeight = y1 - y0;

      return {
        id: location.id,
        label: location.label,
        x: chartWidth + iconGap, // Position icon to the right with 16px gap
        y: centerY - iconSize / 2,
        iconPath: getLocationIconPath(location.id),
        isVisibleByDefault: barHeight >= minBarHeightForIcon,
      };
    });
  });

  let hoveredLocation = $state(null);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="pb-24">
  <div class="container" bind:clientWidth={containerWidth}>
    <!-- Header -->
    <div bind:clientHeight={headerHeight} class="mb-8">
      <h3>Locations screen-time across seasons</h3>
      <div style="max-width: 900px;">
        This alluvial diagram shows how the screen time share for each location changes across the
        nine seasons of Seinfeld. The width of each band represents the proportion of time spent in
        that location.
      </div>
    </div>

    <!-- Chart -->
    <div class="relative" style="overflow: visible;">
      <!-- Top-right description -->
      <div
        class="absolute top-[-30px] right-[56px] leading-4 small accent"
        style="max-width: 200px;"
      >
        The heigt of the bands at each season represents the average screen-time share
      </div>

      <svg
        width={availableWidth}
        height={chartHeight + margin.top + margin.bottom}
        style="display: block; max-width: 100%;"
      >
        <defs>
          <!-- Circular clip path for icons -->
          <clipPath id="circleClip" clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.5" />
          </clipPath>
        </defs>

        <g transform="translate({margin.left}, {margin.top})">
          <!-- Vertical axis label -->
          <g
            class="axis-label transition-opacity duration-200 ease-out"
            opacity={hoveredLocation === null ? 1 : 0}
          >
            <text
              x={134}
              y={chartHeight / 2 - 9}
              transform="rotate(-90, {0}, {chartHeight / 2})"
              text-anchor="middle"
              class="small accent"
            >
              Rank of average screen-time share
            </text>
            <!-- Downward arrow -->
            <g transform="translate(-16, 238)">
              <ArrowDown />
            </g>
          </g>

          <!-- Ribbons -->
          <g class="ribbons">
            {#each ribbons as ribbon}
              <path
                d={ribbon.path}
                fill={ribbonColor}
                opacity={hoveredLocation === null || hoveredLocation === ribbon.locationId
                  ? 0.6
                  : 0.15}
                stroke="none"
                class="transition-opacity duration-200 ease-out"
                role="presentation"
                onmouseenter={() => (hoveredLocation = ribbon.locationId)}
                onmouseleave={() => (hoveredLocation = null)}
              />
            {/each}
          </g>

          <!-- Nodes -->
          <g class="nodes">
            {#each nodes as node}
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                fill={getSeasonColor(node.season)}
                opacity={hoveredLocation === null || hoveredLocation === node.locationId ? 1 : 0.3}
                class="transition-opacity duration-300"
                role="presentation"
                onmouseenter={() => (hoveredLocation = node.locationId)}
                onmouseleave={() => (hoveredLocation = null)}
              />
            {/each}
          </g>

          <!-- Season labels -->
          <g class="season-labels">
            {#each Array.from({ length: 9 }, (_, i) => i + 1) as season}
              <text x={xScale(season)} y={chartHeight + 30} text-anchor="middle" class="text-sm">
                season {season}
              </text>
            {/each}
          </g>

          <!-- Left icons (Season 1) -->
          <g class="left-icons">
            {#each leftIcons as icon}
              <image
                href={icon.iconPath}
                x={icon.x}
                y={icon.y}
                width={iconSize}
                height={iconSize}
                clip-path="url(#circleClip)"
                opacity={icon.isVisibleByDefault
                  ? hoveredLocation === null || hoveredLocation === icon.id
                    ? 1
                    : 0.3
                  : hoveredLocation === icon.id
                    ? 1
                    : 0}
                class="transition-opacity duration-300"
                style="cursor: pointer;"
                role="presentation"
                onmouseenter={() => (hoveredLocation = icon.id)}
                onmouseleave={() => (hoveredLocation = null)}
              />
            {/each}
          </g>

          <!-- Right icons (Season 9) -->
          <g class="right-icons">
            {#each rightIcons as icon}
              <image
                href={icon.iconPath}
                x={icon.x}
                y={icon.y}
                width={iconSize}
                height={iconSize}
                clip-path="url(#circleClip)"
                opacity={icon.isVisibleByDefault
                  ? hoveredLocation === null || hoveredLocation === icon.id
                    ? 1
                    : 0.3
                  : hoveredLocation === icon.id
                    ? 1
                    : 0}
                class="transition-opacity duration-300"
                style="cursor: pointer;"
                role="presentation"
                onmouseenter={() => (hoveredLocation = icon.id)}
                onmouseleave={() => (hoveredLocation = null)}
              />
            {/each}
          </g>

          <!-- Hover labels showing percentages -->
          <g
            class="hover-labels transition-opacity duration-200 ease-out"
            opacity={hoveredLocation !== null ? 1 : 0}
          >
            {#if hoveredLocation !== null}
              {#each nodes.filter((n) => n.locationId === hoveredLocation) as node}
                {@const percentage = Math.round(node.value * 100)}
                {@const labelX = xScale(node.season)}
                {@const labelY = node.y + node.height / 2}
                {@const circleRadius = 15}
                <circle
                  cx={labelX}
                  cy={labelY}
                  r={circleRadius}
                  fill="#F9F5F7"
                  stroke="#12020A"
                  opacity="0.95"
                />
                <text
                  x={labelX}
                  y={labelY}
                  dy="1px"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="text-xs font-semibold"
                  fill="#12020A"
                >
                  {percentage}%
                </text>
              {/each}
            {/if}
          </g>
        </g>
      </svg>
    </div>
  </div>
</div>
