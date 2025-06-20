import Image from "next/image";
import icon from "../../../../public/icon.png";

export default function HeroBanner() {
  return (
    <section
      id="hero-banner"
      className="flex flex-col gap-2 items-center justify-center w-full max-w-full min-h-[220px] md:min-h-[400px] py-8 px-2 text-gray-900"
    >
      <h1 className="text-3xl md:text-5xl font-bold text-center">Skill-Learn</h1>
      <h2 className="text-base md:text-lg mb-6 md:mb-8 text-center">
        Gamify your knowledge & have a blast learning
      </h2>
      <div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] flex items-center justify-center">
        <Image
          className="object-contain"
          src={icon}
          width={150}
          height={150}
          alt="Icon"
          priority
        />
      </div>
    </section>
  );
}