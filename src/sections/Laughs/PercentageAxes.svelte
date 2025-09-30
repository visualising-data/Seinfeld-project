<script lang="ts">
    let { barsHeight, width, secondLabel } : { barsHeight: number; width: number; secondLabel: string; } = $props();
</script>

<text
    class="number"
    x={0}
    y={20}
    text-anchor="middle"
    fill="#928D90"
>0</text>
<text
    class="number"
    x={width}
    y={20}
    text-anchor="middle"
    fill="#928D90"
>{secondLabel}</text>
<line
    x1={0}
    y1={25}
    x2={0}
    y2={barsHeight + 45}
    stroke="#928D90"
/>
<line
    x1={width}
    y1={25}
    x2={width}
    y2={barsHeight + 45}
    stroke="#928D90"
/>
<text
    class="number"
    x={0}
    y={barsHeight + 60}
    text-anchor="middle"
    fill="#928D90"
>0</text>
<text
    class="number"
    x={width}
    y={barsHeight + 60}
    text-anchor="middle"
    fill="#928D90"
>{secondLabel}</text>