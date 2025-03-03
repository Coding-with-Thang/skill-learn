"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image"
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Star, Telescope, Medal, BookOpenText, ChartBar, Search } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import logo from '../../../public/logo.svg'

export default function Header() {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <header className="sticky top-0 w-full bg-white border-b-2 z-[1000]">
      <div className="flex items-center h-16 justify-between">
        <div className="hidden md:flex items-center pl-5">
          <Link href="/" className="flex flex-1 gap-2 font-bold text-2xl mx-2 lg:mx-4 text-nowrap">
            <Image
              src={logo}
              width={48}
              alt="Skill-Learn"
            />
            Skill-Learn
          </Link>
          <form onSubmit={handleSubmit} className="flex border border-gray-400 shadow-md rounded-lg">
            <Input
              type="text"
              placeholder="Search..."
              className="flex items-center outline-none border-none shadow-none focus:border-none focus:outline-none"
            //  value={searchTerm}
            //onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="items-center outline-none border-none shadow-none">
              <Search />
            </Button>
          </form>

          {/* <nav className="hidden lg:flex items-center justify-center gap-3 lg:gap-4 mx-3 lg:mx-9">
        <Link href="/about" className=" hover:underline">
          About
        </Link>
        <Link href="/latest-updates" className=" hover:underline">
          Latest Updates
        </Link>
      </nav> */}
        </div>
        <div className="flex items-center justify-end gap-6 mr-6 lg:mr-9">
          <Link href="/discover" className="flex gap-1 items-center hover:underline">
            <Telescope /> Discover
          </Link>
          <Link href="/training" className="flex gap-1 items-center hover:underline">
            <BookOpenText /> Training
          </Link>
          <Link href="/achievements" className="flex gap-1 items-center hover:underline">
            <Medal /> Achievements
          </Link>
          <Link href="/rewards" className="flex gap-1 items-center hover:underline">
            <Star /> Rewards
          </Link>

          <SignedIn>
            <Link href="/dashboard" className="flex gap-1 items-center hover:underline">
              <ChartBar />Dashboard
            </Link>

            <div className="relative">
              <UserButton
                userProfileProps={{
                  //appearance: {
                  //  elements: {
                  //    profileSection: {
                  //      display: 'none',
                  //    }
                  //  },
                  //}
                }}
                appearance={{
                  elements: {
                    userButtonPopoverFooter: {
                      display: 'none',
                    },
                  },
                }}
              />
              {/* <button
                onClick={toggleDropdown}
                className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white font-bold hover:bg-blue-600 focus:outline-none"
              >
                {user.initials}
              </button> */}

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
                  <ul className="py-2">
                    <li>
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/settings"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Settings
                      </a>
                    </li>
                    <li>
                      <a
                        href="/logout"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Log Out
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </SignedIn>

          <SignedOut>
            <Link href="sign-in" className="hover:underline">Sign In</Link>
          </SignedOut>
        </div>
      </div>
    </header >
  );
}
