<script>
  import UpDownCarets from '$lib/assets/UpDownCarets.svg';

  let { options, value = $bindable(), prefix, label } = $props();
</script>

<div class="dropdown">
  <select bind:value aria-label={label} style="background-image: url({UpDownCarets});">
    {#each options as option}
      <option value={option}>{prefix}{option}</option>
    {/each}
  </select>
</div>

<style>
  .dropdown select {
    appearance: none;
    outline: none;
    min-width: 74px;
    height: 38px;
    padding: 0px 8px;
    font-size: 1.2rem;
    line-height: 20px;
    font-weight: 600;
    color: #f9f5f7;
    background-color: transparent;
    background-repeat: no-repeat;
    background-size: auto 18px;
    background-position: right 4px center;
    border: 2px solid #f9f5f7;
    border-radius: 8px;
  }

  @media screen and (min-width: 1024px) {
    .dropdown select {
      min-width: 100px;
      height: 50px;
      font-size: 1.625rem;
      background-size: auto 27px;
      border-width: 3px;
    }
  }
</style>
