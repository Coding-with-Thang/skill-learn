"use client"

import { useState, useEffect } from 'react';
import { useLocalStorage } from "@skill-learn/lib/hooks/useLocalStorage";
import { usePathname } from 'next/navigation';
import { Button } from "@skill-learn/ui/components/button";
import QuizModal from "@/components/quiz/QuizModal"

export default function NumberGuessingGame() {
  const [round, setRound] = useLocalStorage("round", 1);
  const [score, setScore] = useLocalStorage("score", 0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const pathname = usePathname();

  const [number, setNumber] = useState(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (round >= 3) {
      setIsOpen(true);
      setSelectedCategory("");
    }
  }, [round, pathname]);

  const handleGuess = (e) => {
    if (e) e.preventDefault();
    if (gameOver || !guess) return;

    const userGuess = parseInt(guess);
    setAttempts(a => a + 1);

    if (userGuess === number) {
      setMessage('BINGO! You found it!');
      setGameOver(true);
      setScore(prev => prev + Math.max(10, 100 - (attempts * 10)));
    } else if (userGuess < number) {
      setMessage('Too low! Try higher.');
    } else {
      setMessage('Too high! Try lower.');
    }
    setGuess('');
  };

  const nextRound = () => {
    setNumber(Math.floor(Math.random() * 100) + 1);
    setRound((prev) => (prev >= 3 ? 3 : prev + 1));
    setMessage('');
    setGuess('');
    setAttempts(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="text-center mb-8">
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Attempts</p>
        <span className="text-4xl font-black text-slate-800">{attempts}</span>
      </div>

      <form onSubmit={handleGuess} className="w-full bg-slate-100 p-8 rounded-[2.5rem] shadow-inner flex flex-col items-center gap-6">
        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Enter a number..."
          disabled={gameOver}
          className="w-full h-16 bg-white rounded-4xl border-none text-center text-2xl font-black text-slate-800 focus:ring-4 focus:ring-cyan-200 transition-all outline-none"
        />
        <Button
          type="submit"
          disabled={gameOver}
          className="w-full h-14 bg-cyan-400 hover:bg-cyan-500 text-white font-black text-lg rounded-4xl shadow-lg transition-all active:scale-95"
        >
          GUESS
        </Button>
      </form>

      <div className="mt-8 text-center h-12">
        {message && (
          <p className={`text-lg font-bold ${gameOver ? 'text-cyan-500 animate-bounce' : 'text-slate-500'}`}>
            {message}
          </p>
        )}
      </div>

      {gameOver && (
        <Button
          onClick={nextRound}
          className="mt-8 h-14 px-10 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-4xl transition-all animate-fade-in"
        >
          NEXT ROUND
        </Button>
      )}

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
