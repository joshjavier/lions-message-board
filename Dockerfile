# --- Base stage ---
ARG NODE_IMAGE=node:24.11.1-alpine
FROM $NODE_IMAGE AS base

RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node

# --- Dependencies state ---
FROM base AS dependencies

COPY --chown=node:node . .
WORKDIR /home/node/app/client
RUN npm ci
WORKDIR /home/node/app/server
RUN npm ci

# --- Build stage ---
FROM dependencies AS build

WORKDIR /home/node/app/client
RUN npm run build
WORKDIR /home/node/app/server
RUN npm run build
RUN mkdir -p /home/node/app/server/public \
  && cp -r /home/node/app/client/dist/* /home/node/app/server/public/

# --- Production stage ---
FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0

COPY --chown=node:node ./server/package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/server/dist .
COPY --chown=node:node --from=build /home/node/app/server/public ./public
EXPOSE $PORT
CMD ["dumb-init", "node", "main.js"]
