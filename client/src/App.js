import React, { useState, useEffect } from 'react';
import './App.css';

function Card({ value, suit }) {
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    spades: '♠',
    clubs: '♣',
  };

  const isRed = suit === 'hearts' || suit === 'diamonds';
  const cardClass = isRed ? 'card red' : 'card black';

  return (
    <div className={cardClass}>
      <span className="card-value">{value}</span>
      <span className="card-suit">{suitSymbols[suit]}</span>
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState(null);
  const [message, setMessage] = useState('');
  const [raiseAmount, setRaiseAmount] = useState(0);  // Add state for raise amount

  useEffect(() => {
    async function startGame() {
      const response = await fetch('/api/game/start', { method: 'POST' });
      const data = await response.json();
      setGameState(data.gameState);
    }
    startGame();
  }, []);

  const handlePlayerBet = async (action, betAmount = 0) => {
    const response = await fetch('/api/game/player-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, betAmount }),
    });
    const data = await response.json();
    setGameState(data.gameState);
    setMessage(data.message);

    if (data.gameState && data.gameState.currentTurn === 'ai') {
      handleAITurn();
    }
  };

  const handleAITurn = async () => {
    const response = await fetch('/api/game/ai-turn', { method: 'POST' });
    const data = await response.json();
    setGameState(data.gameState);
    setMessage(data.message);
  };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Deck Collapse</h1>
      <div className="status">
        <p><strong>Pot:</strong> ${gameState.pot}</p>
        <p><strong>Collapse Probability:</strong> {(gameState.collapseProbability * 100).toFixed(2)}%</p>
        <p><strong>Message:</strong> {message}</p>
      </div>

      <div className="actions">
        <input
          type="number"
          value={raiseAmount}
          onChange={(e) => setRaiseAmount(e.target.value)}  // Capture raise amount
          placeholder="Enter raise amount"
          className="raise-input"
        />
        <button onClick={() => handlePlayerBet('raise', parseInt(raiseAmount))}>
          Raise ${raiseAmount}
        </button>
        <button onClick={() => handlePlayerBet('fold')}>Fold</button>
        <button onClick={() => handlePlayerBet('draw')}>Draw Card</button>
      </div>

      <div className="cards">
        <h2>Player's Cards</h2>
        <div className="card-container">
          {gameState.playerCards.map((card, index) => (
            <Card key={index} value={card.value} suit={card.suit} />
          ))}
        </div>

        <h2>AI's Cards</h2>
        <div className="card-container">
          {gameState.aiCards.map((card, index) => (
            <Card key={index} value={card.value} suit={card.suit} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
