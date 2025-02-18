"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const config = useQuizStore(state => state.config)
  const setScore = useQuizStore(state => state.setScore)

  // useEffect(() => {
  //   aysnc function getQuestions() {
  //     const { results } = await(await fetch('').json())
  //     console.log("Fetch Quiz results ", results)
  //   }

  //   getQuestions()
  // }, [])

  return (
    <section className="flex flex-col justify-center items-center mt-10">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-light text-gray-900 md:text-5xl lg:text-6xl">Quiz</h1>
      <p className="text-2xl">Score: 0</p>
      <div className="shadow-2xl my-10 p-10 w-[90%] rounded-lg flex- flex-col justify-center items-center shadow-orange-200">
        <h3 className="mb-4 text-2xl font-bold leading-none tracking-light text-gray-900 md:text-3xl lg:text-4xl">Question # <span className="text-orange-500">01</span></h3>
        <h5 className="font-bold text-3xl flex items-center justify-center my-3">What year is it?</h5>
        <div className="flex justify-evenly gap-8 items-center my-10 flex-wrap w-full">
          <Button variant="outline" className="w-[45%] text-xl font-semibold bolder-none shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:text-white hover:text-3xl">2020</Button>
          <Button variant="outline" className="w-[45%] text-xl font-semibold bolder-none shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:text-white hover:text-3xl">2025</Button>
          <Button variant="outline" className="w-[45%] text-xl font-semibold bolder-none shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:text-white hover:text-3xl">2023</Button>
          <Button variant="outline" className="w-[45%] text-xl font-semibold bolder-none shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:text-white hover:text-3xl">2024</Button>
          <Button variant="outline" className="w-[45%] text-xl font-semibold bolder-none shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:text-white hover:text-3xl">NEXT</Button>
        </div>
      </div>
    </section>
  )
}