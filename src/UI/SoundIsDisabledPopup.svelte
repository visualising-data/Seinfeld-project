<script>
  import { fly } from 'svelte/transition';

  import { soundIsAuth } from '../stores/soundAuthStore';
  import AudioOff from '../icons/AudioOff.svelte';

  let { showSoundDisabledPopup = $bindable() } = $props();

  const enableSound = () => {
    $soundIsAuth = true;
    showSoundDisabledPopup = false;
  };
  const handleClose = () => (showSoundDisabledPopup = false);
</script>

<div
  class="px-8 py-8 rounded-2xl bg-white text-black shadow-lg"
  style="min-width: 400px;"
  in:fly={{ duration: 500, y: 30 }}
  out:fly={{ duration: 500, y: 30 }}
>
  <div class="flex items-center gap-2 mb-4"><AudioOff color="#12020A" /> Sound is disabled.</div>
  <div class="mt-8 flex leading-5 md:ml-4 md:mt-0 md:justify-end">
    <button class="btn btn-secondary" onclick={handleClose}>Close</button>
    <button class="btn btn-primary ml-4" onclick={enableSound}>Enable sound</button>
  </div>
</div>
