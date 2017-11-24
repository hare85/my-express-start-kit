import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from 'config';

import logger from './utils/logger';
import routes from './routes';

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
} else {
  const corsOptions = {
    origin: [
      /^https?:\/\/localhost(:[0-9]+)?\/?$/,
      /^https?:\/\/127.0.0.1(:[0-9]+)?\/?$/,
    ],
  };
  logger.info('Cors option is required');
  app.use(cors(corsOptions));
}

app.set('port', config.get('port'));
app.use(morgan('tiny', { stream: logger.stream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  res.status(500).send({ error: 'invalid data' });
  next(err);
});

app.use('/', routes);

app.listen(app.get('port'), () => {
  logger.info('Server log level is', logger.logLevel);
  logger.info(`Express server listening on port ${app.get('port')}`);
});
