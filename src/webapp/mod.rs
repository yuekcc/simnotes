use afire::{extension::ServeStatic, Method, Middleware, Response, Server};

pub fn attach<T: Send + Sync>(server: &mut Server<T>) {
    server.route(Method::GET, "/", |_| {
        Response::new()
            .status(308)
            .header("Location", "/index.html")
    });

    ServeStatic::new("web").attach(server);
}
