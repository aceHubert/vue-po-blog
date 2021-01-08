/* eslint-disable no-console */
import 'reflect-metadata';
import http from 'http';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'express-jwt';
import { configs } from './utils/getConfig';
import { schema } from './schema';
import { dataSources } from './dataSources';

const server = new ApolloServer({
  schema,
  dataSources,
  context: ({ req, connection }) => {
    if (connection) {
      // check connection for metadata
      return connection.context;
    } else {
      // check from req
      const token = req.headers.authorization || '';

      return {
        token,
        user: (req as any).user,
      };
    }
  },
});
const app = express();
const port = 5010;
const path = '/graphql';

app.get('/', (req, res) => res.send('🚀 Server is ready!'));
app.use(
  path,
  jwt({
    secret: configs.get('jwt_screct'),
    algorithms: [configs.get('jwt_algorithm')],
    credentialsRequired: false,
  }),
);

server.applyMiddleware({ app, path });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// ⚠️ Pay attention to the fact that we are calling `listen` on the http server variable, and not on `app`.
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});

// app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`));
