import { ChatBubble } from '@/components/chat-bubble';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/board')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8">
      <ChatBubble message="That's awesome. I think our users will really appreciate the improvements." />
    </div>
  );
}
