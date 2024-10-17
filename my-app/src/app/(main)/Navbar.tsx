import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import React from "react";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6">
        <Link href="/" className="text-2xl font-bold text-primary">
          bugbook
        </Link>
        <SearchField />
        <UserButton className="sm:ms-auto ml-4" />
      </div>
    </header>
  )
}; 
