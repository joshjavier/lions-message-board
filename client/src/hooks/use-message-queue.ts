import { fetchActiveMessages } from '@/lib/api-client';
import { socket } from '@/lib/socket';
import type { Message } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

// Max messages shown at once (client-side)
const MAX_VISIBLE = 10;

export function useMessageQueue() {
  const [visible, setVisible] = useState<Message[]>([]);

  // Add a message to visible list if room exists
  const activateLocalMessage = useCallback((msg: Message) => {
    setVisible((current) => {
      const exists = current.find((m) => m._id === msg._id);
      if (exists || current.length >= MAX_VISIBLE) {
        return current;
      }
      return [...current, msg];
    });
  }, []);

  // Remove message when expired event received
  const expireLocalMessage = useCallback((id: string) => {
    setVisible((current) => current.filter((m) => m._id !== id));
  }, []);

  useEffect(() => {
    (async () => {
      // Load initial state on mount
      const initial = await fetchActiveMessages();
      setVisible(initial);
    })();

    socket.on('initial-state', (msgs: Message[]) => {
      setVisible(msgs);
    });

    socket.on('message-activated', (msg: Message) => {
      activateLocalMessage(msg);
    });

    socket.on('message-expired', ({ _id }: { _id: string }) => {
      expireLocalMessage(_id);
    });

    return () => {
      socket.off('initial-state');
      socket.off('message-activated');
      socket.off('message-expired');
    };
  }, [activateLocalMessage, expireLocalMessage]);

  return { visible };
}
