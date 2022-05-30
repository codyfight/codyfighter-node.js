import http from 'http';
import CBot from '../services/cbot.js';

export default function server(app) {
    app.server = http.createServer(app);

    app.listen(app.config.port, () => {
        console.log('Server running on port ' + app.config.port);

        /** invoke Codyfighther(s) */
        const cbot = new CBot(app);
        cbot.run();
    });
}
