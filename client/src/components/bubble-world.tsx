import { usePhysicsBubbles } from '@/hooks/use-physics-bubbles';
import { useRef } from 'react';

interface BubbleWorldProps {
  messages: string[];
}

export function BubbleWorld({ messages }: BubbleWorldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Pass all the DOM elments to physics hook
  usePhysicsBubbles(containerRef, bubbleRefs, messages);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          ref={(el) => {
            bubbleRefs.current[i] = el;
          }}
          className="pointer-events-none absolute max-w-80 rounded-[20] border-[3px] border-[#7da0ff] bg-white p-4 text-[16px] leading-[1.4] text-[#345] shadow-[0_4px_12px_rgba(0,0,0,0.12)] will-change-transform select-none"
        >
          {msg}
        </div>
      ))}
    </div>
  );
}
