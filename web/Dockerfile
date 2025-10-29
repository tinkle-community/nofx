# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /web

# 可选：通过构建参数注入 VITE_API_BASE
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
# 直接调用 vite 构建以跳过 tsc（不修改 package.json）
RUN npx vite build

# ---- Run stage ----
FROM node:20-alpine
WORKDIR /web

RUN npm i -g serve@14.2.3 --prefer-online=false --no-audit --no-fund

COPY --from=builder /web/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]


