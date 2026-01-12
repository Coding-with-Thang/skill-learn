import { useState, useEffect } from 'react'
import { useQuizStore } from "../store/quizStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu.jsx"
import { ChevronDown } from 'lucide-react'

export default function DropdownOptions() {

  const [categories, setCategories] = useState([])

  const config = useQuizStore((state) => state.config);
  const addCategory = useQuizStore((state) => state.addCategory)
  const listOfCategories = ["General Knowledge", "History", "Team", "Trivia", "Game Day"]

  useEffect(() => {
    setCategories(listOfCategories)
  }, [])

  return (
    <section className='flex justify-center items-center py-5'>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex outline-hidden justify-between w-full px-10 py-3 rounded-lg shadow-lg hover:bg-blue-600 hover:text-gray-100">
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