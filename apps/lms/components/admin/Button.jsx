"use client"

import { useQuizStore } from '@skill-learn/lib/stores/quizStore.js'

export default function Button() {
  const changeStatus = useQuizStore(state => state.changeStatus)
  return (
    <button
      type="button"
      onClick={() => changeStatus('quiz')}
      className="p-5 w-1/2 m-auto text-sm font-medium text-gray-900 focus:outline-hidden bg-white rounded-xl border hover:text-blue-600 hover:font-bold"
    >
      Start Creating Quiz
    </button>
  )
}