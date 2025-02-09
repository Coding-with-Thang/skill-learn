import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function LessonPage({ params }) {
  let topic = null;
  try {
    const result = await fetch(process.env.URL + "/api/post/get", {
      method: "POST",
      body: JSON.stringify({ slug: params.slug }),
      cache: "no-store",
    });
    const data = await result.json();
    topic = data.topics[0];
  } catch (error) {
    topic = { title: "Failed to load topic" };
  }
  if (!topic || !topic.title === "Failed to load topic") {
    return (
      <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
        <h2 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
          Topic not found
        </h2>
      </main>
    );
  }
  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {topic && topic.title}
      </h1>
    </main>
  );
}