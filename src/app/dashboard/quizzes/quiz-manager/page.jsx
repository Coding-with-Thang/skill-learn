"use client"

import { useSearchParams } from 'next/navigation'
import QuizBuilder from "@/app/components/Admin/QuizBuilder"

export default function QuizManagerPage() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('id')

  return <QuizBuilder quizId={quizId} />
}
