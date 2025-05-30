// BlackjackGame.tsx
import React, { useState, useEffect, type JSX } from 'react';
import '../src/styles/Blackjack.css';

interface Card {
  value: string;
  suit: string;
}

const suits = ['♠', '♣', '♥', '♦'];
const values = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
];

const createDeck = (): Card[] => {
  let deck: Card[] = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return shuffle(deck);
};

const shuffle = (deck: Card[]): Card[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const getCardValue = (card: Card): number => {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
};

const calculateHandValue = (hand: Card[]): number => {
  let total = 0;
  let aces = 0;
  hand.forEach(card => {
    total += getCardValue(card);
    if (card.value === 'A') aces++;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
};

const BlackjackGame: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [status, setStatus] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playerStood, setPlayerStood] = useState<boolean>(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const dealCard = (deck: Card[]): [Card, Card[]] => {
    const card = deck.pop() as Card;
    return [card, [...deck]];
  };

  const startNewGame = (): void => {
    let newDeck = createDeck();
    let [playerCard1, tempDeck1] = dealCard(newDeck);
    let [dealerCard1, tempDeck2] = dealCard(tempDeck1);
    let [playerCard2, tempDeck3] = dealCard(tempDeck2);
    let [dealerCard2, tempDeck4] = dealCard(tempDeck3);

    setDeck(tempDeck4);
    setPlayerHand([playerCard1, playerCard2]);
    setDealerHand([dealerCard1, dealerCard2]);
    setGameOver(false);
    setPlayerStood(false);
    setStatus('Your move');
  };

  const handleHit = (): void => {
    if (gameOver) return;
    const [card, newDeck] = dealCard(deck);
    const newHand = [...playerHand, card];
    const value = calculateHandValue(newHand);
    setPlayerHand(newHand);
    setDeck(newDeck);
    if (value > 21) {
      setStatus('You busted! Dealer wins.');
      setGameOver(true);
      setPlayerStood(true);
    }
  };

  const handleStand = (): void => {
    if (gameOver) return;
    let newDeck = [...deck];
    let newDealerHand = [...dealerHand];
    while (calculateHandValue(newDealerHand) < 17) {
      const [card, updatedDeck] = dealCard(newDeck);
      newDealerHand.push(card);
      newDeck = updatedDeck;
    }
    const playerScore = calculateHandValue(playerHand);
    const dealerScore = calculateHandValue(newDealerHand);
    let result: string;
    if (dealerScore > 21 || playerScore > dealerScore) result = 'You win!';
    else if (playerScore < dealerScore) result = 'Dealer wins!';
    else result = 'It\'s a tie!';
    setDealerHand(newDealerHand);
    setDeck(newDeck);
    setStatus(result);
    setGameOver(true);
    setPlayerStood(true);
  };

  const renderHand = (hand: Card[], hideSecondCard: boolean = false): JSX.Element[] => {
    return hand.map((card, idx) => {
      if (idx === 1 && hideSecondCard && !playerStood) {
        return <div key={idx} className="card back">🂠</div>;
      }
      return (
        <div key={idx} className="card">
          {card.value}{card.suit}
        </div>
      );
    });
  };

  return (
    <div className="blackjack">
      <h1>Blackjack</h1>
      <div className="hands">
        <div>
          <h2>Dealer's Hand</h2>
          <div className="hand">{renderHand(dealerHand, true)}</div>
        </div>
        <div>
          <h2>Your Hand</h2>
          <div className="hand">{renderHand(playerHand)}</div>
        </div>
      </div>
      <h2>{status}</h2>
      <div className="controls">
        <button onClick={handleHit} disabled={gameOver}>Hit</button>
        <button onClick={handleStand} disabled={gameOver}>Stand</button>
        <button onClick={startNewGame}>New Game</button>
      </div>
    </div>
  );
};

export default BlackjackGame;
