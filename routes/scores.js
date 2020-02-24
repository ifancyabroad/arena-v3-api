const express = require('express');
const { body } = require('express-validator/check')

const scoresController = require('../controllers/scores');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /scores/scores
router.get('/scores', isAuth, scoresController.getScores);

// POST /scores/score
router.post('/score', isAuth, [
  body('name').trim().isLength({ min: 2 }),
  body('name').trim().isLength({ max: 12 }),
  body('class').matches(/Warrior|Rogue|Mage/),
  body('level').isInt({ min: 1, max: 20 }),
  body('kills').isInt({ min: 0, max: 100 }),
  body('slainBy').isAlpha()
], scoresController.submitScore);

module.exports = router;