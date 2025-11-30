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
