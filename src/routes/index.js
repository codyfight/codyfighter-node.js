export default function routes(app) {

    app.get('/', (request, response) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end('OK');
    });

};
