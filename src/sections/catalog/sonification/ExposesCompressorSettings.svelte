<script>
  let { 
    threshold = $bindable(), 
    ratio = $bindable() ,
    attack = $bindable() ,
    release = $bindable() ,
    updateThreshold = $bindable(),
    updateRatio = $bindable(),
    updateAttack = $bindable(),
    updateRelease = $bindable(),
  } = $props()
</script>

<div class="controls p-4 mt-4 small flex gap-8" style="background: #DDDBDC; max-width: 1244px;">
		<label class="flex items-center gap-2">
			Threshold: <span class="number">{threshold}</span> dB
			<input type="range" min="-60" max="0" step="1" bind:value={threshold} 
        onchange={(e) => updateThreshold(e?.target?.value)} />
		</label>

		<label class="flex items-center gap-2">
			Ratio: <span class="number">{ratio}</span>
			<input type="range" min="1" max="20" step="1" bind:value={ratio} 
      onchange={(e) => updateRatio(e?.target?.value)} />
		</label>

		<label class="flex items-center gap-2">
			Attack: <span class="number">{attack}</span>s
			<input type="range" min="0" max="1" step="0.001" bind:value={attack} 
      onchange={(e) => updateAttack(e?.target?.value)} />
		</label>

		<label class="flex items-center gap-2">
			Release: <span class="number">{release}</span>s
			<input type="range" min="0" max="1" step="0.01" bind:value={release} 
      onchange={(e) => updateRelease(e?.target?.value)} />
		</label>
	</div>