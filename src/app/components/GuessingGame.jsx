"use client"

import { useState } from 'react';
export default function NumberGuessingGame() {
  const [number, setNumber] = useState(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');

  const handleGuess = () => {
    const userGuess = parseInt(guess);
    if (userGuess === number) {
      setMessage('You got it!');
    } else if (userGuess < number) {
      setMessage('Too low!');
    } else {
      setMessage('Too high!');
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Number Guessing Game</h2>
      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        className="border p-2"
      />
      <button
        onClick={handleGuess}
        className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        Guess
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}