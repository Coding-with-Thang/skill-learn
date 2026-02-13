"use client"

import { useState, useEffect } from 'react';
import { useLocalStorage } from "@skill-learn/lib/hooks/useLocalStorage";
import { usePathname } from 'next/navigation';
import { Button } from "@skill-learn/ui/components/button";
import QuizModal from "@/components/quiz/QuizModal"

const choices = [
  { name: 'Rock', emoji: '✊', beats: 'Scissors' },
  { name: 'Paper', emoji: '✋', beats: 'Rock' },
  { name: 'Scissors', emoji: '✌️', beats: 'Paper' }
];

export default function RockPaperScissors() {
  const [round, setRound] = useLocalStorage("round", 1);
  const [score, setScore] = useLocalStorage("score", 0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const pathname = usePathname();

  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (round >= 3) {
      setIsOpen(true);
      setSelectedCategory("");
    }
  }, [round, pathname]);

  const playGame = (choice) => {
    if (gameOver) return;

    const computer = choices[Math.floor(Math.random() * 3)];
    setPlayerChoice(choice);
    setComputerChoice(computer);

    if (choice.name === computer.name) {
      setResult("It's a Tie!");
    } else if (choice.beats === computer.name) {
      setResult('You Win!');
      setScore(prev => prev + 100);
    } else {
      setResult('AI Wins!');
    }
    setGameOver(true);
  };

  const nextRound = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
    setGameOver(false);
    setRound((prev) => (prev >= 3 ? 3 : prev + 1));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl">
      {!gameOver ? (
        <div className="grid grid-cols-3 gap-6 w-full">
          {choices.map((choice) => (
            <button
              key={choice.name}
              onClick={() => playGame(choice)}
              className="group aspect-square bg-slate-100 hover:bg-white rounded-[2.5rem] shadow-inner hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-brand-teal group-hover:scale-125 transition-transform duration-300">{choice.emoji}</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{choice.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between items-center w-full gap-8 mb-12">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YOU</p>
              <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center text-6xl">
                {playerChoice.emoji}
              </div>
            </div>

            <div className="text-3xl font-black text-slate-200">VS</div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI</p>
              <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center text-6xl">
                {computerChoice.emoji}
              </div>
            </div>
          </div>

          <p className={`text-4xl font-black uppercase tracking-tighter mb-8 animate-scale-in ${result === 'You Win!' ? 'text-cyan-500' : result === 'AI Wins!' ? 'text-rose-400' : 'text-slate-400'
            }`}>
            {result}
          </p>

          <Button
            onClick={nextRound}
            className="h-14 px-10 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-4xl transition-all shadow-lg active:scale-95"
          >
            NEXT MATCH
          </Button>
        </div>
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
