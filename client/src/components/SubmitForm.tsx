import { useState, type FormEvent } from 'react';

export function SubmitForm() {
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
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Your name (optional)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />

      <textarea
        placeholder="Your message"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <button type="submit">Send Message</button>

      {success && <p>Message sent!</p>}
    </form>
  );
}
