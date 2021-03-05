/* eslint-disable no-console */
import 'reflect-metadata';
import http from 'http';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { json } from 'body-parser';
import { schema } from './schema';
import { dataSources } from './dataSources';
import { authChecker } from './authChecker';
import { initRouter, authRouter, errorHandler } from './router';

// apollo-server 和 auth api 使用相同的cache
const cache = new InMemoryLRUCache();

const server = new ApolloServer({
  schema,
  cache,
  plugins: [authChecker],
  dataSources,
  subscriptions: {
    path: '/subscriptions',
  },
  context: async ({ connection }) => {
    if (connection) {
      // check connection for metadata
      return connection.context;
    } else {
      return {
        user: null, // 默认为null, 在authChecker plugin 中处理
        token: null, // 默认为null, 在authChecker plugin 中处理
      };
    }
  },
});
const app = express();
const port = 5010;
const path = '/graphql';

app.get('/', (req, res) => res.send('🚀 Server is ready!'));
app.use('/api/auth', json(), authRouter(cache));
app.use('/api/init', json(), initRouter(cache));
app.use(errorHandler);

server.applyMiddleware({ app, path });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// ⚠️ Pay attention to the fact that we are calling `listen` on the http server variable, and not on `app`.
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});

// app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`));
