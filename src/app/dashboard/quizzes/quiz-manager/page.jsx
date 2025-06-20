"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QuizBuilder from "@/app/components/Admin/QuizBuilder"

function QuizManagerContent() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('id')
  return <QuizBuilder quizId={quizId} />
}

export default function QuizManagerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizManagerContent />
    </Suspense>
  )
}
