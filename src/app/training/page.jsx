"use client"

import { useEffect, useState } from 'react'
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
import { BookOpen } from 'lucide-react';

export default function TrainingPage() {

  const { categories, loading, error, fetchCategories } = useCategoryStore();

  const router = useRouter();

  const [loadingCard, setLoadingCard] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  if (error) {
    return (
      <section className="flex flex-col items-center w-[90%] px-20">
        <div className="text-red-500 mb-4">Error loading categories: {error}</div>
        <button
          onClick={() => fetchCategories()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col w-[90%] px-20" aria-label="Training Categories">
      <BreadCrumbCom endtrail="My Training" />
      <h1 className="text-4xl font-bold my-10 flex self-center" tabIndex="0">My Training</h1>
      <h2 className="font-semibold text-2xl" tabIndex="0">Categories</h2>
      {!loading ? (
        <div className="mt-10 px-4 md:px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`max-w-[40ch] min-w-36 min-h-[200px] cursor-pointer flex flex-col hover:-translate-y-1 transition-transform duration-300 ease-in-out ${loadingCard === category.id ? 'opacity-50' : ''
                }`}
              onClick={async () => {
                setLoadingCard(category.id);
                await router.push(`/categories/${category.id}`);
                setLoadingCard(null);
              }}
            >
              <CardHeader className="w-[300px]">
                <Image
                  src={category?.imageUrl || '/placeholder-image.jpg'}
                  width={700}
                  height={200}
                  alt={category?.name || 'Category Image'}
                  className="h-full w-full rounded-xl object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </CardHeader>
              <CardContent className="mt-4 flex flex-col gap-2">
                <h4 className="text-xl font-bold text-gray-400">
                  {`${category.name} Training`}
                </h4>
                <div className="flex items-center gap-2 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">
                    {category._count.quizzes} {category._count.quizzes === 1 ? 'Quiz' : 'Quizzes'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10">
          <Loader />
          <p className="mt-4 text-gray-500">Loading categories...</p>
        </div>
      )}
    </section>
  );
}