"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Trophy } from "lucide-react";

import QuestionManager from './QuestionManager';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [gameHistory, setGameHistory] = useState({ xWins: 0, oWins: 0, draws: 0 });
  const [difficulty, setDifficulty] = useState('easy');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState(0);

  // Quiz questions database
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [customQuestions, setCustomQuestions] = useState({
    general: [
      {
        question: "What is the maximum number of possible different games of Tic Tac Toe?",
        answers: ["255,168", "362,880", "549,946", "138,240"],
        correctAnswer: 1,
        category: 'general'
      }
    ],
    history: [
      {
        question: "What was Tic Tac Toe originally called?",
        answers: ["Noughts and Crosses", "Three in a Row", "Nine Men's Morris", "The Match Game"],
        correctAnswer: 0,
        category: 'history'
      }
    ],
    strategy: [
      {
        question: "In a standard 3x3 Tic Tac Toe game, how many winning combinations are there?",
        answers: ["6", "7", "8", "9"],
        correctAnswer: 2,
        category: 'strategy'
      }
    ],
    math: [
      {
        question: "What is the minimum number of moves needed for a player to win?",
        answers: ["3", "4", "5", "6"],
        correctAnswer: 2,
        category: 'math'
      }
    ]
  });

  useEffect(() => {
    // fetchGameHistory();
    const savedScore = localStorage.getItem('ticTacToeScore');
    if (savedScore) {
      setPlayerScore(parseInt(savedScore));
    }
  }, []);

  useEffect(() => {
    // Load custom questions from localStorage
    const savedQuestions = localStorage.getItem('customQuestions');
    if (savedQuestions) {
      setCustomQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  const addCustomQuestion = (question) => {
    setCustomQuestions(prev => {
      const newQuestions = {
        ...prev,
        [question.category]: [...(prev[question.category] || []), question]
      };
      localStorage.setItem('customQuestions', JSON.stringify(newQuestions));
      return newQuestions;
    });
  };

  const getRandomQuestion = () => {
    const categoryQuestions = customQuestions[selectedCategory] || [];
    if (categoryQuestions.length === 0) return null;
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
  };

  useEffect(() => {
    if (winner === 'X') {
      const points = difficulty === 'easy' ? 1 : 2;
      updatePlayerScore(points);
    }
    if (winner === 'O' || winner === 'draw') {
      const question = getRandomQuestion();
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      setShowQuizModal(true);
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

  // const fetchGameHistory = async () => {
  //   try {
  //     const response = await fetch("/api/gameHistory");
  //     const data = await response.json();
  //     setGameHistory(data);
  //   } catch (error) {
  //     console.error("Error fetching game history:", error);
  //   }
  // };

  // const updateGameHistory = async (result) => {
  //   try {
  //     const response = await fetch("/api/gameHistory", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ result }),
  //     });

  //     if (response.ok) {
  //       const updatedHistory = await response.json();
  //       setGameHistory(updatedHistory);
  //     }
  //   } catch (error) {
  //     console.error("Error updating game history:", error);
  //   }
  // };

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
      // Random move for easy AI
      const emptySquares = getEmptySquares(newBoard);
      moveIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    } else {
      // Minimax for hard AI
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
      // updateGameHistory(gameWinner);
    } else if (!newBoard.includes(null)) {
      setWinner("draw");
      setWinningLine([]);
      // updateGameHistory("draw");
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
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
          ${board[index] === "X" ? "text-blue-600" : "text-red-600"}
          ${isWinningSquare ? "bg-green-200" : "hover:bg-gray-100"}
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

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsAnswerCorrect(correct);
    if (correct) {
      updatePlayerScore(1);
    }
  };

  // Add a score display component
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

  const closeQuizModal = () => {
    setShowQuizModal(false);
    resetBoard();
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => setShowQuestionManager(!showQuestionManager)}
        >
          {showQuestionManager ? 'Hide' : 'Show'} Question Manager
        </Button>
      </div>

      {showQuestionManager && (
        <QuestionManager onAddQuestion={addCustomQuestion} />
      )} */}

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
              ${winner === 'X' ? 'text-blue-600' :
                winner === 'O' ? 'text-red-600' :
                  winner === 'draw' ? 'text-gray-600' : ''}`}>
              {getStatusMessage()}
            </div>
            <div className="text-sm text-gray-600 text-center">
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
          <p>You are X player. You want to get 3 X in a line in any direction.
          </p>
          <p>If no player gets 3 in a line, game is  a draw.</p></CardContent>
      </Card>

      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl mb-4">
              {winner === 'O' ? 'Better luck next time!' : "It's a draw!"}
            </DialogTitle>
          </DialogHeader>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Category:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Knowledge</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="strategy">Game Strategy</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentQuestion ? (
            <div className="py-4">
              {/* ... (previous question display code) ... */}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No questions available in this category. Add some questions using the Question Manager!
            </div>
          )}

          {/* ... (rest of Dialog content) ... */}
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default TicTacToe;
