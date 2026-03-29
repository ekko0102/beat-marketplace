'use client';
import Link from 'next/link';
import { ArrowRight, Play, TrendingUp, Users, ShoppingBag } from 'lucide-react';

const MOCK_BEATS = [
  { id: 1, title: 'Midnight Trap', producer: 'Leo Beats', genre: 'Trap', bpm: 140, price: 1200 },
  { id: 2, title: 'Lo-fi Sunday', producer: 'ChillWave', genre: 'Lo-fi', bpm: 85, price: 800 },
  { id: 3, title: 'R&B Vibes', producer: 'SoulMaker', genre: 'R&B', bpm: 96, price: 1500 },
  { id: 4, title: 'Drill Season', producer: 'Dark Arts', genre: 'Drill', bpm: 140, price: 1000 },
];

const MOCK_PRODUCERS = [
  { id: 1, name: 'Leo Beats', genres: ['Trap', 'Hip-Hop'], beats: 24 },
  { id: 2, name: 'ChillWave', genres: ['Lo-fi', 'Ambient'], beats: 18 },
  { id: 3, name: 'SoulMaker', genres: ['R&B', 'Pop'], beats: 31 },
];

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-[#0F0F0F]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-800/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-900/40 border border-purple-700/50 rounded-full text-purple-300 text-sm mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            台灣頂尖製作人伴奏平台
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[1.05] tracking-tight">
            Find Your<br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-300 bg-clip-text text-transparent">
              Sound
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            探索台灣最優秀的音樂製作人，購買高品質伴奏，
            或聯絡製作人客製化編曲
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/beats"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-base transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
            >
              瀏覽所有伴奏 <ArrowRight size={18} />
            </Link>
            <Link
              href="/producers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-base transition-all border border-white/10 hover:border-white/20"
            >
              <Users size={18} />
              認識製作人
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            {[
              { value: '50+', label: '優質伴奏' },
              { value: '10+', label: '專業製作人' },
              { value: '3', label: '授權方案' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Beats */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-purple-400" size={22} />
            <h2 className="text-white text-2xl font-bold">精選伴奏</h2>
          </div>
          <Link href="/beats" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            查看全部 →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_BEATS.map((beat) => (
            <div key={beat.id} className="group bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2a2a2a] hover:border-purple-800/50 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]">
              {/* Cover art placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-purple-900/40 to-violet-950/60 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center border border-purple-500/30">
                  <span className="text-2xl">🎵</span>
                </div>
                <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
                    <Play size={24} fill="white" className="text-white ml-1" />
                  </div>
                </button>
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 rounded-lg text-xs text-gray-300">
                  {beat.bpm} BPM
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-purple-400 mb-1">{beat.genre}</div>
                <div className="text-white font-semibold mb-0.5">{beat.title}</div>
                <div className="text-gray-500 text-sm mb-3">{beat.producer}</div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">NT${beat.price.toLocaleString()}</span>
                  <button className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs rounded-lg transition-all border border-purple-700/40 hover:border-purple-600">
                    購買
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Producers */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="text-purple-400" size={22} />
            <h2 className="text-white text-2xl font-bold">製作人陣容</h2>
          </div>
          <Link href="/producers" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            查看全部 →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {MOCK_PRODUCERS.map((p) => (
            <Link key={p.id} href={`/producers/${p.id}`}
              className="group flex items-center gap-4 p-5 bg-[#1A1A1A] rounded-2xl border border-[#2a2a2a] hover:border-purple-800/50 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-violet-900 flex items-center justify-center text-2xl flex-shrink-0">
                🎧
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold mb-1">{p.name}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {p.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-800/30">{g}</span>
                  ))}
                </div>
                <div className="text-gray-500 text-xs">{p.beats} 首伴奏</div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Play size={22} className="text-purple-400" />,
              title: '免費試聽',
              desc: '所有伴奏均可免費試聽，找到最適合你的聲音，再決定購買',
            },
            {
              icon: <ShoppingBag size={22} className="text-purple-400" />,
              title: '彈性授權方案',
              desc: 'Basic、Premium 或 Exclusive 授權，滿足不同規模的創作需求',
            },
            {
              icon: <Users size={22} className="text-purple-400" />,
              title: '直接聯絡製作人',
              desc: '與製作人直接溝通，客製化屬於你的獨家編曲',
            },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-gradient-to-b from-[#1e1e1e] to-[#181818] border border-[#2a2a2a]">
              <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center mb-4 border border-purple-800/20">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
