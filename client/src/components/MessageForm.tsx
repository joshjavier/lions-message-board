import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from './ui/input-group';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import * as v from 'valibot';
import { api } from '@/lib/api-client';
import { MESSAGE_MAX_LENGTH } from '@/lib/constants';

const formSchema = v.object({
  author: v.pipe(v.string()),
  body: v.pipe(
    v.string(),
    v.nonEmpty("Can't post an empty message."),
    v.maxLength(
      MESSAGE_MAX_LENGTH,
      `Message must not exceed ${MESSAGE_MAX_LENGTH} characters.`,
    ),
  ),
});

export function MessageForm({
  maxLength = MESSAGE_MAX_LENGTH,
}: {
  maxLength?: number;
}) {
  const form = useForm({
    defaultValues: {
      author: '',
      body: '',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: {
      onDynamic: formSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await api.post('messages', { json: value });
      formApi.reset();
    },
  });

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
        <form
          id="message-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="author"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Name (optional)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Midoriya"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="body"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Ganbare!"
                        rows={3}
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText
                          className={cn(
                            'ml-auto tabular-nums',
                            field.state.value.length > maxLength &&
                              'text-destructive',
                          )}
                        >
                          {maxLength - field.state.value.length}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>

          {/* {success && <p className="text-green-600">Message sent!</p>} */}
        </form>
      </CardContent>
      <CardFooter>
        <form.Subscribe
          selector={(state) => [
            state.values.body.length > maxLength,
            state.canSubmit,
            state.isSubmitting,
          ]}
          children={([overlimit, canSubmit, isSubmitting]) => (
            <Field orientation="horizontal" className="justify-end">
              {/* <Button */}
              {/*   type="button" */}
              {/*   variant="outline" */}
              {/*   onClick={() => form.reset()} */}
              {/* > */}
              {/*   Reset */}
              {/* </Button> */}
              <Button
                type="submit"
                form="message-form"
                disabled={overlimit || !canSubmit}
                className="min-w-32"
              >
                {isSubmitting ? '...' : 'Post Message'}
              </Button>
            </Field>
          )}
        />
      </CardFooter>
    </Card>
  );
}
