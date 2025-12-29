"use client"

import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import Image from "next/image"
import useCategoryStore from "../store/categoryStore";
import { InteractiveCard, InteractiveCardContent, InteractiveCardHeader } from "@/components/ui/interactive-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import BreadCrumbCom from "@/components/shared/BreadCrumb"
import { Loader } from "@/components/ui/loader";
import { BookOpen, Play, Trophy, Clock, Users } from 'lucide-react';

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
        <div className="text-error mb-4">Error loading categories: {error}</div>
        <EnhancedButton
          onClick={() => fetchCategories()}
          variant="outline"
          loading={loading}
        >
          Retry
        </EnhancedButton>
      </section>
    );
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 md:px-12 py-8" aria-label="Training Categories">
      <BreadCrumbCom endtrail="My Training" />
      <h1 className="text-3xl sm:text-4xl font-bold my-10 flex self-center text-foreground" tabIndex="0">My Training</h1>
      <h2 className="font-semibold text-2xl text-foreground" tabIndex="0">Categories</h2>
      {!loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category) => (
            <HoverCard key={category.id}>
              <HoverCardTrigger asChild>
                <InteractiveCard
                  className={`max-w-[40ch] min-w-36 min-h-[200px] cursor-pointer flex flex-col ${loadingCard === category.id ? 'opacity-50' : ''
                    }`}
                  onClick={async () => {
                    setLoadingCard(category.id);
                    await router.push(`/categories/${category.id}`);
                    setLoadingCard(null);
                  }}
                >
                  <InteractiveCardHeader className="w-full p-0">
                    <Image
                      src={category?.imageUrl || '/placeholder-image.jpg'}
                      width={700}
                      height={200}
                      alt={category?.name || 'Category Image'}
                      className="h-40 w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </InteractiveCardHeader>
                  <InteractiveCardContent className="mt-4 flex flex-col gap-2">
                    <h4 className="text-xl font-bold text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      {`${category.name} Training`}
                    </h4>
                    <div className="flex items-center gap-2 text-accent group-hover:text-accent-hover transition-colors duration-200">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">
                        {category._count.quizzes} {category._count.quizzes === 1 ? 'Quiz' : 'Quizzes'}
                      </span>
                    </div>
                  </InteractiveCardContent>
                </InteractiveCard>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">{category.name} Training</h4>
                  <p className="text-sm text-muted-foreground">
                    Master {category.name.toLowerCase()} skills through interactive quizzes and challenges.
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Play className="h-4 w-4" />
                      <span>{category._count.quizzes} quizzes</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>Earn points</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10">
          <Loader />
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      )}
    </section>
  );
}