# Stage 1: Build Rust WASM
FROM rust:latest as rust-builder
WORKDIR /app

# Install wasm-pack
RUN cargo install wasm-pack

# Copy Rust source
COPY rust ./rust

# Build WASM
WORKDIR /app/rust
RUN wasm-pack build --target web --out-dir ../web/pkg

# Stage 2: Build React App
FROM node:20 as web-builder
WORKDIR /app

# Copy Web source
COPY web ./web

# Copy built WASM from rust-builder
COPY --from=rust-builder /app/web/pkg ./web/pkg

# Build Web App
WORKDIR /app/web
RUN npm install
RUN npm run build

# Stage 3: Serve
FROM node:20-slim
WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy built assets
COPY --from=web-builder /app/web/dist ./dist

# Expose port 7860 for Hugging Face Spaces
EXPOSE 7860

# Start the server
CMD ["serve", "-s", "dist", "-l", "7860"]
