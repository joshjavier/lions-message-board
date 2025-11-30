import { ChatBubble } from '@/components/chat-bubble';
import { fetchMessages } from '@/lib/api-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/board')({
  component: RouteComponent,
  loader: () => fetchMessages(),
});

function RouteComponent() {
  const messages = Route.useLoaderData();

  return (
    <div className="p-8">
      {messages.map((message) => (
        <ChatBubble message={message} />
      ))}
    </div>
  );
}
