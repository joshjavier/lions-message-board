interface MessagesProps {
  messages: {
    author: string;
    body: string;
  }[];
}

export function Messages({ messages }: MessagesProps) {
  return (
    <ul>
      {messages.map((message) => (
        <li>
          {message.author || 'anon'}: {message.body}
        </li>
      ))}
    </ul>
  );
}
