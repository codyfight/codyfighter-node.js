import config from './config.js';
import server from './server.js';

export default function modules(app) {
    config(app);
    server(app);
}
