"use client"

import Link from "next/link";
import Image from "next/image";
import empathy from "../../../public/empathy.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
export default function TrainingPage() {

  const topics = [
    {
      name: 'Empathy',
      subtitle: 'How to Create an Empathetic Client Experience',
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Continue"
    },
    {
      name: 'Empathy',
      subtitle: 'What is Empathy: Key Definitions and Benefits',
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Client Satsifaction',
      subtitle: 'Intro to CSAT',
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Soft Skills',
      subtitle: 'Confidence - What does it look like, how does it feel',
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Systems and Tools',
      subtitle: 'Navigating Spector & Nexus',
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Soft Skills',
      subtitle: 'What you need to know about Tone of Voice',
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
  ];

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen w-[90%]">
      <h3 className="text-xl font-bold m-9">More Training</h3>
      <div className="flex gap-2 items-center justify-items-center p-9">
        {topics.map((topic, index) => (
          <Card key={index} className="max-w-[40ch] min-w-36 min-h-[200px]" >
            <CardHeader>
              <Image
                className=""
                src={topic.imageBG}
                width={340}
                height={150}
                alt={topic.imageAlt}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-2 items-start">
              <p className="text-gray-400">{`${topic.name} Training`}</p>
              <h4>{topic.subtitle}</h4>
              <Button className="align-right">{topic.btnText}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
