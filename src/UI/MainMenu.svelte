<script>
  import { fade, fly } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import CloseIcon from '../icons/CloseIcon.svelte';
  import ArrowRight from '../icons/ArrowRight.svelte';
  import { pendingScrollAnchor, isScrollLoading } from '../stores/scrollAnchor';
  import { lazyLoadAll } from '../stores/lazyLoadTrigger';

  let { toggleMenu } = $props();

  const menuLinks = [
    { label: 'Prologue', anchor: 'intro' },
    { label: 'The Show', anchor: 'title-screen' },
    { label: 'Episode Catalogue', anchor: 'bridge-to-catalog' },
    { label: 'Lead Characters', anchor: 'lead-chars' },
    { label: 'Supporting Characters', anchor: 'supporting-chars' },
    { label: 'Locations', anchor: 'locations' },
    { label: 'Combinations & Findings', anchor: 'laughs-exploration' },
    { label: 'Credits & Methodology', anchor: 'methodology' },
  ];

  let menuContainerRef = $state(null);
  let previouslyFocused;

  onMount(() => {
    previouslyFocused = document.activeElement;
    const firstFocusable = menuContainerRef?.querySelector('a, button, [tabindex="0"]');
    firstFocusable?.focus();
  });

  onDestroy(() => {
    previouslyFocused?.focus();
  });

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      toggleMenu();
      return;
    }
    if (e.key === 'Tab' && menuContainerRef) {
      const focusable = Array.from(
        menuContainerRef.querySelectorAll('a, button, [tabindex="0"]')
      ).filter((el) => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  in:fade={{ duration: 250 }}
  out:fade={{ duration: 250 }}
  class="backdrop"
  style="z-index: 3000;"
  onclick={toggleMenu}
  role="presentation"
>
  <div
    bind:this={menuContainerRef}
    in:fly={{ duration: 250, x: 500 }}
    out:fly={{ duration: 250, x: 500 }}
    class="menu-container h-[100dvh]"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation menu"
    onclick={(e) => e.stopPropagation()}
  >
    <div class="h-[100dvh] flex flex-col justify-center px-12 py-8">
      <ul id="menu-links">
        {#each menuLinks as menuItem}
          <li class="py-5">
            <a
              class="no-underline text-white uppercase flex justify-between items-center font-normal md:text-[20px] tracking-wide"
              href="#{menuItem.anchor}"
              aria-label="Go to {menuItem.label}"
              onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu();
                pendingScrollAnchor.set(menuItem.anchor);
                // If element not yet in DOM (lazy loading), show loader and trigger load
                if (!document.getElementById(menuItem.anchor)) {
                  isScrollLoading.set(true);
                  lazyLoadAll.set(true);
                  const sentinel = document.getElementById('lazy-load-sentinel');
                  if (sentinel) sentinel.scrollIntoView({ behavior: 'instant' });
                }
              }}
            >
              {menuItem.label}
              <span class="menu-arrow-right"><ArrowRight /></span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
    <button
      class="menu-close-button"
      aria-label="Close navigation menu"
      onclick={(e) => {
        e.stopPropagation();
        toggleMenu();
      }}
    >
      <CloseIcon color="#E71D80" />
    </button>
  </div>
</div>

<style>
  .menu-container {
    position: absolute;
    top: 0;
    right: 0px;
    z-index: 100;
    width: 450px;
    max-width: 100vw;
    background-color: #12020a;
    color: #e71d80;
  }
  .menu-close-button {
    position: absolute;
    top: 24px;
    right: 24px;
  }
  #menu-links li {
    border-bottom: 1px solid #f9f5f7;
  }
  #menu-links li:first-of-type {
    border-top: 1px solid #f9f5f7;
  }
  #menu-links .menu-arrow-right {
    transform: translateX(-20px);
    opacity: 0;
    transition: all 200ms ease-out;
  }
  #menu-links a:hover .menu-arrow-right {
    transform: translateX(0px);
    opacity: 1;
  }
</style>
