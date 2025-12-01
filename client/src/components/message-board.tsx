import { useMessageQueue } from '@/hooks/use-message-queue';
import { ChatBubble } from './chat-bubble';

export function MessageBoard() {
  const { visible } = useMessageQueue();

  return (
    <div className="flex h-svh w-full flex-col gap-3 p-4">
      {visible.map((message) => (
        <ChatBubble key={message._id} message={message} />
      ))}
    </div>
  );
}
