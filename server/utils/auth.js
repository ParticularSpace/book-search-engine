const jwt = require('jsonwebtoken');
const secret = 'mysecretsshhhhh';
const expiration = '2h';


module.exports = {
  signToken: function ({ username, email, _id }) {
    console.log('signToken', username, email, _id);
    const payload = { username, email, _id };

    console.log('payload', payload);

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },

  authMiddleware: function ({ req }) {
    console.log('authMiddleware hit');
    let token = req.body.token || req.query.token || req.headers.authorization;
    console.log('token', token);

    if (req.headers.authorization) {
      console.log('token', token);
      token = token.split(' ').pop().trim();
      console.log('token', token);
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (err) {
      console.log('Error decoding token:', err.message);
    }
    
    

    return req;
  },
};
