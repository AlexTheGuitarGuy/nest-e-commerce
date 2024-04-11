# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.11.1
ARG PNPM_VERSION=8.12.1

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \
  npm install -g pnpm@${PNPM_VERSION}

COPY --chown=app:app . /app

RUN pnpm install --frozen-lockfile

EXPOSE 8081
CMD ["pnpm", "run", "start:dev"]
