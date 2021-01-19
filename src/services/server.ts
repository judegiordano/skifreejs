import config from '../helpers/config';
import express from 'express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Environment as Env } from '../types/Constants';

const app = express();

app.disable('x-powered-by');
app.set('json spaces', 2);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

if (config.ENV === Env.dev) {
	app.use(responseTime());
	app.use(morgan('combined'));
}
if (config.ENV === Env.prod) {
	app.use(helmet());
}

export default app;