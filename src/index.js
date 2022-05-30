import express from 'express';

import routes from './routes/index.js';
import modules from './modules/index.js';

/** initialize express application */
const app = express();

/** framework bundles */
routes(app);
modules(app);
