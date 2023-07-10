const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const expiration = '2h';


module.exports = {
  signToken: function ({ username, email, _id }) {

    const payload = { username, email, _id };
  
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },

  authMiddleware: function ({ req }) {
    console.log('authMiddleware hit');
    let token = req.body.token || req.query.token || req.headers.authorization;
    console.log('token', token);

    if (req.headers.authorization) {  
      token = token.split(' ').pop().trim();
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
