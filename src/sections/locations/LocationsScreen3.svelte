<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { locations } from '$lib/data/locations';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import { forceSimulation, forceCollide, forceManyBody, forceX, forceY } from 'd3-force';

  let locationPositions = $state(/** @type {{ top: number; left: number }[]} */ ([]));
  let iconsContainer = /** @type {HTMLDivElement} */ (/** @type {unknown} */ (null));

  onMount(() => {
    gsap.set('#locations_screen_3 .supporting-char', { translateY: 100, opacity: 0 });

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#locations_screen_3',
        start: 'top center',
      },
      onComplete: () => {
        gsap.utils.toArray('#locations_screen_3 .supporting-char').forEach((el) => {
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
      .to('#locations_screen_3 p', {
        translateY: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: { each: 0.3 },
      })
      .to(
        '#locations_screen_3 .highlight',
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
        '#locations_screen_3 .supporting-char',
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

      const textCol = iconsContainer.querySelector('.locations-text-col');
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
      const nodes = locations.map((_, i) => {
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
        .force(
          'collide',
          forceCollide(/** @type {any} */ ((d) => d.collisionR))
            .strength(1)
            .iterations(4),
        )
        .force('charge', forceManyBody().strength(-5))
        .force('x', forceX(cx).strength(0.08))
        .force('y', forceY(cy).strength(0.08))
        .force('bound', forceBoundCircle(cx, cy, discRadius))
        .stop()
        .tick(400);

      locationPositions = nodes.map((node) => ({
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

<div
  id="locations_screen_3"
  class="md:h-[100dvh] w-screen py-60 md:py-0 relative"
  bind:this={iconsContainer}
>
  <div class="container">
    <div class="grid grid-cols-12 md:gap-20">
      <div
        class="locations-text-col col-span-12 md:col-span-7 md:h-[100dvh] md:flex md:flex-col md:justify-center"
      >
        <p>
          As with the task of classifying characters, there were challenges with establishing a
          robust taxonomy for distinguishing different types of locations. You don't want too many
          distinct groups, but you want enough to capture the variety of different physical
          settings.
        </p>
        <p>
          The final list of distinct locations would include the <span class="location"
            >homes of the four leads</span
          >, as well as a further <span class="location">family home</span> to cover all and any
          family setting. The <span class="location">diner</span> was another common hangout
          location, but separate from other <span class="location">places of leisure</span>, which
          would include other restaurants as well as cinemas and indoor sports venues. The lead
          characters'
          <span class="location">workplace</span> would be a recurring setting, from Jerry doing his
          stand-up routines to George working at Yankee Stadium. Scenes set in various forms of
          <span class="location">transport</span>, like taxis, planes, or cars, were common, as were
          <span class="location">outside</span>
          locations like visits to the Hamptons or when disputes arose about street-side parking. An
          <span class="location">other location</span> grouping was added to classify the many other unique
          types of locations used infrequently, like hospitals or courtrooms.
        </p>
        <div class="md:hidden flex flex-wrap justify-center gap-4 mt-10">
          {#each locations as location}
            <div class="flex flex-col items-center">
              <div
                class="character rounded-full bg-contain bg-center"
                style="background-color: #12020A; background-image: url('{getLocationIconPath(
                  location.id,
                )}'); width: 60px; height: 60px;"
              ></div>
              <div class="mid pt-1 text-center text-sm">{location.label}</div>
            </div>
          {/each}
        </div>
      </div>
      <div class="col-span-12 md:col-span-4">
        {#each locations as location, i}
          <div
            class="icon-wrapper hidden md:block md:absolute cursor-pointer"
            style="top: {locationPositions[i]?.top ?? 0}px; left: {locationPositions[i]?.left ??
              0}px;"
            role="button"
            tabindex="0"
            onmouseenter={() => handleIconEnter(i)}
            onmouseleave={() => handleIconLeave(i)}
          >
            <div class="supporting-char flex flex-col items-center">
              <div
                class="character rounded-full bg-contain bg-center"
                style="background-color: #12020A; background-image: url('{getLocationIconPath(
                  location.id,
                )}'); width: 75px; height: 75px;"
              ></div>
              <div class="mid pt-2">{location.label}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .location {
    padding: 0 4px;
    font-weight: 600;
    color: #12020a;
    background-color: #f9f5f7;
    border-radius: 8px;
  }
</style>
