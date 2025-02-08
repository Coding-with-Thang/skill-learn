"use client";

import Link from "next/link";
import Image from "next/image";
import empathy from "../../../public/empathy.png";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { NotebookPen } from "lucide-react";

export default function MoreTraining() {
  return (
    <section className="flex flex-col gap-5 mb-9 w-full mx-auto justify-center items-center">
      <h3 className="text-xl font-bold">More Training</h3>
      <div className="flex gap-5">
        <Card className="max-w-[40ch]">
          <CardHeader className="relative">
            <Image
              className=""
              src={empathy}
              width={340}
              height={150}
              alt="Icon"
            />
            <p className="p-2 right-8 absolute bg-gray-50 rounded-full">RECOMMENDATION</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 items-start">
            <p className="text-gray-400">Empathy Training</p>
            <h4>How to Create an Empathetic Client Experience</h4>
            <Link href="/training">
              <Button className="align-right">Continue</Button>
            </Link>
          </CardContent>
        </Card>


        <Card className="min-w-[40ch]">
          <CardHeader className="flex flex-row gap-3">
            <NotebookPen />
            <CardTitle>My Training</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 items-end">
            <Progress value={33} />
            <p className="text-gray-300">1 out of 20 topics completed</p>
            <Link href="/training">View All</Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
