import type { Message } from '@/lib/types';
import Matter from 'matter-js';
import { useCallback, useEffect, useRef, type RefObject } from 'react';

export interface PhysicsBubble {
  id: string;
  el: HTMLElement;
  body: Matter.Body;
  width: number;
  height: number;
}

export interface UsePhysicsBubblesAPI {
  removeBubbleById: (id: string) => void;
  removeBubbleByElement: (el: HTMLElement) => void;
  debugWorld: () => void;
  getBodyCount: () => number;
}

/**
 * This hook creates Matter bodies for DOM elements that appear in `bubbleRefs`.
 * It tags and keeps `itemsRef` as the single source of truth for physics items.
 *
 * Use `removeBubbleById(id)` to immediately remove the physics body (call before
 * removing message from state).
 *
 * @param containerRef - ref to the parent container element (for bounds)
 * @param bubbleRefs - ref to a Map<string, HTMLElement> mapping message._id -> element
 * @param messages - current messages array (used to detect new nodes)
 */
export function usePhysicsBubbles(
  containerRef: RefObject<HTMLElement | null>,
  bubbleRefs: RefObject<Map<string, HTMLElement>>,
  messages: Message[],
): UsePhysicsBubblesAPI {
  const engineRef = useRef<Matter.Engine | null>(null);
  const itemsRef = useRef<PhysicsBubble[]>([]);
  const frameRef = useRef<number>(0);
  const wallsRef = useRef<Matter.Body[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const timeRef = useRef<number>(0);

  // ------------------------------------------------------
  // Helpers
  // ------------------------------------------------------
  const noise = (t: number) => Math.sin(t * 0.7) * Math.cos(t * 1.3);

  function safeRemoveBody(engine: Matter.Engine, body: Matter.Body) {
    try {
      // Composite.remove is more robust for nested composites
      Matter.Composite.remove(engine.world, body, true);
    } catch (err) {
      console.warn(
        'Composite.remove failed, falling back to World.remove',
        err,
      );
      try {
        Matter.World.remove(engine.world, body);
      } catch (err2) {
        console.error('World.remove also failed for body:', body, err2);
      }
    }
  }

  const debugWorld = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      console.warn('[usePhysicsBubbles] debugWorld: engine not initialized');
      return;
    }

    const world = engine.world;
    console.group('[Matter Debug] World snapshot');
    console.log('Bodies count:', world.bodies.length);
    world.bodies.forEach((b, i) => {
      console.log(i, {
        id: b.id,
        label: b.label,
        isStatic: b.isStatic,
        position: b.position,
        bounds: b.bounds,
      });
    });

    console.log('Constraints:', world.constraints.length);
    console.log('Composites:', world.composites.length);
    console.groupEnd();
  }, []);

  const getBodyCount = useCallback(() => {
    return engineRef.current ? engineRef.current.world.bodies.length : 0;
  }, []);

  // ------------------------------------------------------
  // INITIAL SETUP: Create engine + first wave of bubbles
  // ------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    // Grab stable list of DOM elements currently present in bubbleRefs
    const map = bubbleRefs.current;
    const initialEls: { id: string; el: HTMLElement }[] = [];
    map.forEach((el, id) => {
      if (el) {
        initialEls.push({ id, el });
      }
    });

    if (initialEls.length === 0) {
      // no DOM nodes yet; still create engine so future adds are fine
      const engineLazy = Matter.Engine.create();
      engineLazy.gravity.y = 0;
      engineRef.current = engineLazy;
    } else {
      // Create engine
      const engine = Matter.Engine.create();
      engine.gravity.y = 0;
      engineRef.current = engine;

      // Build initial physics items
      const items: PhysicsBubble[] = initialEls.map(({ id, el }) => {
        // Measure
        const width = el.offsetWidth;
        const height = el.offsetHeight;

        // random start position
        const startX =
          Math.random() * (container.clientWidth - width) + width / 2;
        const startY =
          Math.random() * (container.clientHeight - height) + height / 2;

        // Apply first transform
        el.style.setProperty('--tx', `${startX - width / 2}px`);
        el.style.setProperty('--ty', `${startY - height / 2}px`);

        const body = Matter.Bodies.rectangle(startX, startY, width, height, {
          restitution: 0.9,
          friction: 0,
          frictionAir: 0.02,
          inertia: Infinity,
          inverseInertia: 0,
          chamfer: { radius: 24 },
        });

        // Add a stable label to help debugging
        body.label = `bubble:${id}`;

        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4,
        });

        return { id, el, body, width, height };
      });

      itemsRef.current = items;
      Matter.World.add(
        engine.world,
        items.map((i) => i.body),
      );
    }

    // Build walls helper
    const buildWalls = () => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }

      const w = container.clientWidth;
      const h = container.clientHeight;
      const t = 200;

      if (wallsRef.current.length > 0) {
        // remove previous walls safely
        try {
          Matter.World.remove(engine.world, wallsRef.current);
        } catch {
          // fallback to Composite
          wallsRef.current.forEach((wb) => safeRemoveBody(engine, wb));
        }
      }

      const walls = [
        Matter.Bodies.rectangle(w / 2, -t / 2, w, t, {
          isStatic: true,
          label: 'wall-top',
        }),
        Matter.Bodies.rectangle(w / 2, h + t / 2, w, t, {
          isStatic: true,
          label: 'wall-bottom',
        }),
        Matter.Bodies.rectangle(-t / 2, h / 2, t, h, {
          isStatic: true,
          label: 'wall-left',
        }),
        Matter.Bodies.rectangle(w + t / 2, h / 2, t, h, {
          isStatic: true,
          label: 'wall-right',
        }),
      ];

      wallsRef.current = walls;
      Matter.World.add(engine.world, walls);
    };

    buildWalls();

    // ResizeObserver to rebuild walls on container size change
    resizeObserverRef.current = new ResizeObserver(() => {
      buildWalls();
    });
    resizeObserverRef.current.observe(container);

    // Animation loop
    let frameCounter = 0;
    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);
      frameCounter++;

      const engine = engineRef.current;
      if (!engine) {
        return;
      }

      timeRef.current += 0.01;
      Matter.Engine.update(engine, 1000 / 60);

      // Sync DOM for all live items
      for (const item of itemsRef.current) {
        const { el, body, width, height } = item;

        // Ensure element is still in DOM
        if (!document.body.contains(el)) {
          // element removed outside of hook: schedule cleanup
          try {
            safeRemoveBody(engine, body);
          } catch {
            // do nothing
          }
          // remove from itemsRef
          const idx = itemsRef.current.indexOf(item);
          if (idx !== -1) {
            itemsRef.current.splice(idx, 1);
          }
          continue;
        }

        // Prevent rotation
        body.angle = 0;

        // Soft damping
        body.velocity.x *= 0.99;
        body.velocity.y *= 0.99;

        // Floaty drift
        const driftX = noise(timeRef.current + body.id) * 0.002;
        const driftY = noise(timeRef.current + body.id * 2) * 0.002;

        Matter.Body.applyForce(body, body.position, { x: driftX, y: driftY });

        // Gentle pull toward center to keep bubbles from clustering in corners
        const cx = container.clientWidth / 2;
        const cy = container.clientHeight / 2;
        const pullX = (cx - body.position.x) * 0.000002;
        const pullY = (cy - body.position.y) * 0.000002;

        Matter.Body.applyForce(body, body.position, { x: pullX, y: pullY });

        // Update DOM position
        const tx = body.position.x - width / 2;
        const ty = body.position.y - height / 2;
        el.style.setProperty('--tx', `${tx}px`);
        el.style.setProperty('--ty', `${ty}px`);

        el.style.setProperty('--w', `${width}px`);
        el.style.setProperty('--h', `${height}px`);
      }

      // Periodic integrity checks
      if (frameCounter % 60 === 0) {
        // quick validation + optional pruning
        validateBodyDomIntegrity();
        pruneOrphanBodies();
      }
    };

    loop();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserverRef.current?.disconnect();

      if (engineRef.current) {
        try {
          Matter.World.clear(engineRef.current.world, false);
          Matter.Engine.clear(engineRef.current);
        } catch (err) {
          console.log('Error cleaning Matter engine on unmount', err);
        }
      }

      itemsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------
  // DYNAMIC BUBBLE ADDING (triggered by messages change)
  // ------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const engine = engineRef.current;

    if (!container || !engine) {
      return;
    }

    // Gather current DOM elements from Map
    const map = bubbleRefs.current;
    const domEntries: { id: string; el: HTMLElement }[] = [];
    map.forEach((el, id) => {
      if (el) {
        domEntries.push({ id, el });
      }
    });

    const existingEls = new Set(itemsRef.current.map((item) => item.el));
    // const existingIds = new Set(itemsRef.current.map((item) => item.id));

    for (const { id, el } of domEntries) {
      if (existingEls.has(el)) {
        continue;
      }

      // Measure
      const width = el.offsetWidth;
      const height = el.offsetHeight;

      // spawn position
      const startX =
        Math.random() * (container.clientWidth - width) + width / 2;
      const startY =
        Math.random() * (container.clientHeight - height) + height / 2;

      el.style.setProperty('--tx', `${startX - width / 2}px`);
      el.style.setProperty('--ty', `${startY - height / 2}px`);

      const body = Matter.Bodies.rectangle(startX, startY, width, height, {
        restitution: 0.9,
        friction: 0,
        frictionAir: 0.02,
        inertia: Infinity,
        inverseInertia: 0,
      });

      body.label = `bubble:${id}`;
      Matter.World.add(engine.world, body);

      // Add to live list
      itemsRef.current.push({ id, el, body, width, height });

      // Initial velocity
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Expose remove by id callback so parent component (socket handler) can remove immediately
  const removeBubbleById = useCallback((id: string) => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    const idx = itemsRef.current.findIndex((item) => item.id === id);
    if (idx === -1) {
      console.warn('[removeBubbleById] No physics item for id:', id);
      return;
    }

    const item = itemsRef.current[idx];

    // safe remove
    safeRemoveBody(engine, item.body);

    // Remove from live list
    itemsRef.current.splice(idx, 1);

    // debug assertion
    if (engine.world.bodies.includes(item.body)) {
      console.error('[removeBubbleById] Failed to remove body:', id, item.body);
    } else {
      // optionally log
      // console.log('[removeBubbleById] Removed body:', id)
    }
  }, []);

  // Also expose remove by element as an alternative
  const removeBubbleByElement = useCallback((el: HTMLElement) => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    const idx = itemsRef.current.findIndex((item) => item.el === el);
    if (idx === -1) {
      console.warn('[removeBubbleByElement] No physics item for element:', el);
      return;
    }

    const item = itemsRef.current[idx];
    safeRemoveBody(engine, item.body);
    itemsRef.current.splice(idx, 1);
  }, []);

  function validateBodyDomIntegrity() {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    const worldBodies = engine.world.bodies.slice();
    const items = itemsRef.current;

    // 1. Body count vs items count
    if (worldBodies.length !== items.length + wallsRef.current.length) {
      console.warn(
        '[Matter Integrity] world.bodies.length:',
        worldBodies.length,
        'items:',
        items.length,
        'walls:',
        wallsRef.current.length,
      );
    }

    // 2. Each item should map to a body in the world
    for (const item of items) {
      if (!worldBodies.includes(item.body)) {
        console.error(
          "[Matter Integrity] Item's body not found in the world:",
          item.id,
          item.body,
        );
      }
      // element presence
      if (!item.el || !document.body.contains(item.el)) {
        console.error('[Matter Integrity] Item DOM missing for:', item.id);
      }
    }

    // 3. Orphan bodies (non-static bodies not referenced by itemsRef)
    const itemBodies = new Set(items.map((item) => item.body));
    for (const b of worldBodies) {
      if (b.isStatic) {
        continue;
      }
      if (!itemBodies.has(b)) {
        console.warn('[Matter Integrity] Orphan body detected:', b);
      }
    }
  }

  function pruneOrphanBodies() {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    const itemBodies = new Set(itemsRef.current.map((item) => item.body));
    const toRemove: Matter.Body[] = [];

    for (const b of engine.world.bodies) {
      if (b.isStatic) {
        continue;
      }
      if (!itemBodies.has(b)) {
        toRemove.push(b);
      }
    }

    if (toRemove.length === 0) {
      return;
    }

    for (const b of toRemove) {
      console.warn('[pruneOrphanBodies] Removing orphan body:', b);
      safeRemoveBody(engine, b);
    }
  }

  return { removeBubbleById, removeBubbleByElement, debugWorld, getBodyCount };
}
