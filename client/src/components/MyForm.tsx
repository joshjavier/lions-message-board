import { useState, type FormEvent } from 'react';
import { socket } from '../socket';

export function MyForm() {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    socket.timeout(5000).emit('foo', value, (response: string) => {
      console.log(response); // BUG: not working
      setIsLoading(false);
      setValue('');
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <input onChange={(e) => setValue(e.target.value)} />
      <button type="submit" disabled={isLoading}>
        Submit
      </button>
    </form>
  );
}
