import QuizCard from '@/app/components/Quiz/QuizCard';
import prisma from "@/utils/connect"
import BreadCrumbCom from "../../components/BreadCrumb"
import { notFound } from 'next/navigation'

export default async function QuizSelectPage({ params }) {
  const { categoryId } = await params

  if (!categoryId) {
    return notFound()
  }
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        categoryId,
        isActive: true // Only get active quizzes
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        timeLimit: true,
        passingScore: true,
        categoryId: true,
        questions: {
          select: {
            id: true,
            text: true,
            options: {
              select: {
                id: true,
                text: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return (
      <section className="flex flex-col w-[90%] px-20">
        <BreadCrumbCom
          crumbs={[{ name: "My Training", href: "training" }]}
          endtrail="Quiz Selection"
        />
        <h1 className="mb-6 text-4xl font-bold mt-20">Quizzes</h1>
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <h1 className="text-2xl text-center mt-4">
            No quizzes found for this Category
          </h1>
        )}
      </section>
    );
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return (
      <div className="text-center p-4">
        <h1 className="text-2xl text-red-500">
          Error loading quizzes
        </h1>
      </div>
    );
  }
}