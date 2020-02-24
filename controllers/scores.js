const { validationResult } = require('express-validator/check');

const Score = require('../models/score');
const User = require('../models/user');

exports.getScores = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 10;

  try {

    // Get total number of scores in the collection
    const totalItems = await Score.find().countDocuments();

    // Return scores by kill in ASCENDING order and limit to 10 per page
    const scores = await Score.find()
      .populate('user')
      .sort({ kills: 1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // Return scores and total score count
    res.status(200).json({
      message: 'Fetched scores successfully.',
      scores: scores,
      totalItems: totalItems
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.submitScore = async (req, res, next) => {

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  // Get all the data from the request body
  const name = req.body.name;
  const portrait = req.body.portrait;
  const cl = req.body.class;
  const level = req.body.level;
  const kills = req.body.kills;
  const slainBy = req.body.slainBy;

  // Create new score from data
  const score = new Score({
    name: name,
    portrait: portrait,
    class: cl,
    level: level,
    kills: kills,
    slainBy: slainBy,
    user: req.userId
  });

  // Save the score to the scores collection and
  try {
    await score.save()

    // Save the score to the user
    const user = await User.findById(req.userId)
    user.scores.push(score);
    await user.save()

    res.status(201).json({
      message: 'Score submitted successfully',
      score: score,
      user: { _id: user._id, name: user.username }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};