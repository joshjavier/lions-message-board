import { BubbleWorld } from '@/components/bubble-world';
import { MessageBoard } from '@/components/message-board';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/board')({
  component: RouteComponent,
  // loader: () => fetchMessages(),
});

function RouteComponent() {
  // const messages = Route.useLoaderData();

  return (
    <BubbleWorld
      messages={[
        'Hello!',
        'Floaty bubbles!',
        'React + Matter.js + TypeScript',
        'Resize the window!',
        'It just works 😊',
      ]}
    />
  );
}
