"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from "@/utils/axios";
import { useQuizStartStore } from '@/app/store/quizStore'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play } from 'lucide-react'
export default function selectedQuizPage() {

  const router = useRouter();

  const { selectedQuiz } = useQuizStartStore();

  useEffect(() => {
    if (!selectedQuiz) {
      router.push("/training")
    }
  }, [selectedQuiz, router])

  const startQuiz = async () => {

    if (selectedQuiz?.questions.length > 0) {
      //update the db for quiz attempt start

      try {
        await api.post("/user/quiz/start", {
          categoryId: selectedQuiz?.categoryId,
          quizId: selectedQuiz?.id,
        });
      } catch (error) {
        console.log("Error starting quiz: ", error);
      }
      //Push to the quiz page
      router.push("/quiz");
    } else {
      console.log("No questions found for the selected criteria")
    }
  }

  return (
    <section className="py-[6rem] w-[50%] fixed left-1/2 top-[45%] translate-x-[-50%] translate-y-[-50%] p-6 border-2 rounded-xl shadow-[0_.5rem_0_0_rgba(0,0,0,0.1)] mx-auto">
      {/* <div>
        <Image
          src={selectedQuiz?.image}
          width={500}
          height={300}
          alt={quiz?.title}
          className="rounded-xl"
        />
      </div> */}
      <h1 className="text-4xl font-bold mb-4">{selectedQuiz?.title}</h1>
      <h2 className="text-xl mb-3">{selectedQuiz?.description}</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="questionCount" className="text-xl">Number of Questions: {selectedQuiz?.questions.length}</Label>
        </div>
        <div>
          <p>Last attempted: {selectedQuiz?.lastAttempt}</p>
        </div>
        <div className="w-full pb-4 flex justify-center fixed bottom-0 left-0">
          <Button
            className="px-10 py-6 font-bold text-white bg-blue-500 text-xl rounded-xl"
            onClick={startQuiz}
          >
            <span className="flex items-center gap-2"><Play /> Start</span>
          </Button>
        </div>
      </div>
    </section>
  )
}