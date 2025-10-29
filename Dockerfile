# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM golang:alpine AS builder
WORKDIR /src

# 安装基础依赖
RUN apk add --no-cache git tzdata ca-certificates && update-ca-certificates

# 如果官方镜像版本低于 go.mod 要求，设置 GOTOOLCHAIN 让 Go 自动下载所需版本
ENV GOTOOLCHAIN=auto

# 预下载依赖
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# 复制源代码
COPY . .

# 构建二进制（静态编译）
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/nofx ./

# ---- Run stage ----
FROM alpine:3.20
WORKDIR /app

RUN apk add --no-cache tzdata ca-certificates && update-ca-certificates \
    && adduser -D -H appuser

# 可执行文件
COPY --from=builder /out/nofx /app/nofx

# 运行时默认读取 /app/config.json（通过 docker-compose 挂载）
EXPOSE 8080
USER appuser

ENTRYPOINT ["/app/nofx"]
CMD ["/app/config.json"]


