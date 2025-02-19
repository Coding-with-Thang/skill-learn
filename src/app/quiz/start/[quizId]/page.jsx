"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStartStore } from '@/app/store/quizStore'
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play } from 'lucide-react'
export default function selectedQuizPage() {

  const router = useRouter();

  const { selectedQuiz, setQuestionCount, questionCount } = useQuizStartStore();

  useEffect(() => {
    if (!selectedQuiz) {
      router.push("/")
    }
  }, [selectedQuiz, router])

  const handleQuestionChange = (e) => {
    const value = parseInt(e.target.value, 10)
    const maxQuestions = selectedQuiz?.questions.length || 5;
    const newCount = isNaN(value) || value < 5 ? 5 : Math.min(value, maxQuestions)

    setQuestionCount((prev) => ({ ...prev, questionCount: newCount }))
  }

  const startQuiz = async () => { }

  return (
    <section className="min-h-screen" >
      <div className="py-[6rem] w-[50%] fixed left-1/2 top-[45%] translate-x-[-50%] translate-y-[-50%] p-6 border-2 rounded-xl shadow-[0_.5rem_0_0_rgba(0,0,0,0.1)] mx-auto">
        <h1 className="text-4xl font-bold mb-4">Quiz</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="questionCount" className="text-xl">{`Number of Questions (Max Questions: ${selectedQuiz.questions.length})`}</Label>
            <Input
              type="number"
              min={5}
              max={selectedQuiz?.questions.length}
              defaultValue={Math.floor(selectedQuiz?.questions.length / 2)}
              id="questionCount"
              value={questionCount}
              onChange={handleQuestionChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xl">Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem>1</SelectItem>
                <SelectItem>2</SelectItem>
                <SelectItem>3</SelectItem>
                <SelectItem>4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full pb-4 flex justify-center fixed bottom-0 left-0">
            <Button
              className="px-10 py-6 font-bold text-white bg-blue-500 text-xl rounded-xl"
            >
              <span className="flex items-center gap-2"><Play /> Start</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}