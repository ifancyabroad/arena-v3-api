const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const errorHandler = require('../util/error');

exports.signup = async (req, res, next) => {

  try {

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errorHandler('Validation failed.', 422, errors.array());
    }

    // const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    // Save user data and return user ID
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      // email: email,
      password: hashedPassword,
      username: username
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result._id })
  } catch (err) {
    next(err);
  }
}

exports.login = async (req, res, next) => {

  const username = req.body.username;
  const password = req.body.password;

  try {

    // Search user and throw error if not found
    const user = await User.findOne({ username: username })
    if (!user) {
      errorHandler('A user with this username could not be found.', 401);
    }

    const loadedUser = user;

    // Check password and throw error if not equal
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      errorHandler('Wrong password!', 401);
    }

    // Sign token and return with user ID
    const token = jwt.sign({
      username: loadedUser.username,
      userId: loadedUser._id.toString()
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful!', token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    next(err);
  }
}