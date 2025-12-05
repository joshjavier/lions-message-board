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
  const bubbleRefs = useRef(new Map<string, HTMLDivElement>());

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

  // useEffect(() => {
  //   const interval = setInterval(debugWorld, 2000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-[url(/message-board-background.png)] bg-cover bg-top-right bg-no-repeat"
    >
      {messages.map((message) => (
        <div
          key={message._id}
          data-id={message._id}
          ref={(el) => {
            if (el) {
              bubbleRefs.current.set(message._id, el);
            } else {
              bubbleRefs.current.delete(message._id);
            }
          }}
          className="pointer-events-none absolute max-w-80 rounded-3xl bg-[#eae3c9] px-5 py-3 text-lg/[1.35] font-medium text-[#1a1a1a] will-change-transform select-none"
        >
          {message.body}
        </div>
      ))}
    </div>
  );
}
