import Link from "next/link";
import Image from "next/image";
import icon from "../../public/icon.png";
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

      <Link href="/games" className="text-center text-5xl underline mt-[10rem]">
        Play A Game
      </Link>
    </div>
  );
}
