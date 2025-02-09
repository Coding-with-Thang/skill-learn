import Link from "next/link";
import Image from "next/image"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CiSearch } from "react-icons/ci";
import logo from '../../../public/logo.svg'

export default function MainNav() {

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="hidden md:flex items-center pl-9">
      <Image
        src={logo}
        width={48}
        alt="Skill-Learn"
      />
      <Link href="/" className="flex flex-1 font-bold text-2xl mx-2 lg:mx-4 ">
        Skill-Learn
      </Link>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Search..."
          className="flex items-center"
        //   value={searchTerm}
        // onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
      <Button>
        <CiSearch />
      </Button>
      <nav className="hidden lg:flex items-center justify-center gap-3 lg:gap-4 mx-3 lg:mx-9">
        <Link href="/about" className=" hover:underline">
          About
        </Link>
        <Link href="/latest-updates" className=" hover:underline">
          Latest Updates
        </Link>
      </nav>
    </div>
  );
}