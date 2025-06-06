import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <h1 className="mt-20 font-bold text-xl text-blue-600">404</h1>
      <p className="mt-4 text-6xl text-gray-600">Oops! Page not found.</p>
      <p className="mt-2 text-gray-500">Sorry, we couldn't find the page you're looking for.</p>
      <Button className="mt-6 bg-blue-600" asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  )
}