import { createFileRoute } from '@tanstack/react-router';
import { MessageForm } from '../components/MessageForm';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-svh pt-20 pb-28">
      <div className="box-content px-6">
        <MessageForm />
      </div>
    </div>
  );
}
