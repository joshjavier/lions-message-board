import { BubbleWorld } from '@/components/bubble-world';
import { MessageBoard } from '@/components/message-board';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/board')({
  component: RouteComponent,
  // loader: () => fetchMessages(),
});

const initialMessages = [
  'Hello!',
  'Floaty bubbles!',
  'React + Matter.js + TypeScript',
  'Resize the window!',
  'It just works 😊',
];

function RouteComponent() {
  // const messages = Route.useLoaderData();
  const [messages, setMessages] = useState<string[]>(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim().length === 0) {
      return;
    }

    setMessages((prev) => [...prev, input]);
    setInput('');
  };

  return (
    <>
      <BubbleWorld messages={messages} />
      <div className="absolute inset-0 z-10">
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={handleSend}>send</button>
      </div>
    </>
  );
}
