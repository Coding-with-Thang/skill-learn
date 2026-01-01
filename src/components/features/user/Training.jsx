"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { NotebookPen } from "lucide-react";
import Image from "next/image";
import empathy from "/public/empathy.png";

export default function MoreTraining() {
  return (
    <section className="flex flex-col gap-5 mb-9 w-full mx-auto justify-center items-center px-2">
      <h3 className="text-xl font-bold">More Training</h3>
      <div className="flex flex-col md:flex-row gap-5 w-full max-w-4xl items-stretch">
        <Card className="w-full md:max-w-[40ch]">
          <CardHeader className="relative overflow-hidden rounded-xl">
            <Image
              className="object-cover w-full h-[150px] rounded"
              src={empathy}
              width={340}
              height={150}
              alt="Icon"
            />
            <p className="p-2 right-4 top-4 absolute bg-gray-50 rounded-full text-xs md:text-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:opacity-95">RECOMMENDATION</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 items-start">
            <p className="text-gray-400">Empathy Training</p>
            <h4 className="text-base md:text-lg">How to Create an Empathetic Client Experience</h4>
            <Link href="/training">
              <Button className="align-right">Continue</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="w-full md:min-w-[40ch] flex flex-col justify-between">
          <CardHeader className="flex flex-row gap-3 items-center">
            <NotebookPen className="w-6 h-6" />
            <CardTitle className="text-base md:text-lg">Training</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 items-end flex-1 justify-end">
            <Progress value={33} />
            <p className="text-gray-300 text-xs md:text-sm">1 out of 20 topics completed</p>
            <Link href="/training" className="text-blue-600 hover:underline">View All</Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
