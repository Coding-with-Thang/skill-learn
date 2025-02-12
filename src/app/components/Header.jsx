"use client";

import { useState } from 'react';
import Link from "next/link";
import MainNav from "./MainNav";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Star } from 'lucide-react';

export default function Header() {

  // Example user data
  const user = {
    name: 'John Doe',
    initials: 'JD',
  };

  const isSignedIn = true;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="sticky top-0 w-full bg-white border-b-2 z-[1000]">
      <div className="flex items-center h-16 justify-between">
        <MainNav />
        <div className="flex items-center justify-end gap-6 mr-6 lg:mr-9">
          <Link href="/discover" className="hover:underline">
            Discover
          </Link>
          <Link href="/training" className="hover:underline">
            Training
          </Link>
          <Link href="/achivements" className="hover:underline">
            Achievements
          </Link>
          <Link href="/rewards" className=" flex  gap-1 items-center hover:underline">
            <Star /> Rewards
          </Link>

          <SignedIn>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>

            <div className="relative">
              <UserButton
                userProfileProps={{
                  // appearance: {
                  //   elements: {
                  //     profileSection: {
                  //       display: 'none',
                  //     }
                  //   },
                  // }
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
            <Link href="sign-in" className="hover:underscore">Sign In</Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
