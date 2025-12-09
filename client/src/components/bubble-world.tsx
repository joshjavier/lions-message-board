import { usePhysicsBubbles } from '@/hooks/use-physics-bubbles';
import { socket } from '@/lib/socket';
import type { Message } from '@/lib/types';
import { useEffect, useRef } from 'react';
import { DebugPanel } from './debug-panel';

import './bubble.css';

interface BubbleWorldProps {
  messages: Message[];
  removeFromState: (id: string) => void;
}

export function BubbleWorld({ messages, removeFromState }: BubbleWorldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRefs = useRef(new Map<string, HTMLDivElement>());

  const physics = usePhysicsBubbles(containerRef, bubbleRefs, messages);

  const onMessageExpired = ({ _id }: { _id: string }) => {
    const el = bubbleRefs.current.get(_id);
    if (el) {
      // freeze physics transform
      const computed = getComputedStyle(el).transform;
      el.style.transform = computed;

      // animate exit
      el.classList.add('exit');

      // remove after animation
      setTimeout(() => {
        physics.removeBubbleById(_id);
        removeFromState(_id);
      }, 250);
    }
  };

  useEffect(() => {
    // after render, trigger CSS enter animation
    for (const message of messages) {
      const el = bubbleRefs.current.get(message._id);
      if (el) {
        requestAnimationFrame(() => {
          el.classList.add('enter-active');
        });
      }
    }
  }, [messages]);

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
    <>
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
            className="bubble bubble-debug"
          >
            {message.body}
          </div>
        ))}
      </div>

      <DebugPanel physics={physics} />
    </>
  );
}
