use std::sync::Arc;

use afire::{extension::ServeStatic, Method, Middleware, Request, Response, Server};

use super::service::NotesService;

fn query_tree(_state: Arc<NotesService>, _req: &Request) -> Response {
    Response::new().text("query tree")
}

pub fn attach(server: &mut Server<NotesService>) {
    server.stateful_route(Method::GET, "/apis/tree", query_tree);
    ServeStatic::new("web").attach(server);
}
