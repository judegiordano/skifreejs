import config from './helpers/config';
import path from 'path';
import express, { Request, Response } from 'express';
import app from './controllers/index';
import { cwd } from 'process';
import log from './services/logger';

app.use(express.static(path.join(cwd(), './public/')));
app.set('view engine', 'ejs');
app.set('views', path.join(cwd(), './public/'));

app.get('/', async (req: Request, res: Response): Promise<void> => {
	return res.status(200).render('ski.ejs', {
		shouldCache: config.SHOULD_CACHE
	});
});

const start = async (): Promise<void> => {
	app.listen(config.PORT, () => {
		log.info(`server started http://localhost:${config.PORT}`);
	});
};

start();