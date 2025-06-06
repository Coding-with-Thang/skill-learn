import Image from "next/image";
import icon from "../../../../public/icon.png";

export default function HeroBanner() {
  return (
    <section id="hero-banner" className="flex flex-col gap-1 items-center justify-center w-screen h-[400px] text-gray-900">
      <h1 className="text-5xl">Skill-Learn</h1>
      <h2 className="text-lg mb-8">
        Gamify your knowledge & have a blast learning
      </h2>
      <Image className="" src={icon} width={150} height={150} alt="Icon" />
    </section>
  )
}