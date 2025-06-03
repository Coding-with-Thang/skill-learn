"use client"

import { useState, useEffect } from 'react';
import useLocalStorage from "../../../lib/hooks/useLocalStorage";
import { usePathname } from 'next/navigation';
import QuizModal from "../../components/Quiz/QuizModal"

const choices = ['Rock', 'Paper', 'Scissors'];
export default function RockPaperScissors() {

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

  //Game Logic
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');

  const playGame = (choice) => {
    const computer = choices[Math.floor(Math.random() * 3)];
    setPlayerChoice(choice);
    setComputerChoice(computer);

    if (choice === computer) {
      setResult('It\'s a tie!');
    } else if (
      (choice === 'Rock' && computer === 'Scissors') ||
      (choice === 'Paper' && computer === 'Rock') ||
      (choice === 'Scissors' && computer === 'Paper')
    ) {
      setResult('You win!');
    } else {
      setResult('You lose!');
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Rock-Paper-Scissors</h2>

      <div className='my-5'>
        <p className="text-xl font-semibold">Round: {round}</p>
        <p className="text-xl font-semibold">Score: {score}</p>
      </div>
      <div className="space-x-4">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => playGame(choice)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {choice}
          </button>
        ))}
      </div>
      {playerChoice && (
        <div className="mt-4">
          <p>You chose: {playerChoice}</p>
          <p>Computer chose: {computerChoice}</p>
          <p className="font-bold">{result}</p>
        </div>
      )}

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