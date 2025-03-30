import QuizCard from '@/app/components/Quiz/QuizCard';
import prisma from "@/utils/connect"
import BreadCrumbCom from "../../components/BreadCrumb"
export default async function QuizSelectPage({ params }) {

  const { categoryId } = await params

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
}