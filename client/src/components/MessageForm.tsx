import { useState, type FormEvent } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from './ui/input-group';

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
    <Card className="mx-auto w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Post a Message</CardTitle>
        <CardDescription>
          Share a shout-out, cheer, or holiday message with the team! Your
          message will appear on the screens across the production floor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="message-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Name (optional)</FieldLabel>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Midoriya"
                autoComplete="off"
              />
            </Field>

            <Field>
              <FieldLabel>Message</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Ganbare!"
                  rows={6}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    0/250 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>

          {success && <p className="text-green-600">Message sent!</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline">
            Reset
          </Button>
          <Button type="submit" form="message-form">
            Post Message
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
