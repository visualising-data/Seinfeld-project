<script>
  import { characters } from "$lib/data/characters";
  
  let { activeCharacter, activeFilter } = $props()
</script>

<svg width="350" height="60">
  <!-- Episode -->
  <rect
    y={20}
    width={250}
    height={8}
    fill="#F9F5F7"
    stroke="#BEBABC"
  />

  <!-- Character on screen -->
  <rect
    x={140}
    y={20}
    width={60}
    height={8}
    fill={characters.find(char => char.id === activeCharacter)?.color}
    fill-opacity={activeFilter === 'screenTime' ? 1 : 0.3}
    rx={4}
    ry={4}
  />

  <!-- Character being funny -->
  <rect
    x={170}
    y={20}
    width={14}
    height={8}
    fill={characters.find(char => char.id === activeCharacter)?.color}
    fill-opacity={activeFilter === 'screenTime' ? 0 : 1}
    rx={4}
    ry={4}
  />

  <!-- Labels -->
  <g transform="translate(0, {38})">
    <text class="small accent" alignment-baseline="middle">Episode time</text>
    <g transform="translate({114}, {-3})">
    <path d="M30 3L25 0.113249V5.88675L30 3ZM0 3V3.5H25.5V3V2.5H0V3Z" fill="#E71D80"/>
    </g>
  </g>

  <g transform="translate({170}, {6})">
    <text class="small accent" alignment-baseline="middle">Character on screen</text>
    <g transform="translate({-19}, {-3})">
      <path d="M16.5 3.11761L11.5804 0.0957994L11.4233 5.86716L16.5 3.11761ZM1 14H1.5C1.5 10.6563 2.36843 8.149 4.0684 6.42703C5.77177 4.70163 8.38404 3.68937 12.0277 3.49436L12.001 2.99507L11.9742 2.49579C8.1835 2.69867 5.29528 3.76089 3.35677 5.72448C1.41486 7.69151 0.5 10.4877 0.5 14H1Z" fill="#E71D80"/>
    </g>
  </g>

  {#if activeFilter === 'causesLaughs'}
    <g transform="translate({195}, {44})">
      <text class="small accent" alignment-baseline="middle">Character being funny</text>
      <g transform="translate({-19}, {-12})">
        <path d="M16.5 10.8824L11.5804 13.9042L11.4233 8.13284L16.5 10.8824ZM1 0H1.5C1.5 3.34372 2.36843 5.851 4.0684 7.57297C5.77177 9.29837 8.38404 10.3106 12.0277 10.5056L12.001 11.0049L11.9742 11.5042C8.1835 11.3013 5.29528 10.2391 3.35677 8.27552C1.41486 6.30849 0.5 3.51225 0.5 0H1Z" fill="#E71D80"/>
      </g>
    </g>
  {/if}
</svg>