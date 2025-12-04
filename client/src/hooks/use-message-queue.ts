// import { fetchActiveMessages } from '@/lib/api-client';
import type { Message } from '@/lib/types';
import { useCallback, useState } from 'react';

// Max messages shown at once (client-side)
const MAX_VISIBLE = 10;

export function useMessageQueue(initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Add a message to visible list if room exists
  const activateLocalMessage = useCallback((msg: Message) => {
    setMessages((current) => {
      const exists = current.find((m) => m._id === msg._id);
      if (exists || current.length >= MAX_VISIBLE) {
        return current;
      }
      return [...current, msg];
    });
  }, []);

  // Remove message when expired event received
  const expireLocalMessage = useCallback((id: string) => {
    setMessages((current) => current.filter((m) => m._id !== id));
  }, []);

  // useEffect(() => {
  //   // (async () => {
  //   //   // Load initial state on mount
  //   //   const initial = await fetchActiveMessages();
  //   //   setVisible(initial);
  //   // })();
  //   //
  //   // socket.on('initial-state', (msgs: Message[]) => {
  //   //   setVisible(msgs);
  //   // });
  //
  //   socket.on('message-activated', (msg: Message) => {
  //     activateLocalMessage(msg);
  //   });
  //
  //   socket.on('message-expired', ({ _id }: { _id: string }) => {
  //     expireLocalMessage(_id);
  //   });
  //
  //   return () => {
  //     // socket.off('initial-state');
  //     socket.off('message-activated');
  //     socket.off('message-expired');
  //   };
  // }, [activateLocalMessage, expireLocalMessage]);

  return { messages, activateLocalMessage, expireLocalMessage };
}
