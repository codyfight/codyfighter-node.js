import express from 'express';
import modules from './modules/index.js';

const app = express();

/** framework modules */

modules(app);
