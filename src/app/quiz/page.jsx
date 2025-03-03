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

  const { currentIndex, setCurrentIndex } = useState(0)
  const { activeQuestion, setActiveQuestion } = useState(null)
  const { responses, setResponses } = useState([])
  const { shuffledQuestions, setShuffledQuestions } = useState([])
  const { shuffledOptions, setShuffledOptions } = useState([])

  if (!selectedQuiz) {
    router.push("/")
    return null
  }

  //Shuffle Questions on Component Amount (Quiz Started)
  useEffect(() => {
    const filteredQuestions = selectedQuiz.questions.slice(0, questionCount)

    setShuffledQuestions(shuffleArray(...filteredQuestions))
    console.log("Shuffled Questions:", shuffledQuestions)
  }, [selectedQuiz])

  //Shuffle options when the active changes
  useEffect(() => {
    if (shuffledQuestions[currentIndex]) {
      setShuffledOptions(shuffleArray([...shuffledQuestions[currentIndex].options]))
    }
  }, [shuffledQuestions, currentIndex])

  //Fisher-Yates Shuffle Algorithm
  const shuffleArray = () => {
    for (let i = array.length - 1; i > 0; i--) {
      //generate a random index between 0 and i
      const j = Math.floor(Math.random() * (i + 1))

      //swap elements, array[i] and array[j]
      [array[i], array[j]] = [array[j], array[i]]
    }

    return array
  }

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
    <div className="py-[2.5rem]">
      //Question
      {shuffledQuestions[currentIndex] ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            <p className="py-3 px-6 border-2 text-xl font-bold self-end rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
              Question: <span className="text-xl">{currentIndex + 1}</span>
              / {" "}
              <span>{shuffledQuestions.length}</span>
            </p>
            <h1 className="mt-4 px-10 text-5xl font-bold text-center">
              {shuffledQuestions[currentIndex].text}
            </h1>
          </div>

          //Options
          <div className="pt-14 space-y-4">
            {shuffledOptions.map((option, index) => (
              <Button
                key={index}
                className={`relative group py-3 w-full text-center border-2 text-lg font-semibold rounded-lg hover:bg-[rgba(0,0,0,0.03)] transition-all duration-200 ease-in-out
              ${option.text === activeQuestion?.text ?
                    "bg-green-100 border-green-500 shadow-[0_.3rem_0_0_#51bf22] hover:bg-green-100 hover:border-green-500"
                    :
                    "shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
                  }
                  `}
                onClick={() => handleActionQuestion(option)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </div>
      )
        :
        (
          <p className="text-lg">No questions found for this quiz</p>
        )}

      <div className="w-full py-[4rem] fixed bottom-0 left-0 border-t-2 flex items-center justify-center">
        <Button
          className="px-10 py-6 font-bold text-white text-xl rounded-xl"
          onClick={() => {
            if (currentIndex < shuffledQuestions.length - 1) {
              if (activeQuestion?.id) {
                handleNextQuestion()
              } else {
                const sound = new Audio("/sounds/error.mp3")
                sound.play()
                //TODO: add toast
              }
            } else {
              if (activeQuestion?.id) {
                handleFinishQuiz()
              } else {
                const sound = new Audio("/sounds/error.mp3")
                sound.play()
                //TODO: add toast
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
    </div >
  )
}