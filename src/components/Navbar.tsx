"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-pink-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo + Name */}
        <Link href="/customer/homepage" className="flex items-center gap-2 font-bold text-xl hover:opacity-80">
          <img src="/icons/logonekovi.png" alt="logo" className="h-8 w-8" />
          <span>NekoVi</span>
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-6 ml-10">
          <Link href="/customer/anime" className="hover:underline">Anime</Link>

          {/* Dropdown sản phẩm */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:underline">
              Sản phẩm <ChevronDown size={16} />
            </button>
            <div className="absolute hidden group-hover:block bg-white text-black mt-2 rounded shadow-md p-2">
              <Link href="/customer/products/kimetsu" className="block px-3 py-1 hover:bg-gray-100">Kimetsu no Yaiba</Link>
              <Link href="/customer/products/onepiece" className="block px-3 py-1 hover:bg-gray-100">One Piece</Link>
              <Link href="/customer/products/jujutsu" className="block px-3 py-1 hover:bg-gray-100">Jujutsu Kaisen</Link>
              <Link href="/customer/products/naruto" className="block px-3 py-1 hover:bg-gray-100">Naruto</Link>
              <Link href="/customer/products/boyhero" className="block px-3 py-1 hover:bg-gray-100">The Boy and the Hero</Link>
            </div>
          </div>

          <Link href="/customer/news" className="hover:underline">Bảng tin</Link>
          <Link href="/customer/story" className="hover:underline">Câu chuyện</Link>
        </div>

        {/* Search + Icons */}
        <div className="flex items-center gap-4 ml-10">
          <div className="relative">
            <input
              type="text"
              placeholder="tìm kiếm tên sản phẩm"
              className="pl-3 pr-10 py-1 rounded-full text-black"
            />
            <Search className="absolute right-2 top-1.5 text-gray-600" size={18} />
          </div>
          <ShoppingCart className="cursor-pointer hover:text-gray-200" />
          <User className="cursor-pointer hover:text-gray-200" />
        </div>
      </div>
    </nav>
  );
}
