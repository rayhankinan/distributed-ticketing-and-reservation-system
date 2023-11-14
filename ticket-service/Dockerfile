FROM oven/bun

WORKDIR /app

COPY --from=node:18 /usr/local/bin/node /usr/local/bin/node
COPY package.json .
COPY bun.lockb .

COPY src src
COPY tsconfig.json .
COPY prisma prisma

RUN bun install --production

# COPY public public

ENV NODE_ENV production
CMD ["bun", "start"]

EXPOSE 3000