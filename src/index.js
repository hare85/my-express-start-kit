import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from 'config';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import logger from './utils/logger';
// import routes from './routes';
import schema from './schema';
import connectMongo from './mongo-connector';
import { authenticate } from './authentication';
import buildDataloaders from './dataloaders';
import formatError from './errors/formatError';

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

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use((err, req, res, next) => {
//   res.status(500).send({ error: 'invalid data' });
//   next(err);
// });
// app.use('/', routes);

const start = async () => {
  const mongo = await connectMongo();

  const buildOptions = async (req) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {
        dataloaders: buildDataloaders(mongo),
        mongo,
        user,
      },
      schema,
      formatError,
    };
  };
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: '\'Authorization\': \'bearer token-test@test.com\'',
    subscriptionsEndpoint: `ws://localhost:${app.get('port')}/subscriptions`,
  }));

  const server = createServer(app);
  server.listen(app.get('port'), () => {
    SubscriptionServer.create(
      { execute, subscribe, schema },
      { server, path: '/subscriptions' },
    );
    logger.info('Server log level is', logger.logLevel);
    logger.info(`Express server listening on port ${app.get('port')}`);
  });
};

start();
