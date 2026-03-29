'use client';
import Link from 'next/link';
import { ShoppingCart, Music2, Users, LogIn } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const items = useCartStore((s) => s.items);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/95 backdrop-blur border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Music2 className="text-purple-500" size={24} />
          <span className="text-white">Beat<span className="text-purple-500">Market</span></span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/beats" className="hover:text-white transition-colors">伴奏市集</Link>
          <Link href="/producers" className="hover:text-white transition-colors">製作人</Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <ShoppingCart size={20} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
          >
            <LogIn size={16} />
            製作人登入
          </Link>
        </div>
      </div>
    </nav>
  );
}
