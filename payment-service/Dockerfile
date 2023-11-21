FROM denoland/deno:latest as base

WORKDIR /app

COPY . .

RUN deno cache main.ts

EXPOSE 3002

CMD ["run", "-A", "main.ts"]