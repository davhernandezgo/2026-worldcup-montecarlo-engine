# Etapa 1: Construcción
FROM golang:1.22-alpine AS builder

# Habilitar CGO_ENABLED=0 para compilar un binario 100% estático
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64

WORKDIR /app

# Copiar go.mod y go.sum primero para aprovechar caché de capas Docker
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente
COPY . .

# Construir el binario, quitando info de debug para reducir tamaño (-ldflags="-s -w")
RUN go build -ldflags="-s -w" -o simulator .

# Etapa 2: Imagen Mínima (Scratch)
FROM scratch

# Necesario para certificados TLS si la API hace peticiones externas futuras
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

WORKDIR /

# Copiar el binario desde la etapa builder
COPY --from=builder /app/simulator .

# Copiar la carpeta data
COPY --from=builder /app/data ./data

# Exponer el puerto de Fiber
EXPOSE 8080

# Ejecutar
ENTRYPOINT ["/simulator"]
