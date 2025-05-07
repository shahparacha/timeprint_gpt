// components/UserButtonClient.tsx
'use client';

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";

export const UserButtonClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();


  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the menu when clicking outside
  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsHovered(false);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  // Show logo2.png when either hovered or menu is open
  const showAlternateLogo = isHovered || isOpen;

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="btn-neumorphic flex items-center focus:outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showAlternateLogo ? (
          <img
            src="/logo2.png"
            alt="User"
            className="w-8 h-8 rounded-full border-2 border-white transition-all duration-300"
          />
        ) : (
          <img
            src={user?.imageUrl || "https://via.placeholder.com/40"}
            alt="User"
            className="w-8 h-8 rounded-full border-2 border-white transition-all duration-300"
          />
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay to capture clicks outside the menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={handleClickOutside}
          ></div>

          <div className="absolute right-0 mt-2 w-40 card-neumorphic py-1 z-20">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 nav-link"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};