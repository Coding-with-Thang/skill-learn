"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import QuizBuilder from "@/components/admin/QuizBuilder"

function QuizManagerContent() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('id')
  return <QuizBuilder quizId={quizId} />
}

function QuizManagerFallback() {
  const t = useTranslations("adminQuizManager")
  return <div>{t("loading")}</div>
}

export default function QuizManagerPage() {
  return (
    <Suspense fallback={<QuizManagerFallback />}>
      <QuizManagerContent />
    </Suspense>
  )
}
