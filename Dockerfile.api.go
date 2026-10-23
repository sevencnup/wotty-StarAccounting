FROM golang:1.26.10-alpine AS build

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

USER stark
EXPOSE 12367
ENTRYPOINT ["/app/wotty-stark-api"]
