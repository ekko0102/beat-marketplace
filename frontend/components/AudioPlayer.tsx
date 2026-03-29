'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, ShoppingCart } from 'lucide-react';
import { usePlayerStore, useCartStore } from '@/lib/store';
import Image from 'next/image';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, pause, resume } = usePlayerStore();
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

      howlRef.current = new Howl({
        src: [`http://localhost:4000${currentTrack.previewUrl}`],
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-[#333] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Cover + info */}
        <div className="flex items-center gap-3 w-48 shrink-0">
          {currentTrack.coverUrl ? (
            <Image
              src={`http://localhost:4000${currentTrack.coverUrl}`}
              alt={currentTrack.title}
              width={44} height={44}
              className="rounded object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded bg-purple-900 flex items-center justify-center shrink-0">
              <Volume2 size={18} className="text-purple-300" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
            <p className="text-xs text-gray-400 truncate">{currentTrack.producerName}</p>
          </div>
        </div>

        {/* Controls + progress */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
            >
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-8 text-right">{fmt(progress)}</span>
            <div className="flex-1 h-1 bg-[#333] rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8">{fmt(duration)}</span>
          </div>
        </div>

        {/* Genre/BPM badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 w-32">
          {currentTrack.genre && <span className="bg-[#333] px-2 py-0.5 rounded">{currentTrack.genre}</span>}
          {currentTrack.bpm && <span className="bg-[#333] px-2 py-0.5 rounded">{currentTrack.bpm} BPM</span>}
        </div>
      </div>
    </div>
  );
}
