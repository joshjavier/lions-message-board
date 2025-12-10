# Server

Backend API for the Lions Awards Message Board.

This server is a TypeScript Node.js app using Express and MongoDB, with Socket.IO for realtime features.

## Prerequisites

- Node.js (v20+ recommended)
- npm
- A running MongoDB instance (local or cloud)

## Quickstart

1. Install dependencies

   ```sh
   npm install
   ```

2. Create a `.env` file in the `server/` directory with at least the following variables:

   ```sh
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/lions_awards
   NODE_ENV=development
   ```

3. Run in development (uses `tsx watch`):

   ```sh
   npm run dev
   ```

4. Build and run production:

   ```sh
   npm run build
   npm start
   ```

Available npm scripts (from `package.json`)

- `npm run dev` — Run the TypeScript source with tsx in watch mode
- `npm run build` — Compile TypeScript to `dist/` using tsc
- `npm start` — Run the compiled app
- `npm run lint` — Run ESLint
- `npm run format` — Format code with Prettier
- `npm run typecheck` — Run the TypeScript compiler for type checking

## Environment variables

Check the code for additional environment variables; common ones used here are:

- `PORT` — TCP port the server listens on
- `MONGODB_URI` — MongoDB connection string
- `NODE_ENV` — Environment (development|production)

See `.env.example` for an example.

## Dependencies

Key runtime dependencies:

- express — HTTP server framework
- mongodb — MongoDB driver
- socket.io — WebSocket / realtime support
- dotenv — Loads .env files

## Development

- TypeScript is used for the source; source files are under `server/src`.
- tsx is used for fast dev iteration (watch mode).
- Follow project lint/format rules via `npm run lint` and `npm run format`.

## Notes

- Update `.env` values to match your environment before running.
- If you deploy to a container or platform, ensure the `MONGODB_URI` and `PORT` are set appropriately.

## License

MIT.
