<script lang="ts">
  // import { onMount } from 'svelte';
  // import { gsap } from 'gsap/dist/gsap';

  let coffeeWidth = $state() as number
  let couchWidth = $state() as number

  // onMount(() => {
  //   const tl = gsap.timeline({
	// 		scrollTrigger: {
	// 			trigger: '#prologue-end',
	// 			start: 'top top',
  //       end: 'bottom top',
	// 			toggleActions: 'play reverse play reverse'
	// 		}
	// 	});

  //   tl.to('#prologue-end .highlight', {
  //       webkitTextFillColor: 'transparent',
  //       backgroundPosition: '200% center',
  //       duration: 2,
  //       delay: 1,
  //       ease: 'power3.out'
  //   })
  // })
</script>

<div id="warning">
  <div class="container grid grid-cols-12 gap-4 py-80">
    <!-- Coffee cup -->
    <div class="col-span-12 col-start-2">
      <div class="grid grid-cols-12 gap-4 items-center">
        <div 
          bind:clientWidth={coffeeWidth} 
          class="col-span-4 md:col-span-2 bg-image bg-image-coffee float-and-rotate" 
          style="height: {1.58 * coffeeWidth}px;"></div>
        <div class="col-span-8 md:col-span-7 pl-4">Grab a coffee</div>
      </div>
    </div>

    <!-- Couch -->
    <div class="col-span-12 pt-40">
      <div class="grid grid-cols-12 gap-4 items-center">
        <div class="col-span-5 col-start-2 md:col-span-2 md:col-start-2">Take a seat</div>
        <div 
          bind:clientWidth={couchWidth} 
          class="col-span-6 md:col-span-8 bg-image bg-image-couch float" 
          style="height: {0.4 * couchWidth}px;"></div>
      </div>
    </div>

    <div class="col-span-12 flex justify-center pt-40">We have a lot to get through!</div>
  </div>
</div>

<style>
  .bg-image {
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center;
  }
  .bg-image-coffee {
    transform: rotate(30deg);
    background-image: url("https://amdufour.github.io/hosted-data/apis/illustrations/coffee_cup.png");
  }
  .bg-image-couch {
    background-image: url("https://amdufour.github.io/hosted-data/apis/illustrations/couch.png");
  }
</style>