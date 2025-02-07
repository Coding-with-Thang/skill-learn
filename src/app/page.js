import Link from "next/link";
import Image from "next/image";
import icon from "../../public/icon.png";
import empathy from "../../public/empathy.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen">
      <div className="flex flex-col gap-1 items-center justify-center w-screen h-[500px] bg-blue-500 text-gray-100">
        <h1 className="text-5xl">Skill-Learn</h1>
        <h2 className="text-lg mb-8">
          Gamify your knowledge & have a blast learning
        </h2>
        <Image className="" src={icon} width={150} height={150} alt="Icon" />
      </div>
      <div className="flex flex-col gap-1 items-center justify-center w-screen h-[500px] text-gray-900 mt-9">
        <h3 className="text-xl font-bold">More Training</h3>
        <Card className="max-w-[40ch]">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              className=""
              src={empathy}
              width={340}
              height={150}
              alt="Icon"
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-start">
            <p className="text-gray-400">Empathy Training</p>
            <h4>How to Create an Empathetic Client Experience</h4>
            <Button className="align-right">Continue</Button>
          </CardFooter>
        </Card>
      </div>
      <Link href="/games" className="text-center text-5xl underline mt-[10rem]">
        Play A Game
      </Link>
    </div>
  );
}
