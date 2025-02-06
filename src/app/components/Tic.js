"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Tic = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [gameHistory, setGameHistory] = useState({
    xWins: 0,
    oWins: 0,
    draws: 0,
  });

  useEffect(() => {
    fetchGameHistory();
  }, []);

  const fetchGameHistory = async () => {
    try {
      const response = await fetch("/api/gameHistory");
      const data = await response.json();
      setGameHistory(data);
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
  };

  const updateGameHistory = async (result) => {
    try {
      const response = await fetch("/api/gameHistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result }),
      });

      if (response.ok) {
        const updatedHistory = await response.json();
        setGameHistory(updatedHistory);
      }
    } catch (error) {
      console.error("Error updating game history:", error);
    }
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
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

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const { winner: gameWinner, line } = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      updateGameHistory(gameWinner);
    } else if (!newBoard.includes(null)) {
      setWinner("draw");
      setWinningLine([]);
      updateGameHistory("draw");
    }

    setIsXNext(!isXNext);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  const renderSquare = (index) => {
    const isWinningSquare = winningLine.includes(index);

    return (
      <button
        className={`h-16 w-16 border border-gray-300 flex items-center justify-center text-2xl font-bold
          ${board[index] === "X" ? "text-blue-600" : "text-red-600"}
          ${isWinningSquare ? "bg-green-200" : "hover:bg-gray-100"}
          transition-colors duration-200`}
        onClick={() => handleClick(index)}
        disabled={winner || board[index]}
      >
        {board[index]}
      </button>
    );
  };

  const getStatusMessage = () => {
    if (winner === "draw") return "It's a draw!";
    if (winner) return `Winner: ${winner}`;
    return `Next player: ${isXNext ? "X" : "O"}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Tic Tac Toe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div
            className={`text-center text-xl font-bold mb-2 
            ${
              winner === "X"
                ? "text-blue-600"
                : winner === "O"
                ? "text-red-600"
                : winner === "draw"
                ? "text-gray-600"
                : ""
            }`}
          >
            {getStatusMessage()}
          </div>
          <div className="text-sm text-gray-600 text-center">
            <p>X Wins: {gameHistory.xWins}</p>
            <p>O Wins: {gameHistory.oWins}</p>
            <p>Draws: {gameHistory.draws}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mb-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderSquare(index))}
        </div>

        <div className="text-center">
          <Button
            onClick={resetBoard}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Clear Board
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Tic;
