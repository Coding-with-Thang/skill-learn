"use client";

import { useState, useEffect } from "react";
import useLocalStorage from "../../../lib/hooks/useLocalStorage";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Trophy } from "lucide-react";
import QuizModal from "../../components/Quiz/QuizModal"

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [gameHistory, setGameHistory] = useState({ xWins: 0, oWins: 0, draws: 0 });
  const [difficulty, setDifficulty] = useState('easy');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState(0);

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

  //Tic Tac Toe Logic
  useEffect(() => {
    const savedScore = localStorage.getItem('ticTacToeScore');
    if (savedScore) {
      setPlayerScore(parseInt(savedScore));
    }
  }, []);

  useEffect(() => {
    if (winner === 'X') {
      const points = difficulty === 'easy' ? 1 : 2;
      updatePlayerScore(points);
    }
    if (winner === 'O' || winner === 'draw') {
      resetBoard()
    }
  }, [winner]);

  useEffect(() => {
    if (!winner && !isXNext) {
      setIsAIThinking(true);
      setTimeout(() => {
        makeAIMove();
        setIsAIThinking(false);
      }, 500);
    }
  }, [board, isXNext, winner]);

  const updatePlayerScore = (points) => {
    setPlayerScore(prevScore => {
      const newScore = prevScore + points;
      localStorage.setItem('ticTacToeScore', newScore.toString());
      return newScore;
    });
    setLastScoreChange(points);
    setShowScoreAnimation(true);
    setTimeout(() => setShowScoreAnimation(false), 1500);
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
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

  const getEmptySquares = (squares) => {
    return squares
      .map((square, index) => (square === null ? index : null))
      .filter((index) => index !== null);
  };

  const makeAIMove = () => {
    const newBoard = [...board];
    let moveIndex;

    if (difficulty === "easy") {
      //Random move for easy AI
      const emptySquares = getEmptySquares(newBoard);
      moveIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    } else {
      //Minimax for hard AI
      let bestScore = -Infinity;
      moveIndex = -1;

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

    if (moveIndex !== -1) {
      handleMove(moveIndex);
    }
  };

  const handleMove = (index) => {
    if (board[index] || winner || isAIThinking) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const { winner: gameWinner, line } = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
    } else if (!newBoard.includes(null)) {
      setWinner("draw");
      setWinningLine([]);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
    setRound((prev) => (prev >= 3 ? 3 : prev + 1))
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    resetBoard();
  };

  const renderSquare = (index) => {
    const isWinningSquare = winningLine.includes(index);

    return (
      <button
        className={`h-16 w-16 border border-gray-300 flex items-center justify-center text-2xl font-bold
                          ${board[index] === "X" ? "text-primary" : "text-error"}
                ${isWinningSquare ? "bg-success/20" : "hover:bg-accent"}
          ${isAIThinking ? "cursor-not-allowed" : "cursor-pointer"}
          transition-colors duration-200`}
        onClick={() => handleMove(index)}
        disabled={winner || board[index] || !isXNext || isAIThinking}
      >
        {board[index]}
      </button>
    );
  };

  const getStatusMessage = () => {
    if (isAIThinking) return "AI is thinking...";
    if (winner === "draw") return "It's a draw!";
    if (winner) return `Winner: ${winner}`;
    return `${isXNext ? "Your turn (X)" : "AI turn (O)"}`;
  };

  //Add a score display component
  const ScoreDisplay = () => (
    <div className="relative flex items-center justify-center mb-4 text-center">
      <div className="flex items-center gap-2 text-xl font-bold">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <span>Score: {playerScore}</span>
      </div>
      {showScoreAnimation && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-green-500 font-bold animate-bounce">
          +{lastScoreChange}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className='my-5'>
        <p className="text-xl font-semibold">Round: {round}</p>
        {/* <p className="text-xl font-semibold">Score: {score}</p> */}
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Tic Tac Toe</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreDisplay />

          <div className="mb-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">AI Difficulty:</label>
              <Select value={difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (1 point per win)</SelectItem>
                  <SelectItem value="hard">Hard (2 points per win)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`text-center text-xl font-bold mb-2 
              ${winner === 'X' ? 'text-primary' :
                winner === 'O' ? 'text-error' :
                  winner === 'draw' ? 'text-muted-foreground' : ''}`}>
              {getStatusMessage()}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <p>Player (X) Wins: {gameHistory.xWins}</p>
              <p>AI (O) Wins: {gameHistory.oWins}</p>
              <p>Draws: {gameHistory.draws}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-4">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) =>
              renderSquare(index))}
          </div>

          <div className="text-center">
            <Button
              onClick={resetBoard}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:bg-primary-hover"
            >
              New Game
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Rules:</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are X player. You want to get 3 X in a line in any direction.</p>
          <p>If no player gets 3 in a line, game is a draw.</p>
        </CardContent>
      </Card>

      <QuizModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setRound={setRound}
        setScore={setScore}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  )
}
export default TicTacToe;
