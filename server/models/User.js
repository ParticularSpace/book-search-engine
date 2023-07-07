const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// import the Book schema
const bookSchema = require('./Book');

// create the User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    // set savedBooks to be an array
    savedBooks: [bookSchema],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// use bcrypt to compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// user will get a bookCount virtual field that retrieves the length of the user's savedBooks array field on query.
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

// create the User model using the UserSchema
const User = model('User', userSchema);

// export the User model
module.exports = User;
