import { usePhysicsBubbles } from '@/hooks/use-physics-bubbles';
import { socket } from '@/lib/socket';
import type { Message } from '@/lib/types';
import { useEffect, useRef } from 'react';

interface BubbleWorldProps {
  messages: Message[];
  removeFromState: (id: string) => void;
}

export function BubbleWorld({ messages, removeFromState }: BubbleWorldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Pass all the DOM elments to physics hook
  const { removeBubbleById } = usePhysicsBubbles(
    containerRef,
    bubbleRefs,
    messages,
  );

  const onMessageExpired = ({ _id }: { _id: string }) => {
    removeBubbleById(_id);
    removeFromState(_id);
  };

  useEffect(() => {
    socket.on('message-expired', onMessageExpired);

    return () => {
      socket.off('message-expired', onMessageExpired);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
    >
      {messages.map((msg, i) => (
        <div
          key={msg._id}
          data-id={msg._id}
          ref={(el) => {
            bubbleRefs.current[i] = el;
          }}
          className="pointer-events-none absolute max-w-80 rounded-[20] border-[3px] border-[#7da0ff] bg-white p-4 text-[16px] leading-[1.4] text-[#345] shadow-[0_4px_12px_rgba(0,0,0,0.12)] will-change-transform select-none"
        >
          {i + ' ' + msg.body}
        </div>
      ))}
    </div>
  );
}
