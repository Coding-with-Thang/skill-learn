"use client"

import { useEffect } from 'react'
import { useRouter } from "next/navigation";
import Image from "next/image"
import useCategoryStore from "../store/categoryStore";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import BreadCrumbCom from "../components/BreadCrumb"
import Loader from '../components/loader';

export default function TrainingPage() {

  const { categories, loading, error, fetchCategories, quizzesPerCategory, fetchQuizzesPerCategory } = useCategoryStore();

  const router = useRouter();

  useEffect(() => {
    fetchCategories()
    fetchQuizzesPerCategory()
  }, [])

  useEffect(() => {
    console.log("Quizzes per category:", quizzesPerCategory);
  }, [quizzesPerCategory])

  return (
    <section className="flex flex-col w-[90%] px-20">
      <BreadCrumbCom endtrail="My Training" />
      <h1 className="text-4xl font-bold my-10 flex self-center">My Training</h1>
      <h3 className="font-semibold text-2xl">Categories</h3>
      {!loading ?
        <div className="mt-10 px-20 grid grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              className="max-w-[40ch] min-w-36 min-h-[200px] cursor-pointer flex  hover:-translate-y-1 transition-transform duration-300 ease-in-out"
              onClick={() => router.push(`/categories/${category.id}`)}
            >
              <CardHeader className="w-[300px]">
                <Image
                  src={category?.imageUrl}
                  width={700}
                  height={200}
                  alt={category?.name}
                  className="h-full w-full rounded-xl"
                />
              </CardHeader>
              <CardContent className="mt-4 flex flex-col gap-2 items-start">
                <h4 className="text-xl font-bold text-gray-400">{`${category.name} Training`}</h4>
                {/* <p className="text-gray-600 text-sm leading-none font-semibold">
                  {category.description}
                </p> */}
                <p>{quizzesPerCategory[index]} quizzes</p>
              </CardContent>
            </Card>
          ))}
        </div>
        :
        <div>
          <Loader />
        </div>
      }
    </section >
  );
}