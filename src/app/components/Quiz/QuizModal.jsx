'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import clsx from "clsx";

export default function QuizModal({ isOpen, setIsOpen, setRound, setScore, selectedCategory, setSelectedCategory }) {
    const [randomQuestion, setRandomQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [answered, setAnswered] = useState(false);

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

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory("");
            setRandomQuestion(null);
        }
    }, [isOpen]);

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
            setRound(1);
            setIsOpen(false);
        } else {
            generateRandomQuestion(selectedCategory);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md mx-auto rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle>Select a Quiz Category</DialogTitle>
                </DialogHeader>
                {!randomQuestion ? (
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
                ) : (
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
            </DialogContent>
        </Dialog>
    );
}
