import type { ComponentPropsWithRef, RefObject } from 'react';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

import './bubble.css';

interface MessageBoardProps extends ComponentPropsWithRef<'div'> {
  messages: Message[];
  bubbleRefs: RefObject<Map<string, HTMLDivElement>>;
}

export function MessageBoard({
  messages,
  bubbleRefs,
  ref,
  className,
  ...props
}: MessageBoardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        className,
        'relative h-screen w-screen overflow-hidden bg-[url(/message-board-background.png)] bg-cover bg-top-right bg-no-repeat',
      )}
      {...props}
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
          className={cn('bubble', import.meta.env.DEV && 'bubble-debug')}
        >
          {message.body}
        </div>
      ))}
    </div>
  );
}
