import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function CoursesPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Courses</h1>

                <Link className={buttonVariants()} href="/dashboard/courses/create">
                    Create Course
                </Link>
            </div>
        </>
    );
}