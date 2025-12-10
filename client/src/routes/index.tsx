import { MessageForm } from '@/components/message-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[url(/message-board-background.png)] bg-cover bg-top-right bg-no-repeat pt-20 pb-28">
      <div className="box-content w-full px-6">
        <MessageForm />
      </div>
    </div>
  );
}
