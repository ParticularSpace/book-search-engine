const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const jwt = require('jsonwebtoken');
const { User } = require('./models');


const app = express();
const PORT = process.env.PORT || 3001;




const getUserFromToken = async (token) => {
  if (!token) {
    return null;
  }

  try {
    // remove 'Bearer ' from token
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    // decode the token using your secret key
    const { data } = jwt.verify(token, 'mysecretsshhhhh'); // replace 'mysecretsshhhhh' with your secret key

    // find the user with the _id from the token
    const user = await User.findById(data._id);

    return user;
  } catch (err) {
    console.error(err);
    return null;
  }
};



// Create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization || '';

    // try to retrieve a user with the token
    const user = await getUserFromToken(token);

    // add the user to the context
    return { user };
  },
});

// Start the Apollo server and apply middleware inside an async IIFE
(async function() {
  await server.start();
  server.applyMiddleware({ app });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
})();
