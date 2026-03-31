<script>
  import { fade } from 'svelte/transition';
</script>

<div class="loader-backdrop" transition:fade={{ duration: 200 }}>
  <div class="spinner"></div>
</div>

<style>
  .loader-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9000;
    background-color: #12020a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(231, 29, 128, 0.2);
    border-top-color: #e71d80;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
