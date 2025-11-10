"use client"

import { useState, useEffect } from 'react';
import useLocalStorage from "../../../lib/hooks/useLocalStorage";
import { usePathname } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizModal from "../../components/Quiz/QuizModal"
const MemoryGame = () => {

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
  }, [round, pathname, setIsOpen, setSelectedCategory]);

  //Emoji Match Game
  const allEmojis = ['🌟', '🎨', '🎮', '🎲', '🎸', '🎭', '🎪', '🎯', '🎩', '🎬', '🎨', '🎭', '🎪', '🎯', '🎩', '🎬', '🎸', '🎲', '🎮', '🌟', '🎪', '🎯', '🎩', '🎬'];

  const difficulties = {
    easy: { pairs: 6, cols: 3 },
    medium: { pairs: 10, cols: 5 },
    hard: { pairs: 12, cols: 6 }
  };

  const [difficulty, setDifficulty] = useState('easy');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    setupInitialBoard(difficulty);
  }, [difficulty]);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setGameOver(true);
      setIsPlaying(false);
      setGameResult('Time\'s up!');
    }
    return () => clearInterval(timer);
  }, [timeLeft, isPlaying]);

  const setupInitialBoard = (diff) => {
    const pairCount = difficulties[diff].pairs;
    const selectedEmojis = allEmojis.slice(0, pairCount);
    const gameEmojis = [...selectedEmojis, ...selectedEmojis];
    const shuffled = gameEmojis.sort(() => Math.random() - 0.5);
    setCards(shuffled.map((emoji, index) => ({ id: index, emoji })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
    setTimeLeft(60);
    setIsPlaying(false);
    setGameStarted(false);
    setGameResult('');
  };

  const initializeGame = (diff) => {
    setupInitialBoard(diff);
    setIsPlaying(true);
    setGameStarted(true);
  };

  const newGame = () => {
    if (round >= 3) {
      setGameOver(true);
      setTimeLeft(0);
      setIsPlaying(false);
      setGameStarted(false);
      setGameResult('');
    } else {
      setRound((prev) => (prev >= 3 ? 3 : prev + 1))
      initializeGame(difficulty)
    }
  }

  const handleCardClick = (id) => {
    if (!gameStarted) {
      setIsPlaying(true);
      setGameStarted(true);
    }

    if (!isPlaying || flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setGameOver(true);
          setIsPlaying(false);
          setGameResult('Congratulations! You won!');
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className='my-5'>
        <p className="text-xl font-semibold">Round: {round}</p>
        {/* <p className="text-xl font-semibold">Score: {score}</p> */}
      </div>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">Memory Game</h2>
        <div className="flex justify-center gap-4 items-center mb-4">
          <p className="text-muted-foreground">Moves: {moves}</p>
          <p className={`font-bold ${timeLeft <= 10 ? 'text-error' : 'text-info'}`}>
            Time: {timeLeft}s
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {Object.keys(difficulties).map((diff) => (
            <Button
              key={diff}
              variant={difficulty === diff ? "default" : "outline"}
              onClick={() => {
                setDifficulty(diff);
                setGameStarted(false);
                setIsPlaying(false);
              }}
              className="capitalize"
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      <CardContent className={`grid gap-4`}
        style={{
          gridTemplateColumns: `repeat(${difficulties[difficulty].cols}, minmax(0, 1fr))`
        }}>
        {cards.map(({ id, emoji }) => (
          <Button
            key={id}
            variant="outline"
            className={`h-24 text-4xl ${flipped.includes(id) || matched.includes(id)
              ? 'bg-info/20'
              : 'bg-muted'
              }`}
            onClick={() => handleCardClick(id)}
          >
            {(flipped.includes(id) || matched.includes(id)) ? emoji : '?'}
          </Button>
        ))}
      </CardContent>

      <div className="mt-4 text-center">
        <Button
          onClick={newGame}
          disabled={round >= 3}
        >
          New Game
        </Button>
      </div>

      <QuizModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setRound={setRound}
        setScore={setScore}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </Card>
  );
};

export default MemoryGame;
