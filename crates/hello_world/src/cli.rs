use clap::{Args, Parser, Subcommand};

#[derive(Parser)]
#[command(version, about, long_about = None)]
#[command(propagate_version = true)]
pub struct Cli {
    /// Turn debugging information on
    #[arg(short, long, global = true, action = clap::ArgAction::Count)]
    pub debug: u8,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Run server
    Serve(ServeArgs),
}

#[derive(Args)]
pub struct ServeArgs {
    /// Port to run the server on
    #[arg(short, long, default_value_t = 3000)]
    pub port: u16,
}
