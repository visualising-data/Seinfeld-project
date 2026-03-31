<script>
  let { headerHeight = $bindable() } = $props();
</script>

<div class="mb-4 md:mb-8" bind:clientHeight={headerHeight}>
  <h3>Screen time vs laughter rate</h3>
  <div class="hidden md:block" style="max-width: 900px;">Intro goes here...</div>
</div>
