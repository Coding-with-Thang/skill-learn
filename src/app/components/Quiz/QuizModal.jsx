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
            {
                question: "What is the chemical symbol for water?",
                options: ["H2O", "O2", "CO2", "HO2"],
                correct: "H2O"
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Earth", "Mars", "Jupiter", "Venus"],
                correct: "Mars"
            },
            {
                question: "What gas do plants absorb from the atmosphere?",
                options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
                correct: "Carbon Dioxide"
            },
            {
                question: "Which element has the atomic number 1?",
                options: ["Oxygen", "Hydrogen", "Helium", "Lithium"],
                correct: "Hydrogen"
            },
            {
                question: "What is the most abundant gas in Earth's atmosphere?",
                options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
                correct: "Nitrogen"
            },
            {
                question: "What type of energy is stored in a stretched rubber band?",
                options: ["Kinetic", "Potential", "Thermal", "Chemical"],
                correct: "Potential"
            },
            {
                question: "Which scientist developed the theory of general relativity?",
                options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
                correct: "Albert Einstein"
            },
            {
                question: "What is the second law of thermodynamics?",
                options: [
                    "Energy cannot be created or destroyed",
                    "Entropy of an isolated system always increases",
                    "For every action, there is an equal and opposite reaction",
                    "Force equals mass times acceleration"
                ],
                correct: "Entropy of an isolated system always increases"
            },
            {
                question: "Which subatomic particle has no electric charge?",
                options: ["Proton", "Electron", "Neutron", "Photon"],
                correct: "Neutron"
            },
            {
                question: "What is the primary function of mitochondria in cells?",
                options: [
                    "Protein synthesis",
                    "Energy production",
                    "Cell division",
                    "DNA replication"
                ],
                correct: "Energy production"
            }
        ],
        "History": [
            { question: "Who was the first President of the United States?", options: ["Abraham Lincoln", "George Washington", "John Adams", "Thomas Jefferson"], correct: "George Washington" },
            { question: "In which year did World War II end?", options: ["1940", "1945", "1950", "1939"], correct: "1945" },
            { question: "What was the name of the ship that carried the Pilgrims to America?", options: ["Titanic", "Santa Maria", "Mayflower", "Endeavour"], correct: "Mayflower" },
            {
                question: "Who was the first Prime Minister of Canada?",
                options: [
                    "Wilfrid Laurier",
                    "John A. Macdonald",
                    "Pierre Trudeau",
                    "Lester B. Pearson"
                ],
                correct: "John A. Macdonald"
            },
            {
                question: "Which year did the United States declare independence from Britain?",
                options: [
                    "1776",
                    "1789",
                    "1812",
                    "1607"
                ],
                correct: "1776"
            },
            {
                question: "What was the main cause of World War I?",
                options: [
                    "The assassination of Archduke Franz Ferdinand",
                    "The rise of communism in Russia",
                    "The invasion of Poland by Germany",
                    "The attack on Pearl Harbor"
                ],
                correct: "The assassination of Archduke Franz Ferdinand"
            },
            {
                question: "Which Canadian city hosted the 1976 Summer Olympics?",
                options: [
                    "Toronto",
                    "Vancouver",
                    "Montreal",
                    "Calgary"
                ],
                correct: "Montreal"
            },
            {
                question: "Who was the U.S. President during the Civil War?",
                options: [
                    "Abraham Lincoln",
                    "George Washington",
                    "Theodore Roosevelt",
                    "Andrew Jackson"
                ],
                correct: "Abraham Lincoln"
            },
            {
                question: "Which ancient civilization built the pyramids of Giza?",
                options: [
                    "Romans",
                    "Greeks",
                    "Egyptians",
                    "Mayans"
                ],
                correct: "Egyptians"
            },
            {
                question: "What year did Canada officially become a country through Confederation?",
                options: [
                    "1867",
                    "1812",
                    "1901",
                    "1776"
                ],
                correct: "1867"
            },
            {
                question: "Which country was the first to land a man on the moon?",
                options: [
                    "Russia",
                    "United States",
                    "China",
                    "United Kingdom"
                ],
                correct: "United States"
            },
            {
                question: "What was the name of the trade route that connected Europe, Africa, and the Americas in the 16th-19th centuries?",
                options: [
                    "Silk Road",
                    "Triangular Trade",
                    "Spice Route",
                    "Pacific Trade Route"
                ],
                correct: "Triangular Trade"
            },
            {
                question: "Which war ended with the Treaty of Versailles in 1919?",
                options: [
                    "World War I",
                    "World War II",
                    "The American Revolutionary War",
                    "The Napoleonic Wars"
                ],
                correct: "World War I"
            }
        ],
        "Sports": [
            {
                question: "Which country won the first-ever FIFA World Cup in 1930?",
                options: [
                    "Brazil",
                    "Germany",
                    "Uruguay",
                    "Argentina"
                ],
                correct: "Uruguay"
            },
            {
                question: "How many players are there in a standard soccer team on the field?",
                options: [
                    "9",
                    "10",
                    "11",
                    "12"
                ],
                correct: "11"
            },
            {
                question: "Which athlete has won the most Olympic gold medals?",
                options: [
                    "Usain Bolt",
                    "Michael Phelps",
                    "Carl Lewis",
                    "Simone Biles"
                ],
                correct: "Michael Phelps"
            },
            {
                question: "In which sport would you perform a slam dunk?",
                options: [
                    "Tennis",
                    "Basketball",
                    "Volleyball",
                    "Baseball"
                ],
                correct: "Basketball"
            },
            {
                question: "Which country has won the most Cricket World Cups?",
                options: [
                    "India",
                    "Australia",
                    "England",
                    "West Indies"
                ],
                correct: "Australia"
            },
            {
                question: "What is the maximum score in a single frame of bowling?",
                options: [
                    "10",
                    "20",
                    "30",
                    "50"
                ],
                correct: "30"
            },
            {
                question: "Which city hosted the 2012 Summer Olympics?",
                options: [
                    "Beijing",
                    "Rio de Janeiro",
                    "London",
                    "Athens"
                ],
                correct: "London"
            },
            {
                question: "What is the regulation length of a marathon?",
                options: [
                    "26.2 miles",
                    "24 miles",
                    "30 miles",
                    "22.5 miles"
                ],
                correct: "26.2 miles"
            },
            {
                question: "Which sport is known as the 'King of Sports'?",
                options: [
                    "Soccer",
                    "Basketball",
                    "Tennis",
                    "Baseball"
                ],
                correct: "Soccer"
            },
            {
                question: "Who is the only athlete to play in both a Super Bowl and a World Series?",
                options: [
                    "Bo Jackson",
                    "Deion Sanders",
                    "Michael Jordan",
                    "Tom Brady"
                ],
                correct: "Deion Sanders"
            },
            {
                question: "How many bases are there in baseball?",
                options: [
                    "3",
                    "4",
                    "5",
                    "6"
                ],
                correct: "4"
            },
            {
                question: "What is the name of the trophy awarded to the winner of the NHL's championship?",
                options: [
                    "The Lombardi Trophy",
                    "The Stanley Cup",
                    "The Claret Jug",
                    "The Heisman Trophy"
                ],
                correct: "The Stanley Cup"
            },
            {
                question: "Which boxer is known as 'The Greatest' and 'The People's Champion'?",
                options: [
                    "Mike Tyson",
                    "Floyd Mayweather",
                    "Muhammad Ali",
                    "Joe Frazier"
                ],
                correct: "Muhammad Ali"
            },
            {
                question: "Which sport uses a shuttlecock?",
                options: [
                    "Tennis",
                    "Badminton",
                    "Squash",
                    "Volleyball"
                ],
                correct: "Badminton"
            },
            {
                question: "Which country won the most medals at the 2020 Tokyo Olympics?",
                options: [
                    "China",
                    "United States",
                    "Japan",
                    "Great Britain"
                ],
                correct: "United States"
            }
        ],
        "Soft Skills": [
            {
                question: "Which of the following is a key component of active listening?",
                options: [
                    "Interrupting to share your opinion",
                    "Maintaining eye contact and nodding",
                    "Thinking about your response while the other person is talking",
                    "Ignoring nonverbal cues"
                ],
                correct: "Maintaining eye contact and nodding"
            },
            {
                question: "What is the best way to handle constructive criticism?",
                options: [
                    "Ignore it and continue as before",
                    "Take it personally and become defensive",
                    "Listen, reflect, and apply the feedback",
                    "Argue with the person giving feedback"
                ],
                correct: "Listen, reflect, and apply the feedback"
            },
            {
                question: "Which soft skill is most important for resolving conflicts?",
                options: [
                    "Assertiveness",
                    "Avoidance",
                    "Aggression",
                    "Stubbornness"
                ],
                correct: "Assertiveness"
            },
            {
                question: "Which of the following best demonstrates emotional intelligence?",
                options: [
                    "Ignoring emotions and focusing only on logic",
                    "Understanding and managing your own emotions while empathizing with others",
                    "Reacting impulsively based on your feelings",
                    "Avoiding emotional conversations"
                ],
                correct: "Understanding and managing your own emotions while empathizing with others"
            },
            {
                question: "What is a key trait of a good team player?",
                options: [
                    "Working alone to avoid conflicts",
                    "Blaming others for mistakes",
                    "Collaborating and supporting teammates",
                    "Trying to outshine your teammates"
                ],
                correct: "Collaborating and supporting teammates"
            },
            {
                question: "What is the best way to improve time management skills?",
                options: [
                    "Procrastinate and rush to meet deadlines",
                    "Set priorities and create a schedule",
                    "Wait until inspiration strikes",
                    "Work without a plan and handle tasks randomly"
                ],
                correct: "Set priorities and create a schedule"
            },
            {
                question: "Which of the following is an example of effective communication?",
                options: [
                    "Using jargon that others may not understand",
                    "Speaking clearly and adapting your message to your audience",
                    "Talking more than you listen",
                    "Avoiding feedback from others"
                ],
                correct: "Speaking clearly and adapting your message to your audience"
            },
            {
                question: "How can you demonstrate a positive attitude at work?",
                options: [
                    "Complaining about challenges",
                    "Staying motivated and being solution-oriented",
                    "Ignoring problems and pretending everything is fine",
                    "Avoiding extra responsibilities"
                ],
                correct: "Staying motivated and being solution-oriented"
            },
            {
                question: "What is a good strategy for handling workplace stress?",
                options: [
                    "Ignoring stress and pushing through",
                    "Taking breaks, prioritizing tasks, and practicing mindfulness",
                    "Blaming others for your stress",
                    "Quitting whenever things get tough"
                ],
                correct: "Taking breaks, prioritizing tasks, and practicing mindfulness"
            },
            {
                question: "Which quality is essential for leadership?",
                options: [
                    "Commanding others without listening",
                    "Inspiring and guiding others with a clear vision",
                    "Doing all the work yourself",
                    "Avoiding feedback and criticism"
                ],
                correct: "Inspiring and guiding others with a clear vision"
            }
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
