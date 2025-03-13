'use client'

import { useQuizStore } from '../../store/quizStore'
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import DropdownOptions from '../DropdownOption';
import Button from './Button'

export default function CreateQuiz() {

  const addNumberOfQuestions = useQuizStore(state => state.addNumberOfQuestions)

  return (
    <section className="flex flex-col justify-center items-center my-10">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">Quiz Creator</h1>

      <div className="p-10 my-10 rounded-lg shadow-xl w-[65%]">
        <Label htmlFor="num-questions" className="block mb-2 text-sm font-medium text-gray-900">Number of Questions</Label>
        <Input
          type="number"
          id="num-questions"
          onChange={(e) => addNumberOfQuestions(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
          defaultValue={10}
          min={1}
          max={50}
        />
        <div className="flex items-center justify-center">
        </div>
        <div className="flex flex-col gap-3 items-center justify-center">
          <DropdownOptions />
          <Button />
        </div>
      </div>
    </section>
  )
}