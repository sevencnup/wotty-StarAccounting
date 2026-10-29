FROM golang:1.26.10-alpine AS build

ARG GOPROXY=https://goproxy.cn|https://proxy.golang.org|direct

WORKDIR /workspace/server-go

COPY server-go/go.mod server-go/go.sum ./
RUN go mod download

COPY server-go ./
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w' -o /out/wotty-stark-api ./cmd/stark-api

FROM alpine:3.21

RUN apk add --no-cache ca-certificates \
    && addgroup -S stark \
    && adduser -S -G stark stark

WORKDIR /app
COPY --from=build /out/wotty-stark-api /app/wotty-stark-api
COPY docker/api-entrypoint.sh /app/api-entrypoint.sh

USER stark
EXPOSE 12367
ENTRYPOINT ["/bin/sh", "/app/api-entrypoint.sh"]
