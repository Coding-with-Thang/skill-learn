"use client"

import { Image } from "next/image"
import { useQuizStartStore } from '@/app/store/quizStore'
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { MessageCircleQuestion } from 'lucide-react';

import { useRouter } from "next/navigation";
export default function QuizCard({ quiz }) {
  const router = useRouter();
  const imageSrc = false

  const config = useQuizStartStore(state => state.config)
  const setSelectedQuiz = useQuizStartStore(state => state.setSelectedQuiz)

  const handleClick = () => {
    console.log("Quiz: ", quiz)
    setSelectedQuiz(quiz);
    router.push(`/quiz/start/${quiz.id}`)
  }

  return (
    <Card
      key={quiz.id}
      className="min-w-48 min-h-[300px] border-2 rounded-xl p-1 cursor-pointer shadow-[0_.3rem_0_0_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-transform duration-300 ease-in-out"
      onClick={() => handleClick()}
    >
      <CardHeader className="rounded-xl h-[55%] py-1 bg-[#97dbff]/65 w-full">
        {imageSrc ? (
          <Image
            src={imageSrc}
            width={300}
            height={200}
            alt={quiz.title}
            className="h-full rounded-xl"
          />
        ) : (
          <p>Loading...</p>
        )
        }
      </CardHeader>
      <CardContent className="flex flex-col gap-2 items-start mt-6">
        <h4 className="text-xl font-bold">{quiz.title}</h4>
        <p className="text-gray-600 text-sm leading-none font-semibold">
          {quiz.description}
        </p>
        <p className="text-gray-400 semi-bold text-sm flex items-center gap-2 leading-none">
          <span className="text-xl"><MessageCircleQuestion /></span>
          <span className="text-xl">Total Questions: {" "}
            <span className="font-bold">{quiz.questions.length}</span>
          </span>
        </p>
      </CardContent>
    </Card>
  )
}