import ky from 'ky';

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (import.meta.env.DEV) {
          try {
            console.log(await response.json());
          } catch (error) {
            console.log(error);
          }
        }
      },
    ],
  },
});

export async function fetchMessages() {
  return [
    'Congratulations to all the Lions Awards winners! Thanks for your incredible hard work this year!',
    'Shout-out to the night shift team! You keep everything running smoothly — we appreciate you!',
    'Proud to be part of this amazing team! Let’s keep pushing boundaries and making magic happen!',
    'Huge thanks to everyone who supported me this year. Couldn’t have done it without you!',
    'Let’s celebrate the wins, big and small. You’re all amazing!',
    'Cheers to teamwork, growth, and success. Let’s keep the momentum going!',
    'So grateful for the friendships and support this year. Happy Lions Awards!',
    'Keep shining, team! Your commitment makes a real difference every day.',
    'To my squad: you rock! Here’s to smashing more goals together next year!',
    'Big applause for the unsung heroes behind the scenes. We see you! Thank you!',
  ];
}
