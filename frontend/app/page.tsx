'use client';
import Link from 'next/link';
import { ArrowRight, Play, TrendingUp, Users, ShoppingBag, Zap } from 'lucide-react';

const MOCK_BEATS = [
  { id: 1, title: 'Midnight Trap', producer: 'Leo Beats', genre: 'Trap', bpm: 140, price: 1200, color: '#f87171' },
  { id: 2, title: 'Lo-fi Sunday', producer: 'ChillWave', genre: 'Lo-fi', bpm: 85, price: 800, color: '#60a5fa' },
  { id: 3, title: 'R&B Vibes', producer: 'SoulMaker', genre: 'R&B', bpm: 96, price: 1500, color: '#f472b6' },
  { id: 4, title: 'Drill Season', producer: 'Dark Arts', genre: 'Drill', bpm: 140, price: 1000, color: '#a78bfa' },
];

const MOCK_PRODUCERS = [
  { id: 1, name: 'Leo Beats', genres: ['Trap', 'Hip-Hop'], beats: 24, initial: 'L', gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)' },
  { id: 2, name: 'ChillWave', genres: ['Lo-fi', 'Ambient'], beats: 18, initial: 'C', gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
  { id: 3, name: 'SoulMaker', genres: ['R&B', 'Pop'], beats: 31, initial: 'S', gradient: 'linear-gradient(135deg,#db2777,#9333ea)' },
];

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
        style={{ background: '#080810' }}>

        {/* Animated background orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full animate-glow-pulse pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full animate-glow-pulse pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)' }} />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm mb-8"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            台灣頂尖音樂製作人平台
            <span style={{ color: 'rgba(167,139,250,0.5)' }}>✦</span>
          </div>

          <h1 className="font-black leading-[1.0] tracking-tight mb-6"
            style={{ fontSize: 'clamp(52px, 10vw, 100px)', color: '#f0f0ff' }}>
            Find Your<br />
            <span className="gradient-text">Sound.</span>
          </h1>

          <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: '#8888aa' }}>
            探索台灣最優秀的音樂製作人，購買高品質伴奏，
            或直接聯絡製作人客製化專屬編曲
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/beats"
              className="btn-glow inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-2xl font-bold text-base">
              瀏覽所有伴奏 <ArrowRight size={18} />
            </Link>
            <Link href="/producers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-2xl font-bold text-base transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Users size={16} />
              認識製作人
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-10">
            {[
              { value: '50+', label: '優質伴奏', icon: '🎵' },
              { value: '10+', label: '專業製作人', icon: '🎧' },
              { value: '3', label: '授權方案', icon: '📄' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white mb-1">{s.icon} {s.value}</div>
                <div className="text-sm" style={{ color: '#666' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #080810)' }} />
      </section>

      {/* ── Featured Beats ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <TrendingUp size={16} className="text-purple-400" />
            </div>
            <h2 className="text-white text-2xl font-bold">精選伴奏</h2>
          </div>
          <Link href="/beats" className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: '#a78bfa' }}>
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_BEATS.map((beat) => (
            <div key={beat.id}
              className="card-hover group cursor-pointer rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #16162a, #0f0f1a)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Cover */}
              <div className="relative aspect-square overflow-hidden">
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, rgba(124,58,237,0.4), #0a0a14)` }}>
                  <span className="text-5xl opacity-40">🎵</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center btn-glow">
                    <Play size={22} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-mono"
                  style={{ background: 'rgba(0,0,0,0.65)', color: '#aaa', backdropFilter: 'blur(8px)' }}>
                  {beat.bpm} BPM
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2"
                  style={{ background: `${beat.color}22`, color: beat.color }}>
                  {beat.genre}
                </span>
                <div className="font-bold text-white text-sm truncate">{beat.title}</div>
                <div className="text-xs truncate mt-0.5" style={{ color: '#8888aa' }}>{beat.producer}</div>
                <div className="flex items-center justify-between mt-3 pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-black text-base" style={{ color: beat.color }}>
                    NT${beat.price.toLocaleString()}
                  </span>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                    style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
                    購買
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Producers ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Users size={16} className="text-purple-400" />
            </div>
            <h2 className="text-white text-2xl font-bold">製作人陣容</h2>
          </div>
          <Link href="/producers" className="flex items-center gap-1 text-sm font-medium"
            style={{ color: '#a78bfa' }}>
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {MOCK_PRODUCERS.map((p) => (
            <Link key={p.id} href={`/producers/${p.id}`}
              className="card-hover group flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'linear-gradient(160deg, #16162a, #0f0f1a)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
                style={{ background: p.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                {p.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">{p.name}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.genres.map((g) => (
                    <span key={g} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{g}</span>
                  ))}
                </div>
                <div className="text-xs mt-1.5" style={{ color: '#666' }}>{p.beats} 首伴奏</div>
              </div>
              <ArrowRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-5">
          {[
            { icon: <Play size={20} />, title: '免費試聽', desc: '所有伴奏均可免費試聽，找到最適合你的聲音，再決定購買' },
            { icon: <Zap size={20} />, title: '彈性授權方案', desc: 'Basic、Premium 或 Exclusive 授權，滿足不同規模的創作需求' },
            { icon: <ShoppingBag size={20} />, title: '直接聯絡製作人', desc: '與製作人直接溝通，客製化屬於你的獨家編曲作品' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl"
              style={{ background: 'linear-gradient(160deg, #14142200, #0f0f1a)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-purple-400"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8888aa' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
