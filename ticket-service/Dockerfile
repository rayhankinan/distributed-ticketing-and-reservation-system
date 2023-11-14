FROM oven/bun AS deps

WORKDIR /app

COPY --from=node:18 /usr/local/bin/node /usr/local/bin/node
COPY package.json .
COPY bun.lockb .

COPY prisma prisma

RUN bun install --production

FROM oven/bun AS runner

WORKDIR /app

COPY src src
COPY tsconfig.json .
COPY --from=deps /app/node_modules node_modules

ENV NODE_ENV production

CMD ["bun", "src/index.ts"]

EXPOSE 3000