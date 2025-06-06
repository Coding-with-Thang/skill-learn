"use client"

import Image from "next/image"
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
  const setSelectedQuiz = useQuizStartStore(state => state.setSelectedQuiz)

  const handleClick = () => {
    setSelectedQuiz(quiz);
    router.push(`/quiz/start/${quiz.id}`)
  }

  return (
    <Card
      key={quiz.id}
      className="min-h-[300px] flex flex-col border-2 rounded-xl p-1 cursor-pointer shadow-[0_.3rem_0_0_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-transform duration-300 ease-in-out"
      onClick={() => handleClick()}
    >
      <CardHeader className="rounded-xl py-2 w-full">
        <Image
          src={quiz?.imageUrl}
          width={500}
          height={300}
          alt={quiz?.title}
          className="rounded-xl"
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-7 items-start">
        <h4 className="text-xl font-bold mt-2">{quiz?.title}</h4>
        <p className="text-gray-600 text-sm leading-none font-semibold max-w-[60ch]">
          {quiz?.description}
        </p>
        <p className="text-gray-400 semi-bold text-sm flex items-center gap-2 leading-none">
          <span className="text-xl"><MessageCircleQuestion /></span>
          <span className="text-xl">Total Questions: {" "}
            <span className="font-bold">{quiz?.questions.length}</span>
          </span>
        </p>
      </CardContent>
    </Card>
  )
}