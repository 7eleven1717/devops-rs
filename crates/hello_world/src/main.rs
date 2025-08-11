use clap::Parser;

mod cli;
use cli::{Cli, Commands, ServeArgs};

mod server;
#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Serve(ServeArgs { port }) => {
            let port = if std::env::args().all(|arg| arg != "-p" && arg != "--port") {
                std::env::var("PORT")
                    .unwrap_or_default()
                    .parse()
                    .unwrap_or(port)
            } else {
                port
            };

            server::serve(&port).await;
        }
    }
}
