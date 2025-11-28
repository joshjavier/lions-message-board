import { useState, type FormEvent } from 'react';
import { Button } from './ui/button/button';

export function MessageForm() {
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const response = await fetch('http://localhost:3000/messages', {
      method: 'POST',
      body: JSON.stringify({ author, body }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log(data);

    setSuccess(true);
    setBody('');
    setAuthor('');
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 p-4">
      <input
        className="w-full rounded border p-2"
        placeholder="Your name (optional)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />

      <textarea
        className="w-full rounded border p-2"
        placeholder="Your message"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <Button type="submit" variant="default">
        Send Message
      </Button>

      {success && <p className="text-green-600">Message sent!</p>}
    </form>
  );
}
