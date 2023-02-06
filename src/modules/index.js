import utils from './utils.js';
import config from './config.js';
import server from './server.js';

export default function modules(app) {
    utils(app);
    config(app);
    server(app);
};
