<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { characters } from '$lib/data/characters';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { forceSimulation, forceCollide, forceManyBody, forceX, forceY } from 'd3-force';

  const supportingChars = characters.slice(4, characters.length - 1);

  let charPositions = $state(/** @type {{ top: number; left: number }[]} */ ([]));
  let iconsContainer = /** @type {HTMLDivElement} */ (/** @type {unknown} */ (null));

  onMount(() => {
    gsap.set('#supporting_chars_screen_3 .supporting-char', { translateY: 100, opacity: 0 });

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#supporting_chars_screen_3',
        start: 'top center',
      },
      onComplete: () => {
        gsap.utils.toArray('#supporting_chars_screen_3 .supporting-char').forEach((el) => {
          gsap.to(el, {
            y: -(Math.random() * 3 + 3), // 3–6px upward
            duration: 2.5 + Math.random() * 1.5, // 2.5–4s per half-cycle
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 2,
          });
        });
      },
    });
    tl3
      .to('#supporting_chars_screen_3 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 },
      })
      .to(
        '#supporting_chars_screen_3 .highlight',
        {
          webkitTextFillColor: 'transparent',
          backgroundPosition: '200% center',
          duration: 2,
          delay: 1,
          ease: 'power3.out',
        },
        '<-0.5',
      )
      .to(
        '#supporting_chars_screen_3 .supporting-char',
        {
          translateY: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          stagger: { each: 0.2, from: 'random' },
        },
        '<-0.5',
      );

    function computePositions() {
      const screenW = iconsContainer.clientWidth;
      const screenH = iconsContainer.clientHeight;
      const border = 30;
      const xMin = border + 37.5;
      const xMax = screenW - border - 37.5;
      const yMin = border + 37.5;
      const yMax = screenH - border - 67.5;

      const textCol = iconsContainer.querySelector('.supporting-chars-text-col');
      const screenRect = iconsContainer.getBoundingClientRect();
      const textRect = textCol.getBoundingClientRect();
      const textZone = {
        x1: textRect.left - screenRect.left - border,
        x2: textRect.right - screenRect.left + border,
        y1: textRect.top - screenRect.top - border,
        y2: textRect.bottom - screenRect.top + border,
      };

      // Disc centred in the available area (right of text zone)
      const cx = (textZone.x2 + screenW) / 2;
      const cy = screenH / 2;
      const discRadius = Math.min((screenW - textZone.x2) * 0.45, screenH * 0.38);

      // Measure each element's real rendered dimensions for accurate collision
      const iconEls = Array.from(iconsContainer.querySelectorAll('.supporting-char'));

      // Seed nodes uniformly within the disc using polar coordinates
      const nodes = supportingChars.map((_, i) => {
        const el = /** @type {HTMLElement | undefined} */ (iconEls[i]);
        const w = el ? el.offsetWidth : 75;
        const h = el ? el.offsetHeight : 100;
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.sqrt(Math.random()) * discRadius;
        return {
          x: Math.max(xMin, Math.min(cx + r * Math.cos(angle), xMax)),
          y: Math.max(yMin, Math.min(cy + r * Math.sin(angle), yMax)),
          collisionR: Math.max(w, h) / 2 + 20,
          w,
          h,
        };
      });

      // Custom force: push nodes back inside the disc if they drift outside
      function forceBoundCircle(centerX, centerY, r) {
        /** @type {any[]} */ let simNodes;
        /** @param {number} alpha */
        function force(alpha) {
          for (const node of simNodes) {
            const dx = node.x - centerX;
            const dy = node.y - centerY;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > r) {
              const k = ((d - r) / d) * alpha * 2;
              node.vx -= dx * k;
              node.vy -= dy * k;
            }
          }
        }
        force.initialize = (/** @type {any[]} */ n) => {
          simNodes = n;
        };
        return force;
      }

      forceSimulation(nodes)
        .force('collide', forceCollide(/** @type {any} */ ((d) => d.collisionR)).strength(1).iterations(4))
        .force('charge', forceManyBody().strength(-5))
        .force('x', forceX(cx).strength(0.08))
        .force('y', forceY(cy).strength(0.08))
        .force('bound', forceBoundCircle(cx, cy, discRadius))
        .stop()
        .tick(400);

      charPositions = nodes.map((node) => ({
        top: Math.max(border, Math.min(node.y - node.h / 2, screenH - node.h - border)),
        left: Math.max(border, Math.min(node.x - node.w / 2, screenW - node.w - border)),
      }));
    }

    computePositions();

    let rafId = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(computePositions);
    });
    observer.observe(iconsContainer);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  });

  const handleIconEnter = (/** @type {number} */ index) => {
    const wrappers = Array.from(iconsContainer.querySelectorAll('.icon-wrapper'));
    const chars = Array.from(iconsContainer.querySelectorAll('.supporting-char'));

    // Scale up the hovered icon
    gsap.to(chars[index], { scale: 1.3, duration: 0.3, ease: 'back.out(1.7)' });

    // Measure the hovered icon's centre in viewport coordinates
    const hoveredRect = wrappers[index].getBoundingClientRect();
    const hoveredCx = hoveredRect.left + hoveredRect.width / 2;
    const hoveredCy = hoveredRect.top + hoveredRect.height / 2;

    // Push nearby wrappers away
    wrappers.forEach((wrapper, i) => {
      if (i === index) return;
      const rect = wrapper.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - hoveredCx;
      const dy = rect.top + rect.height / 2 - hoveredCy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 220;
      if (dist < maxDist) {
        const force = Math.pow((maxDist - dist) / maxDist, 1.5) * 35;
        gsap.to(wrapper, {
          x: (dx / dist) * force,
          y: (dy / dist) * force,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    });
  };

  const handleIconLeave = (/** @type {number} */ index) => {
    const wrappers = Array.from(iconsContainer.querySelectorAll('.icon-wrapper'));
    const chars = Array.from(iconsContainer.querySelectorAll('.supporting-char'));

    // Scale the hovered icon back
    gsap.to(chars[index], { scale: 1, duration: 0.4, ease: 'power2.inOut' });

    // Spring all wrappers back to their original positions
    wrappers.forEach((wrapper, i) => {
      if (i === index) return;
      gsap.to(wrapper, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  };
</script>

<div id="supporting_chars_screen_3" class="md:h-[100dvh] w-screen py-60 md:py-0 relative" bind:this={iconsContainer}>
  <div class="container">
    <div class="grid grid-cols-12 md:gap-20">
      <div class="supporting-chars-text-col col-span-12 md:col-span-7 md:h-[100dvh] md:flex md:flex-col md:justify-center">
        <p>
          The ultimate decision was to create categories for the four respective families of the
          lead characters, as well as groupings for acquaintances - specifically, love interests,
          friends, neighbours, colleagues - and then a final 'other persons' group to sweep up the
          growing list of transient characters.
        </p>
        <p>
          When classifying supporting characters, it was <span class="highlight"
            >their central purpose in that episode</span
          > that informed their grouping, e.g. a friend of Elaine's who dates George would be considered
          a love interest, rather than a friend. Some supporting characters were therefore alternated
          into different groupings across the show (e.g. a former love interest may shift to become
          a friend, and vice-versa).
        </p>
        <div class="md:hidden flex flex-wrap justify-center gap-4 mt-10">
          {#each supportingChars as char}
            <div class="flex flex-col items-center">
              <div
                class="character rounded-full bg-contain bg-center"
                style="background-image: url('{getCharacterImagePath(char.id)}'); width: 60px; height: 60px;"
              ></div>
              <div class="mid pt-1 text-center text-sm">{char.label}</div>
            </div>
          {/each}
        </div>
      </div>
      <div class="col-span-12 md:col-span-4">
        {#each supportingChars as char, i}
          <div
            class="icon-wrapper hidden md:block md:absolute cursor-pointer"
            style="top: {charPositions[i]?.top ?? 0}px; left: {charPositions[i]?.left ?? 0}px;"
            role="button"
            tabindex="0"
            onmouseenter={() => handleIconEnter(i)}
            onmouseleave={() => handleIconLeave(i)}
          >
            <div class="supporting-char flex flex-col items-center">
              <div
                class="character rounded-full bg-contain bg-center"
                style="background-image: url('{getCharacterImagePath(char.id)}'); width: 75px; height: 75px;"
              ></div>
              <div class="mid pt-2 text-center">{char.label}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
