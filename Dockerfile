# syntax=docker/dockerfile:1
# https://github.com/clux/muslrust
FROM clux/muslrust:stable AS builder
WORKDIR /volume
COPY . .
RUN cargo build --release --bin hello_world
ENV RUSTFLAGS="-C strip=symbols"
RUN cargo build --release

# https://github.com/GoogleContainerTools/distroless
FROM gcr.io/distroless/static-debian12
WORKDIR /
COPY --from=builder /volume/target/x86_64-unknown-linux-musl/release/main .
ENTRYPOINT ["/main", "serve"]
