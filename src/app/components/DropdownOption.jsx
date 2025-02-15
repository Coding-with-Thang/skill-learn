import { useState, useEffect } from 'react'
import { useQuizStore } from "../store/quizStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react'

export default function DropdownOptions() {

  const [categories, setCategories] = useState([])

  const config = useQuizStore((state) => state.config);
  const addCategory = useQuizStore((state) => state.addCategory)

  console.log('config:', config)

  const listOfCategories = ["General Knowledge", "History", "Team", "Trivia", "Game Day"]

  useEffect(() => {
    setCategories(...categories, listOfCategories)
  }, [])

  return (
    <section className='flex justify-center items-center py-5'>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex outline-none justify-between w-full px-10 py-3 rounded-lg shadow-lg hover:bg-blue-600 hover:text-gray-100">
          {config.category.name ? "Category: " + config.category.name : "Select A Category"}{"   "}
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="overflow-y-scroll bg-white">
          <DropdownMenuLabel>
            Select A Category
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {
            categories.map((category, index) => (
              <DropdownMenuItem key={category} onClick={() => addCategory(index, category)}>
                {category}
              </DropdownMenuItem>
            ))
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </section >
  )
}