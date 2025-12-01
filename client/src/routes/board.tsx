import { MessageBoard } from '@/components/message-board';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/board')({
  component: RouteComponent,
  // loader: () => fetchMessages(),
});

function RouteComponent() {
  // const messages = Route.useLoaderData();

  return <MessageBoard />;
}
