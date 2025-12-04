import { BubbleWorld } from '@/components/bubble-world';
// import { MessageBoard } from '@/components/message-board';
import { useMessageQueue } from '@/hooks/use-message-queue';
import { fetchActiveMessages } from '@/lib/api-client';
import { socket } from '@/lib/socket';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/board')({
  component: RouteComponent,
  loader: () => fetchActiveMessages(),
});

// const initialMessages = [
//   'Hello!',
//   'Floaty bubbles!',
//   'React + Matter.js + TypeScript',
//   'Resize the window!',
//   'It just works 😊',
// ];

function RouteComponent() {
  const initialMessages = Route.useLoaderData();
  const { messages, activateLocalMessage, expireLocalMessage } =
    useMessageQueue(initialMessages);
  // const [messages, setMessages] = useState<string[]>(initialMessages);
  // const [input, setInput] = useState('');
  //
  // const handleSend = () => {
  //   if (input.trim().length === 0) {
  //     return;
  //   }
  //
  //   setMessages((prev) => [...prev, input]);
  //   setInput('');
  // };

  useEffect(() => {
    socket.on('message-activated', activateLocalMessage);

    return () => {
      socket.off('message-activated', activateLocalMessage);
    };
  }, [activateLocalMessage]);

  return (
    <>
      <BubbleWorld messages={messages} removeFromState={expireLocalMessage} />
      {/* <div className="absolute inset-0 z-10"> */}
      {/*   <input value={input} onChange={(e) => setInput(e.target.value)} /> */}
      {/*   <button onClick={handleSend}>send</button> */}
      {/* </div> */}
    </>
  );
}
