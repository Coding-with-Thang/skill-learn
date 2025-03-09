"use client"

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { useQuizStartStore } from "@/app/store/quizStore"
import { Button } from "@/components/ui/button"
import { ArrowBigRightDash } from 'lucide-react';
import { CircleCheckBig } from 'lucide-react';
export default function QuizScreenPage() {

  const { selectedQuiz, questionCount, setQuizResponses } = useQuizStartStore()

  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  if (!selectedQuiz) {
    router.push("/training")
    return null
  }

  //Shuffle Questions on Component Amount (Quiz Started)
  useEffect(() => {
    const filteredQuestions = selectedQuiz.questions.slice(0, questionCount)

    console.log("Question Count: ", questionCount)

    setShuffledQuestions(shuffleArray([...filteredQuestions]));
  }, [selectedQuiz])

  //Shuffle options when the active changes
  useEffect(() => {
    if (shuffledQuestions[currentIndex]) {
      setShuffledOptions(shuffleArray([...shuffledQuestions[currentIndex].options]))
    }
  }, [shuffledQuestions, currentIndex])

  //Fisher-Yates Shuffle Algorithm
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; --i) {
      // generate a random index between 0 and i
      const j = Math.floor(Math.random() * (i + 1));

      // swap elements --> destructuring assignment
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  };
  const handleActiveQuestion = (option) => {
    if (!shuffledQuestions[currentIndex]) return;

    const response = {
      questionId: shuffledQuestions[currentIndex].id,
      optionId: option.id,
      isCorrect: option.isCorrect
    }

    setResponses((prev) => {
      //check if the response already exists
      const existingIndex = prev.findIndex((res) => {
        return res.questionId === response.questionId
      })

      //update the response if it exists
      if (existingIndex !== -1) {
        //update the response
        const updatedResponses = [...prev]
        updatedResponses[existingIndex] = response;
        return updatedResponses;
      } else {
        return [...prev, response]
      }
    })
    //Set the active question
    setActiveQuestion(option)
  }

  //Progresses the active Question
  const handleNextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)

      //reset active question
      setActiveQuestion(null)
    } else {
      router.push('/quiz/results')
    }
  }

  const handleFinishQuiz = () => {
    console.log("Finish")
  }

  return (
    <main className="py-[2.5rem] px-[5rem] min-h-screen">
      {shuffledQuestions[currentIndex] ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            <p className="py-3 px-6 border-2 text-xl font-bold self-end rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
              Question: <span className="text-2xl">{currentIndex + 1}</span> /{" "}
              <span className="text-xl">{shuffledQuestions.length}</span>
            </p>
            <h1 className="mt-4 px-10 text-5xl font-bold text-center">
              {shuffledQuestions[currentIndex].text}
            </h1>
          </div>

          {/* Options */}
          <div className="pt-14 space-y-4">
            {shuffledOptions.map((option, index) => (
              <button
                key={index}
                className={`relative group py-3 w-full text-center border-2 text-lg font-semibold rounded-lg
                    hover:bg-[rgba(0,0,0,0.03)] transition-all duration-200 ease-in-out
                ${option.text === activeQuestion?.text
                    ? "bg-green-100 border-green-500 shadow-[0_.3rem_0_0_#51bf22] hover:bg-green-100 hover:border-green-500"
                    : "shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
                  }
                    `}
                onClick={() => handleActiveQuestion(option)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-lg">No questions found for this quiz</p>
      )}

      <div className="w-full py-[4rem] border-t-2 flex items-center justify-center">
        <Button
          className="px-10 py-6 font-bold text-xl rounded-xl"
          variant="destructive"
          onClick={() => {
            if (currentIndex < shuffledQuestions.length - 1) {
              if (activeQuestion?.id) {
                handleNextQuestion();
              } else {
                const sound = new Audio("/sounds/error.mp3");
                sound.play();
                toast.error("Please select an option to continue");
              }
            } else {
              if (activeQuestion?.id) {
                handleFinishQuiz();
              } else {
                const sound = new Audio("/sounds/error.mp3");
                sound.play();
                toast.error("Please select an option to continue");
              }
            }
          }}
        >
          {currentIndex < shuffledQuestions.length - 1 ?
            (<span className="flex items-center gap-2"><ArrowBigRightDash /> Next</span>) :
            (<span className="flex items-center gap-2"><CircleCheckBig /> Finish</span>)
          }
        </Button>
      </div>
    </main>
  );
}