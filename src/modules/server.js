import http from 'http';
import CBot from '../bots/cbot.js';

export default function server(app) {
    app.server = http.createServer(app);

    app.listen(app.config.port, () => {
        console.log('Codyfight bot server running on port ' + app.config.port);

        /** invoke Codyfighther(s) */
        const cbot = new CBot(app, app.config.api.codyfight.ckey);
        cbot.run();
    });
}
