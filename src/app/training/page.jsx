"use client"

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation";
import { Image } from "next/image"
import useCategoryStore from "../store/categoryStore";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
export default function TrainingPage() {

  const { categories, loading, error, fetchCategories } = useCategoryStore();

  const [imageSrc, setImageSrc] = useState([])

  const router = useRouter();

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setImageSrc(categories.image)
  }, [categories])

  return (
    <section className="flex flex-col min-h-screen w-[90%] px-20">
      <h1 className="text-4xl font-bold my-10 flex self-center">More Training</h1>
      <h3 className="font-semibold text-2xl">Categories</h3>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="max-w-[40ch] min-w-36 min-h-[200px]"
            onClick={() => router.push(`/categories/${category.id}`)}
          >
            <CardHeader>
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  width={300}
                  height={200}
                  alt={category.name}
                  className="h-full rounded-xl"
                />
              ) : (
                <p>Loading...</p>
              )
              }
            </CardHeader>
            <CardContent className="flex flex-col gap-2 items-start">
              <h4 className="text-xl font-bold text-gray-400">{`${category.name} Training`}</h4>
              <p className="text-gray-600 text-sm leading-none font-semibold">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section >
  );
}