let gameState = {
  deck: [],         
  playerCards: [],  
  aiCards: [],      
  pot: 0,           
  collapseProbability: 0,  
  currentTurn: 'player',   
  collapseCards: 4,  
  deckSize: 52,      
};

// Function to initialize a new game
const startGame = (req, res) => {
  // Initialize the deck with sample cards (you can add more logic to shuffle or define the deck)
  gameState.deck = createShuffledDeck();
  gameState.playerCards = [];
  gameState.aiCards = [];
  gameState.pot = 20;  // Initial pot value
  gameState.collapseProbability = 0;
  gameState.currentTurn = 'player';
  gameState.collapseCards = 4;
  gameState.deckSize = gameState.deck.length;

  res.json({ message: "New game started", gameState });
};

// Helper function to create and shuffle a deck of cards
const createShuffledDeck = () => {
  const deck = [];
  // Add cards to the deck (you can modify this logic for different card values)
  for (let i = 2; i <= 10; i++) {
    ['hearts', 'spades', 'diamonds', 'clubs'].forEach(suit => {
      deck.push({ value: i, suit, isCollapse: false });
    });
  }
  // Add collapse cards (e.g., all Jacks)
  ['hearts', 'spades', 'diamonds', 'clubs'].forEach(suit => {
    deck.push({ value: 'J', suit, isCollapse: true });
  });
  // Shuffle the deck
  return deck.sort(() => Math.random() - 0.5);
};

// Helper function to calculate score
const calculateScore = (cards) => {
  return cards.reduce((total, card) => {
    if (card.value === 'J') return total + 10;  // Collapse card worth 10
    return total + parseInt(card.value, 10);
  }, 0);
};

// Endgame check
const checkEndgame = () => {
  if (gameState.deck.length === 0) {
    const playerScore = calculateScore(gameState.playerCards);
    const aiScore = calculateScore(gameState.aiCards);
    
    if (playerScore > aiScore) {
      return { message: "Player wins by score!", playerScore, aiScore };
    } else if (aiScore > playerScore) {
      return { message: "AI wins by score!", playerScore, aiScore };
    } else {
      return { message: "It's a tie!", playerScore, aiScore };
    }
  }
  return null;
};

// Player makes a bet and draws a card
const playerBet = (req, res) => {
  const { action, betAmount } = req.body;
  
  if (action === 'fold') {
    return res.json({ message: "Player folded, AI wins the pot!", gameState });
  }

  if (action === 'raise') {
    gameState.pot += betAmount;
  }

  // Player draws a card
  const drawnCard = gameState.deck.pop();
  gameState.playerCards.push(drawnCard);
  gameState.collapseProbability = Math.min(gameState.collapseCards / gameState.deck.length, 1);

  if (drawnCard.isCollapse) {
    return res.json({ message: "Collapse card drawn! AI wins the round!", gameState });
  }

  // Check for endgame after drawing
  const endgameResult = checkEndgame();
  if (endgameResult) {
    return res.json(endgameResult);
  }

  gameState.currentTurn = 'ai';
  res.json({ message: "Player drew a card", drawnCard, gameState });
};

// AI's turn to decide
const aiTurn = (req, res) => {
  let aiDecision;

  if (gameState.collapseProbability < 0.3) {
    aiDecision = 'draw';
  } else if (gameState.collapseProbability < 0.6 && Math.random() > 0.5) {
    aiDecision = 'draw';
  } else {
    aiDecision = 'fold';
  }

  if (aiDecision === 'fold') {
    return res.json({ message: "AI folded, player wins the pot!", gameState });
  }

  const drawnCard = gameState.deck.pop();
  gameState.aiCards.push(drawnCard);
  gameState.collapseProbability = Math.min(gameState.collapseCards / gameState.deck.length, 1);

  if (drawnCard.isCollapse) {
    return res.json({ message: "Collapse card drawn! Player wins the round!", gameState });
  }

  // Check for endgame after AI draws
  const endgameResult = checkEndgame();
  if (endgameResult) {
    return res.json(endgameResult);
  }

  gameState.currentTurn = 'player';
  res.json({ message: "AI drew a card", drawnCard, gameState });
};

module.exports = { startGame, playerBet, aiTurn };
