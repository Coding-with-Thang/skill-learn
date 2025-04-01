"use client"

import { useState } from 'react';
import useLocalStorage from "../../../lib/hooks/useLocalStorage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import clsx from "clsx";
export default function NumberGuessingGame() {

  //Local Storage
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Select category, Step 2: Show question
  const [selectedCategory, setSelectedCategory] = useState("");
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answered, setAnswered] = useState(false); // Tracks if user has answered

  //Random Quiz Question
  const quizCategories = {
    "Science": [
      { question: "What is the chemical symbol for water?", options: ["H2O", "O2", "CO2", "H2"], correct: "H2O" },
      { question: "What planet is known as the Red Planet?", options: ["Earth", "Mars", "Venus", "Jupiter"], correct: "Mars" },
      { question: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: "Carbon Dioxide" }
    ],
    "History": [
      { question: "Who was the first President of the United States?", options: ["Abraham Lincoln", "George Washington", "John Adams", "Thomas Jefferson"], correct: "George Washington" },
      { question: "In which year did World War II end?", options: ["1940", "1945", "1950", "1939"], correct: "1945" },
      { question: "What was the name of the ship that carried the Pilgrims to America?", options: ["Titanic", "Santa Maria", "Mayflower", "Endeavour"], correct: "Mayflower" }
    ],
    "Sports": [
      { question: "How many players are on a standard soccer team?", options: ["9", "10", "11", "12"], correct: "11" },
      { question: "What sport uses a shuttlecock?", options: ["Tennis", "Badminton", "Squash", "Table Tennis"], correct: "Badminton" },
      { question: "Which country won the first FIFA World Cup?", options: ["Germany", "Brazil", "Argentina", "Uruguay"], correct: "Uruguay" }
    ]
  };

  function handleRoundChange() {
    setRound((prevRound) => {
      const newRound = prevRound >= 3 ? 1 : prevRound + 1;
      if (newRound === 3) {
        setIsOpen(true);
        setSelectedCategory("");
        setRandomQuestion(null);
        setAnswered(false);
      }
      return newRound;
    });
  }

  function handleCategoryChange(category) {
    setSelectedCategory(category);
  }

  function confirmCategory(category) {
    setSelectedCategory(category);
    generateRandomQuestion(category);
  }

  function generateRandomQuestion(category) {
    const questions = quizCategories[category];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    setRandomQuestion(randomQ);
    setSelectedAnswer("");
    setAnswered(false);
  }

  function submitAnswer() {
    if (!selectedAnswer) return;
    const isCorrect = selectedAnswer === randomQuestion.correct;
    setAnswered(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      generateRandomQuestion(selectedCategory);
    }
  }

  function closeModal() {
    setIsOpen(false); // Close modal
    setRound(1); // Reset round to 1
    setSelectedAnswer(""); // Reset selected answer
    setAnswered(false); // Reset answered state
  }

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
        <Button onClick={handleRoundChange}>Next Round</Button>
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
          <p2>2. Guess the right number and WIN!</p2>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md mx-auto rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Select a Quiz Category</DialogTitle>
          </DialogHeader>
          <Select onValueChange={confirmCategory}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(quizCategories).map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>

      {randomQuestion && (
        <div>
          <p className="text-md font-semibold">{randomQuestion.question}</p>
          <RadioGroup onValueChange={setSelectedAnswer} className="mt-3 space-y-2">
            {randomQuestion.options.map((option) => (
              <Label key={option} className={clsx(
                "flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all",
                answered && option === randomQuestion.correct && "bg-green-500 text-white",
                answered && option === selectedAnswer && option !== randomQuestion.correct && "bg-red-500 text-white",
                !answered && "hover:bg-gray-200"
              )}>
                <RadioGroupItem value={option} disabled={answered} />
                <span>{option}</span>
              </Label>
            ))}
          </RadioGroup>
          <Button onClick={submitAnswer} disabled={!selectedAnswer || answered} className="mt-4 w-full">
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  );
}
