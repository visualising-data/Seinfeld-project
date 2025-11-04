<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';

  let coffeeWidth = $state() as number
  let couchWidth = $state() as number

  onMount(() => {
    const tlCoffee = gsap.timeline({
			scrollTrigger: {
				trigger: '#warning .coffee-container',
				start: 'top center',
        end: 'bottom top',
				toggleActions: 'play reverse play reverse'
			}
		});
    const tlCouch = gsap.timeline({
			scrollTrigger: {
				trigger: '#warning .couch-container',
				start: 'top center',
        end: 'bottom top',
				toggleActions: 'play reverse play reverse'
			}
		});
    const tlTextEnd = gsap.timeline({
			scrollTrigger: {
				trigger: '#warning .text-end',
				start: 'top center',
        end: 'bottom top',
				toggleActions: 'play reverse play reverse'
			}
		});

    tlCoffee
      .from('#warning .coffee-bg-container', {
        y: 50,
        opacity: 0,
        duration: 1
      })
      .from('#warning .coffee-text', {
        y: 50,
        opacity: 0,
        duration: 1
      }, "-=0.7")
    tlCouch
      .from('#warning .couch-bg-container', {
        y: 50,
        opacity: 0,
        duration: 1
      })
      .from('#warning .couch-text', {
        y: 50,
        opacity: 0,
        duration: 1
      }, "-=0.7")
    tlTextEnd
      .from('#warning .text-end', {
        y: 50,
        opacity: 0,
        duration: 1
      })
  })
</script>

<div id="warning">
  <div class="container grid grid-cols-12 gap-4 py-80">
    <!-- Coffee cup -->
    <div class="col-span-12 col-start-2 coffee-container">
      <div class="grid grid-cols-12 gap-4 items-center">
        <div class="coffee-bg-container col-span-4 md:col-span-2">
          <div 
            bind:clientWidth={coffeeWidth} 
            class="bg-image bg-image-coffee float-and-rotate" 
            style="height: {1.58 * coffeeWidth}px;"></div>
        </div>
        <div class="col-span-8 md:col-span-7 pl-4 coffee-text">Grab a coffee</div>
      </div>
    </div>

    <!-- Couch -->
    <div class="col-span-12 pt-40 couch-container">
      <div class="grid grid-cols-12 gap-4 items-center">
        <div class="col-span-5 col-start-2 md:col-span-2 md:col-start-2 couch-text">Take a seat</div>
        <div class="couch-bg-container col-span-6 md:col-span-8">
          <div 
            bind:clientWidth={couchWidth} 
            class="bg-image bg-image-couch float" 
            style="height: {0.4 * couchWidth}px;"></div>
        </div>
      </div>
    </div>

    <div class="col-span-12 flex justify-center pt-40 text-end">We have a lot to get through!</div>
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