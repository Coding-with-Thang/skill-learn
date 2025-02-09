"use client"

import { useCallback } from "react";
import Image from "next/image";
import empathy from "../../../public/empathy.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { redirect } from 'next/navigation'
export default function TrainingPage() {

  const topics = [
    {
      name: 'Empathy',
      subtitle: 'How to Create an Empathetic Client Experience',
      slug: "empathy-how-to-create-an-empathetic-client-experience",
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Continue"
    },
    {
      name: 'Empathy',
      subtitle: 'What is Empathy: Key Definitions and Benefits',
      slug: "empathy-what-is-empathy-key-definitions-and-benefits",
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Client Satisfaction',
      subtitle: 'Intro to CSAT',
      slug: "client-satisfaction-intro-to-csat",
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Soft Skills',
      subtitle: 'Confidence - What does it look like, how does it feel',
      slug: "soft-skills-confidence-what-does-it-look-like-how-does-it-feel",
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Systems and Tools',
      subtitle: 'Navigating Spector & Nexus',
      slug: "systems-and-tools-navigating-spector-and-nexus",
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
    {
      name: 'Soft Skills',
      subtitle: 'What you need to know about Tone of Voice',
      slug: "soft-skills-what-you-need-to-know-about-tone-of-voice",
      imageBG: empathy,
      imageAlt: "empathy",
      btnText: "Start"
    },
  ];

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  return (
    <main className="flex flex-col items-center justify-items-center min-h-screen w-[90%]">
      <h3 className="text-xl font-bold m-9">More Training</h3>
      <div className="flex gap-8 items-center justify-items-center p-9">
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
              {/* <Link href={`/topic/${topic.slug}`}> */}
              {/* <Link href={pathname + '?' + createQueryString('topic', topic.slug)}> */}
              <Button
                className="align-right"
                onClick={() => {
                  router.push(pathname + '?' + createQueryString('topic', topic.slug))
                  redirect(`/training/topic/${topic.slug}`) // Navigate to the new post page
                }}
              >
                {topic.btnText}
              </Button>
              {/* </Link> */}
            </CardContent>
          </Card>
        ))}
      </div>
    </main >
  );
}
