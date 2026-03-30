'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, X, Volume2 } from 'lucide-react';
import { usePlayerStore, useCartStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
const mediaUrl = (url?: string | null) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`;

export default function AudioPlayer() {
  const { currentTrack, isPlaying, pause, resume, stop } = usePlayerStore();
  const addItem = useCartStore((s) => s.addItem);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const howlRef = useRef<any>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!currentTrack) return;

    const loadHowler = async () => {
      const { Howl } = await import('howler');
      if (howlRef.current) howlRef.current.unload();

      const src = currentTrack.previewUrl.startsWith('http')
        ? currentTrack.previewUrl
        : `${API_BASE}${currentTrack.previewUrl}`;

      howlRef.current = new Howl({
        src: [src],
        html5: true,
        onload: () => setDuration(howlRef.current.duration()),
        onend: () => pause(),
      });

      if (isPlaying) howlRef.current.play();
    };

    loadHowler();
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (howlRef.current) howlRef.current.unload();
    };
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!howlRef.current) return;
    if (isPlaying) {
      howlRef.current.play();
      const tick = () => {
        setProgress(howlRef.current?.seek() || 0);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      howlRef.current.pause();
      cancelAnimationFrame(rafRef.current);
    }
  }, [isPlaying]);

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const coverUrl = mediaUrl(currentTrack.coverUrl);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!howlRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    howlRef.current.seek(ratio * duration);
    setProgress(ratio * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,10,18,0.92)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
      }}>
      {/* Progress bar at very top */}
      <div className="h-[2px] w-full cursor-pointer group relative" style={{ background: 'rgba(255,255,255,0.06)' }} onClick={handleSeek}>
        <div className="h-full bg-purple-500 transition-none relative"
          style={{ width: `${pct}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ transform: 'translate(50%,-50%)' }} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Cover */}
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0"
          style={{ background: 'rgba(124,58,237,0.3)' }}>
          {coverUrl ? (
            <Image src={coverUrl} alt={currentTrack.title} width={36} height={36} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Volume2 size={14} className="text-purple-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 w-36 shrink-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{currentTrack.title}</p>
          <p className="text-[11px] truncate" style={{ color: '#8888aa' }}>{currentTrack.producerName}</p>
        </div>

        {/* Play / Pause */}
        <button
          onClick={() => isPlaying ? pause() : resume()}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
          {isPlaying ? <Pause size={15} fill="white" /> : <Play size={15} fill="white" className="ml-0.5" />}
        </button>

        {/* Time */}
        <div className="hidden sm:flex items-center gap-2 text-xs shrink-0" style={{ color: '#8888aa' }}>
          <span className="w-8 text-right font-mono">{fmt(progress)}</span>
          <span style={{ color: '#444' }}>/</span>
          <span className="w-8 font-mono">{fmt(duration)}</span>
        </div>

        {/* Waveform spacer (visual only) */}
        <div className="flex-1 hidden md:flex items-center gap-[2px] h-8 overflow-hidden opacity-30">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="w-[2px] rounded-full shrink-0"
              style={{
                height: `${Math.random() * 70 + 15}%`,
                background: i / 60 < pct / 100 ? '#7c3aed' : '#333',
              }} />
          ))}
        </div>

        {/* Genre/BPM */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {currentTrack.genre && (
            <span className="text-[11px] px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
              {currentTrack.genre}
            </span>
          )}
          {currentTrack.bpm && (
            <span className="text-[11px] px-2 py-0.5 rounded-md font-mono"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#888' }}>
              {currentTrack.bpm}
            </span>
          )}
        </div>

        {/* Close */}
        <button onClick={stop}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-white/10 shrink-0"
          style={{ color: '#555' }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
