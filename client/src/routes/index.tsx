import { createFileRoute } from '@tanstack/react-router';
import { MessageForm } from '../components/MessageForm';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 pb-5">
      <MessageForm />
    </div>
  );
}
