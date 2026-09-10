# Stage 1: Build the Go binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and certificates
RUN apk add --no-cache git ca-certificates

COPY go.mod ./
# Download dependencies
RUN go mod download || true

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /vaultguard-core ./cmd/server/main.go

# Stage 2: Ultra-lightweight Linux distribution
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/
COPY --from=builder /vaultguard-core .

EXPOSE 8080

CMD ["./vaultguard-core"]
