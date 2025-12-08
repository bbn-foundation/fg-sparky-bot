FROM oven/bun:1.3.3
WORKDIR /fg-sparky-bot

# install deps
RUN apt-get update && apt-get install python3 make gcc g++ binutils -y
COPY package.json bun.lock /fg-sparky-bot/
COPY src src/
COPY numbers numbers/
RUN bun install --frozen-lockfile --production

# setup
ENV NODE_ENV=production
RUN bun run build

USER bun
CMD [ "dist/fg-sparky-bot" ]