"use client"

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from "@skill-learn/lib/hooks/useLocalStorage.js";
import { usePathname } from 'next/navigation';
import { Button } from "@skill-learn/ui/components/button";
import QuizModal from "@/components/quiz/QuizModal"

const allEmojis = ['🌟', '🎨', '🎮', '🎲', '🎸', '🎭', '🎪', '🎯', '🎩', '🎬', '🧩', '🚀', '🌈', '💎', '🔥', '🍦'];

const difficulties = {
  easy: { pairs: 6, cols: 3 },
  medium: { pairs: 8, cols: 4 },
  hard: { pairs: 12, cols: 4 }
};

const MemoryGame = () => {
  const [round, setRound] = useLocalStorage("round", 1);
  const [score, setScore] = useLocalStorage("score", 0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const pathname = usePathname();

  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (round >= 3) {
      setIsOpen(true);
      setSelectedCategory("");
    }
  }, [round, pathname]);

  const setupInitialBoard = useCallback((diff) => {
    const pairCount = difficulties[diff].pairs;
    const selectedEmojis = allEmojis.slice(0, pairCount);
    const gameEmojis = [...selectedEmojis, ...selectedEmojis];
    const shuffled = gameEmojis.sort(() => Math.random() - 0.5);
    setCards(shuffled.map((emoji, index) => ({ id: index, emoji })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
    setTimeLeft(diff === 'easy' ? 60 : diff === 'medium' ? 90 : 120);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    setupInitialBoard(difficulty);
  }, [difficulty, setupInitialBoard]);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setGameOver(true);
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isPlaying]);

  const handleCardClick = (id) => {
    if (gameOver || flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    if (!isPlaying) setIsPlaying(true);

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched(prev => {
          const newMatched = [...prev, first, second];
          if (newMatched.length === cards.length) {
            setGameOver(true);
            setIsPlaying(false);
            setScore(prevScore => prevScore + (difficulty === 'easy' ? 500 : 1000));
          }
          return newMatched;
        });
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <div className="flex justify-between w-full mb-8 text-sm font-bold uppercase tracking-widest text-slate-400">
        <div>Moves: <span className="text-slate-800 ml-1">{moves}</span></div>
        <div className={timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-cyan-500'}>
          Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {Object.keys(difficulties).map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${difficulty === diff ? 'bg-cyan-400 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {diff}
          </button>
        ))}
      </div>

      <div className="grid gap-4 w-full"
        style={{
          gridTemplateColumns: `repeat(${difficulties[difficulty].cols}, minmax(0, 1fr))`
        }}>
        {cards.map(({ id, emoji }) => {
          const isFlipped = flipped.includes(id) || matched.includes(id);
          const isMatched = matched.includes(id);

          return (
            <button
              key={id}
              onClick={() => handleCardClick(id)}
              className={`aspect-square rounded-4xl md:rounded-3xl flex items-center justify-center text-4xl shadow-sm transition-all duration-500 transform
                ${isFlipped ? 'bg-white [transform:rotateY(180deg)]' : 'bg-slate-100 hover:bg-white hover:scale-105'}
                ${isMatched ? 'opacity-50 grayscale-[0.5]' : ''}
              `}
            >
              <span className={isFlipped ? '[transform:rotateY(180deg)]' : 'hidden'}>
                {emoji}
              </span>
              {!isFlipped && <div className="w-4 h-4 rounded-full bg-slate-200" />}
            </button>
          );
        })}
      </div>

      {gameOver && (
        <div className="mt-12 text-center animate-fade-in">
          <h3 className="text-2xl font-black text-slate-800 mb-4">
            {matched.length === cards.length ? 'AWESOME!' : 'TIME UP!'}
          </h3>
          <button
            onClick={() => {
              setRound(prev => (prev >= 3 ? 3 : prev + 1));
              setupInitialBoard(difficulty);
            }}
            className="px-8 py-3 bg-cyan-400 text-white font-bold rounded-xl shadow-lg hover:bg-cyan-500 active:scale-95 transition-all"
          >
            NEXT ROUND
          </button>
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
};

export default MemoryGame;
