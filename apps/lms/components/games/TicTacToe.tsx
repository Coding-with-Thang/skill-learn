"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocalStorage } from "@skill-learn/lib/hooks/useLocalStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@skill-learn/ui/components/select";
import { X, Circle } from "lucide-react";
import QuizModal from "@/components/quiz/QuizModal"

type SquareValue = "X" | "O" | null;

const LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const calculateWinner = (squares: SquareValue[]): { winner: SquareValue; line: number[] } => {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: [] };
};

const minimax = (squares, depth, isMaximizing) => {
  const { winner } = calculateWinner(squares);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (!squares.includes(null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = "O";
        const score = minimax(squares, depth + 1, false);
        squares[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = "X";
        const score = minimax(squares, depth + 1, true);
        squares[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<"X" | "O" | "draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [isAIThinking, setIsAIThinking] = useState(false);

  const [round, setRound] = useLocalStorage("round", 1);
  const [score, setScore] = useLocalStorage("score", 0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const isAIMovingRef = useRef(false);
  const difficultyRef = useRef(difficulty);
  const winnerRef = useRef(winner);
  const isXNextRef = useRef(isXNext);

  useEffect(() => {
    difficultyRef.current = difficulty;
    winnerRef.current = winner;
    isXNextRef.current = isXNext;
  }, [difficulty, winner, isXNext]);

  const handleDifficultyChange = useCallback((v) => {
    if (v === "easy" || v === "hard") setDifficulty(v);
  }, []);

  useEffect(() => {
    if (round >= 3) {
      setIsOpen(true);
      setSelectedCategory("");
    }
  }, [round]);

  const resetBoard = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
    setRound((prev) => (prev >= 3 ? 3 : prev + 1));
  }, [setRound]);

  const handleMove = useCallback((index) => {
    if (board[index] || winner || isAIThinking) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);
  }, [board, winner, isAIThinking]);

  const makeAIMove = useCallback(() => {
    if (winnerRef.current || isXNextRef.current) return;
    isAIMovingRef.current = true;
    const currentDifficulty = difficultyRef.current;

    setTimeout(() => {
      setBoard(currentBoard => {
        const newBoard = [...currentBoard];
        let moveIndex = -1;

        if (currentDifficulty === "easy") {
          const empty = newBoard.map((s, i) => s === null ? i : null).filter((i): i is number => i !== null);
          if (empty.length > 0) moveIndex = empty[Math.floor(Math.random() * empty.length)] ?? moveIndex;
        } else {
          let bestScore = -Infinity;
          for (let i = 0; i < newBoard.length; i++) {
            if (!newBoard[i]) {
              newBoard[i] = "O";
              const score = minimax(newBoard, 0, false);
              newBoard[i] = null;
              if (score > bestScore) {
                bestScore = score;
                moveIndex = i;
              }
            }
          }
        }

        if (moveIndex !== -1) newBoard[moveIndex] = "O";
        return newBoard;
      });
      setIsXNext(true);
      setIsAIThinking(false);
      isAIMovingRef.current = false;
    }, 600);
  }, []);

  useEffect(() => {
    if (!isXNext && !winner && !isAIThinking) {
      setIsAIThinking(true);
      makeAIMove();
    }
  }, [isXNext, winner, isAIThinking, makeAIMove]);

  useEffect(() => {
    const { winner: gameWinner, line } = calculateWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      if (gameWinner === 'X') setScore(prev => prev + (difficulty === 'easy' ? 100 : 250));
    } else if (!board.includes(null)) {
      setWinner("draw");
    }
  }, [board, difficulty, setScore]);

  const renderSquare = (index) => {
    const value = board[index];
    const isWinner = winningLine.includes(index);

    return (
      <button
        key={index}
        className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-inner group
          ${value ? 'bg-white shadow-md' : 'bg-slate-50 hover:bg-white hover:shadow-lg'}
          ${isWinner ? ' ring-4 ring-cyan-200 ring-offset-4' : ''}
          ${isAIThinking ? 'cursor-wait' : ''}`}
        onClick={() => handleMove(index)}
        disabled={winner || value || !isXNext || isAIThinking}
      >
        {value === 'X' && <X className="w-12 h-12 text-cyan-500 stroke-[4px] animate-scale-in" />}
        {value === 'O' && <Circle className="w-10 h-10 text-slate-400 stroke-[4px] animate-scale-in" />}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex items-center gap-4">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Difficulty</span>
        <Select defaultValue="easy" onValueChange={handleDifficultyChange}>
          <SelectTrigger className="w-32 rounded-xl border-none bg-slate-100 font-bold text-slate-600">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-xl">
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-6 bg-slate-200/50 p-4 md:p-6 rounded-[2.5rem] shadow-inner">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderSquare)}
      </div>

      <div className="mt-8 text-center min-h-8">
        {winner ? (
          <p className={`text-xl font-black uppercase tracking-widest animate-bounce ${winner === 'X' ? 'text-cyan-500' : winner === 'O' ? 'text-rose-400' : 'text-slate-400'}`}>
            {winner === 'draw' ? "It's a Draw!" : winner === 'X' ? "You Won!" : "AI Won!"}
          </p>
        ) : isAIThinking ? (
          <p className="text-slate-300 font-bold animate-pulse uppercase tracking-widest text-sm">AI is thinking...</p>
        ) : (
          <p className="text-cyan-500/50 font-bold uppercase tracking-widest text-sm">Your Turn</p>
        )}
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
};

export default TicTacToe;
