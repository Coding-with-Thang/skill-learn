"use client"

import { useState, useEffect } from 'react';
import useLocalStorage from "../../../lib/hooks/useLocalStorage";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import QuizModal from "../../components/Quiz/QuizModal"
export default function NumberGuessingGame() {

  //Local Storage
  const [round, setRound] = useLocalStorage("round", 1);
  const [score, setScore] = useLocalStorage("score", 0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (round >= 3) {
      setIsOpen(true);
      setSelectedCategory(""); // Reset category selection
    }
  }, [round, pathname]);

  //Guessing Game
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
      <div className='my-5'>
        <p className="text-xl font-semibold">Round: {round}</p>
        <p className="text-xl font-semibold">Score: {score}</p>
        <Button onClick={() => setRound((prev) => (prev >= 3 ? 3 : prev + 1))} disabled={round >= 3}>Next Round</Button>
      </div>
      <h2 className="text-2xl font-bold mb-4">Number Guessing Game</h2>
      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        className="border p-2"
      />
      <button
        onClick={handleGuess}
        className="ml-2 px-4 py-2 bg-green-500 text-white rounded-sm"
      >
        Guess
      </button>
      {message && <p className="mt-4">{message}</p>}

      <div className='mt-20 border rounded-xl py-4 px-8'>
        <h3 className='text-lg font-semibold'>Rules: </h3>
        <div>
          <p>1. Guess a number from 1-100</p>
          <p>2. Guess the right number and WIN!</p>
        </div>
      </div>

      <QuizModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setRound={setRound}
        setScore={setScore}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}
