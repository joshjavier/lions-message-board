import Matter from 'matter-js';
import { useEffect, useRef, type RefObject } from 'react';

export interface PhysicsBubble {
  el: HTMLElement;
  body: Matter.Body;
  width: number;
  height: number;
}

export function usePhysicsBubbles(
  containerRef: RefObject<HTMLElement | null>,
  bubbleRefs: RefObject<(HTMLElement | null)[]>,
  messages: string[],
) {
  const engineRef = useRef<Matter.Engine | null>(null);
  const itemsRef = useRef<PhysicsBubble[]>([]);
  const frameRef = useRef<number>(0);
  const wallsRef = useRef<Matter.Body[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const timeRef = useRef<number>(0);

  // ------------------------------------------------------
  // INITIAL SETUP: Create engine + first wave of bubbles
  // ------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const elements = bubbleRefs.current.filter((el) => el !== null);

    if (!container || elements.length === 0) {
      return;
    }

    // Create engine once
    const engine = Matter.Engine.create();
    engine.gravity.y = 0;
    engineRef.current = engine;

    // Measure and create physics bodies
    const items: PhysicsBubble[] = elements.map((el) => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;

      // random start position
      const startX =
        Math.random() * (container.clientWidth - width) + width / 2;
      const startY =
        Math.random() * (container.clientHeight - height) + height / 2;

      el.style.transform = `translate(${startX - width / 2}px, ${startY - height / 2}px)`;

      const body = Matter.Bodies.rectangle(startX, startY, width, height, {
        restitution: 0.9,
        frictionAir: 0.02,
        inertia: Infinity,
        inverseInertia: 0,
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
      });

      return { el, body, width, height };
    });

    itemsRef.current = items;
    Matter.World.add(
      engine.world,
      items.map((i) => i.body),
    );

    // Create walls
    const createWalls = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const t = 200;

      // Remove old walls from world
      if (wallsRef.current.length > 0 && engineRef.current) {
        Matter.World.remove(engineRef.current.world, wallsRef.current);
      }

      const walls = [
        Matter.Bodies.rectangle(w / 2, -t / 2, w, t, { isStatic: true }),
        Matter.Bodies.rectangle(w / 2, h + t / 2, w, t, { isStatic: true }),
        Matter.Bodies.rectangle(-t / 2, h / 2, t, h, { isStatic: true }),
        Matter.Bodies.rectangle(w + t / 2, h / 2, t, h, { isStatic: true }),
      ];

      wallsRef.current = walls;
      Matter.World.add(engine.world, walls);
    };

    createWalls();

    // Observe container size changes
    resizeObserverRef.current = new ResizeObserver(() => {
      createWalls();
    });
    resizeObserverRef.current.observe(container);

    // Simple noise function for floaty motion
    const noise = (t: number) => Math.sin(t * 0.7) * Math.cos(t * 1.3);

    // Animation loop
    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);

      if (!engineRef.current) {
        return;
      }
      timeRef.current += 0.01;

      Matter.Engine.update(engineRef.current, 1000 / 60);

      for (const item of itemsRef.current) {
        const { el, body, width, height } = item;

        // Prevent rotation
        body.angle = 0;

        // Gentle damping
        body.velocity.x *= 0.99;
        body.velocity.y *= 0.99;

        // Smooth drifting forces
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
        el.style.transform = `translate(${body.position.x - width / 2}px, ${body.position.y - height / 2}px)`;
      }
    };

    loop();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserverRef.current?.disconnect();

      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
      }

      itemsRef.current = [];
    };
  }, []);

  // ------------------------------------------------------
  // DYNAMIC BUBBLE ADDING (triggered by messages change)
  // ------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;

    if (!container || !engineRef.current) {
      return;
    }

    const engine = engineRef.current;

    const domEls = bubbleRefs.current.filter((el) => el !== null);
    const existingEls = new Set(itemsRef.current.map((item) => item.el));

    domEls.forEach((el) => {
      if (existingEls.has(el)) {
        return;
      }

      // New bubble found - measure and create body
      const width = el.offsetWidth;
      const height = el.offsetHeight;

      // spawn position
      const startX =
        Math.random() * (container.clientWidth - width) + width / 2;
      const startY =
        Math.random() * (container.clientHeight - height) + height / 2;

      el.style.transform = `translate(${startX - width / 2}px, ${startY - height / 2}px)`;

      const body = Matter.Bodies.rectangle(startX, startY, width, height, {
        restitution: 0.9,
        frictionAir: 0.02,
        inertia: Infinity,
        inverseInertia: 0,
      });

      Matter.World.add(engine.world, body);

      // Add to live list
      itemsRef.current.push({ el, body, width, height });

      // Initial velocity
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
      });
    });
  }, [messages]);
}
