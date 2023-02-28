use afire::{extension::Logger, Middleware, Server};

mod routes;
mod service;
mod webapp;

fn main() {
    let notes_service = service::NotesService::new();
    let mut server = Server::<service::NotesService>::new("localhost", 8080).state(notes_service);

    webapp::attach(&mut server);
    Logger::new().attach(&mut server);
    routes::attach(&mut server);

    server.start().unwrap();
}
