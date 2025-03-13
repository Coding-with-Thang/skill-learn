import QuizCard from '@/app/components/Quiz/QuizCard';
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from "@prisma/client";
import BreadCrumbCom from "../../components/BreadCrumb"

export default async function QuizSelectPage({ params }) {

  const { categoryId } = await params
  const { userId } = await auth()
  const prisma = new PrismaClient();

  if (!categoryId) {
    null
  }

  const quizzes = await prisma.quiz.findMany({
    where: { categoryId },
    include: {
      questions: {
        select: {
          id: true,
          text: true,
          options: {
            select: {
              id: true,
              text: true,
              isCorrect: true,
            }
          }
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  })

  return (
    <section className="flex flex-col w-[90%] px-20">
      <BreadCrumbCom crumbs={[{ name: "My Training", href: "training" }]} endtrail="Quiz Selection" />
      <h1 className="mb-6 text-4xl font-bold mt-20">Quizzes</h1>

      {quizzes.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <h1 className="text-2xl text-center mt-4">
          No Quizzes found for this category
        </h1>
      )}
    </section >
  )
}