use axum::{response::Redirect, routing::get, Router};
use tower_http::services::{ServeDir, ServeFile};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let web_app = ServeDir::new("web").not_found_service(ServeFile::new("web/index.html"));

    let app = Router::new()
        .route(
            "/",
            get(|| async { Redirect::permanent("/web/index.html") }),
        )
        .nest_service("/web", web_app);

    tracing::info!("Listening on http://127.0.0.1:3000");
    axum::Server::bind(&"127.0.0.1:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
