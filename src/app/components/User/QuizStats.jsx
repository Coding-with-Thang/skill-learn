"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Clock, Trophy, Target } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function QuizStats({ quizStats, categories }) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredQuizzes = selectedCategory === "all"
    ? quizStats
    : quizStats.filter(quiz => quiz.category.id === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quiz Performance</h2>
          <p className="text-muted-foreground">
            Track your quiz progress and performance
          </p>
        </div>

        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="text-base font-semibold bg-gray-50">
              <TableRow>
                <TableHead className="py-4">Quiz Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Attempts</TableHead>
                <TableHead className="text-center">Best Score</TableHead>
                <TableHead className="text-center">Avg. Score</TableHead>
                <TableHead>Last Attempt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes?.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium py-4">
                    {quiz.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quiz.category.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`
                      inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${quiz.completed > 0
                        ? 'bg-green-100 text-green-800'
                        : quiz.attempts > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'}
                    `}>
                      {quiz.completed > 0 ? (
                        <>
                          <Trophy className="w-3 h-3" />
                          Completed
                        </>
                      ) : quiz.attempts > 0 ? (
                        <>
                          <Clock className="w-3 h-3" />
                          In Progress
                        </>
                      ) : (
                        <>
                          <Target className="w-3 h-3" />
                          Not Started
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {quiz.attempts || '0'}
                  </TableCell>
                  <TableCell className="text-center">
                    {quiz.bestScore ? (
                      <span className={`
                        px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${quiz.bestScore >= 90 ? 'bg-green-100 text-green-800' :
                          quiz.bestScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}
                      `}>
                        {quiz.bestScore}%
                      </span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {quiz.averageScore
                      ? `${quiz.averageScore.toFixed(1)}%`
                      : <span className="text-gray-400">--</span>
                    }
                  </TableCell>
                  <TableCell>
                    {quiz.lastAttempt ? (
                      <div className="text-sm">
                        <p className="font-medium">
                          {format(new Date(quiz.lastAttempt), "MMM d, yyyy")}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(quiz.lastAttempt), "h:mm a")}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Never attempted</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 