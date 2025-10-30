# Multi-stage build for NOFX AI Trading System
FROM golang:1.25-alpine AS backend-builder

# Install build dependencies including TA-Lib
RUN apk update && \
    apk add --no-cache \
    git \
    make \
    gcc \
    g++ \
    musl-dev \
    wget \
    tar \
    autoconf \
    automake

# Install TA-Lib
RUN wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz && \
    tar -xzf ta-lib-0.4.0-src.tar.gz && \
    cd ta-lib && \
    if [ "$(uname -m)" = "aarch64" ]; then \
        CONFIG_GUESS=$(find /usr/share -name config.guess | head -1) && \
        CONFIG_SUB=$(find /usr/share -name config.sub | head -1) && \
        cp "$CONFIG_GUESS" config.guess && \
        cp "$CONFIG_SUB" config.sub && \
        chmod +x config.guess config.sub; \
    fi && \
    ./configure --prefix=/usr && \
    make && \
    make install && \
    cd .. && \
    rm -rf ta-lib ta-lib-0.4.0-src.tar.gz

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy backend source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -trimpath -ldflags="-s -w" -o nofx .

# Frontend build stage
FROM node:18-alpine AS frontend-builder

WORKDIR /app/web

# Copy package files
COPY web/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY web/ ./

# Build frontend
RUN npm run build

# Final stage
FROM alpine:latest

# Update package index and install runtime dependencies
RUN apk update && \
    apk add --no-cache \
    ca-certificates \
    tzdata \
    wget \
    tar \
    make \
    gcc \
    g++ \
    musl-dev \
    autoconf \
    automake

# Install TA-Lib runtime
RUN wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz && \
    tar -xzf ta-lib-0.4.0-src.tar.gz && \
    cd ta-lib && \
    if [ "$(uname -m)" = "aarch64" ]; then \
        CONFIG_GUESS=$(find /usr/share -name config.guess | head -1) && \
        CONFIG_SUB=$(find /usr/share -name config.sub | head -1) && \
        cp "$CONFIG_GUESS" config.guess && \
        cp "$CONFIG_SUB" config.sub && \
        chmod +x config.guess config.sub; \
    fi && \
    ./configure --prefix=/usr && \
    make && \
    make install && \
    cd .. && \
    rm -rf ta-lib ta-lib-0.4.0-src.tar.gz

# Set timezone to UTC
ENV TZ=UTC

WORKDIR /app

# Copy backend binary from builder
COPY --from=backend-builder /app/nofx .

# Copy frontend build from builder
COPY --from=frontend-builder /app/web/dist ./web/dist

# Create directories for logs and data
RUN mkdir -p /app/decision_logs

# Expose ports
# 8080 for backend API
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./nofx"]
