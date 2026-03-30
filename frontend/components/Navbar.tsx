'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Music2, Users, LogIn, Disc3, LayoutDashboard, LogOut } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export default function Navbar() {
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const pathname = usePathname();
  const [producerName, setProducerName] = useState<string | null>(null);

  // Read auth state from localStorage on every route change
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('producerName');
    setProducerName(token && name ? name : null);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('producerName');
    localStorage.removeItem('producerId');
    setProducerName(null);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(8, 8, 16, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-purple-600 rounded-xl blur-sm opacity-60 group-hover:opacity-90 transition-opacity animate-glow-pulse" />
            <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-700 rounded-xl flex items-center justify-center">
              <Disc3 size={16} className="text-white" />
            </div>
          </div>
          <span className="font-black text-lg tracking-tight">
            <span className="text-white">Beat</span>
            <span className="gradient-text">Market</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {[
            { href: '/beats', label: '伴奏市集', icon: <Music2 size={14} /> },
            { href: '/producers', label: '製作人', icon: <Users size={14} /> },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              {icon}
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <ShoppingCart size={19} />
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                style={{ boxShadow: '0 0 8px rgba(124,58,237,0.7)' }}>
                {items.length}
              </span>
            )}
          </Link>

          {producerName ? (
            <>
              <Link href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                <LayoutDashboard size={14} />
                後台
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa', border: '1px solid rgba(255,255,255,0.08)' }}>
                <LogOut size={14} />
                <span className="hidden sm:inline">登出</span>
              </button>
            </>
          ) : (
            <Link href="/auth/login"
              className="btn-glow flex items-center gap-1.5 px-4 py-2 text-white text-sm rounded-xl font-semibold">
              <LogIn size={14} />
              製作人登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
