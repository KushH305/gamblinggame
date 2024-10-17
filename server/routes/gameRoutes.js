    const express = require('express');
    const { startGame, playerBet, aiTurn } = require('../controllers/gameController');
    console.log(startGame, playerBet, aiTurn);
    const router = express.Router();

    router.post('/start', startGame);  // Start a new game
    router.post('/player-bet', playerBet);  // Player makes a bet or draws
    router.post('/ai-turn', aiTurn);  // AI's turn to make a move

    module.exports = router;