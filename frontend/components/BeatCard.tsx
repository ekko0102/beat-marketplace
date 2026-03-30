'use client';
import { Play, Pause, ShoppingCart, Music } from 'lucide-react';
import Image from 'next/image';
import { Beat } from '@/lib/api';
import { usePlayerStore, useCartStore } from '@/lib/store';
import { incrementPlay } from '@/lib/api';

const GENRE_COLORS: Record<string, { bg: string; text: string }> = {
  'Trap':      { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
  'R&B':       { bg: 'rgba(236,72,153,0.15)',  text: '#f472b6' },
  'Hip-Hop':   { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
  'Lo-fi':     { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  'Pop':       { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  'Drill':     { bg: 'rgba(124,58,237,0.15)',  text: '#a78bfa' },
  'Afrobeats': { bg: 'rgba(251,146,60,0.15)',  text: '#fb923c' },
};
const defaultColor = { bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' };

interface Props { beat: Beat; }

export default function BeatCard({ beat }: Props) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore();
  const addItem = useCartStore((s) => s.addItem);

  const isCurrentTrack = currentTrack?.id === beat.id;
  const isActive = isCurrentTrack && isPlaying;
  const genreColor = GENRE_COLORS[beat.genre || ''] || defaultColor;

  const handlePlay = () => {
    if (isCurrentTrack) {
      isPlaying ? pause() : resume();
    } else {
      incrementPlay(beat.id).catch(() => {});
      play({
        id: beat.id,
        title: beat.title,
        producerName: beat.producer.name,
        coverUrl: beat.cover_url || null,
        previewUrl: beat.preview_url,
        genre: beat.genre,
        bpm: beat.bpm,
      });
    }
  };

  const cheapestLicense = beat.licenses?.filter((l) => l.is_available).sort((a, b) => a.price - b.price)[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cheapestLicense) return;
    addItem({
      beatId: beat.id,
      licenseId: cheapestLicense.id,
      beatTitle: beat.title,
      producerName: beat.producer.name,
      coverUrl: beat.cover_url || null,
      licenseType: cheapestLicense.type,
      price: cheapestLicense.price,
    });
  };

  return (
    <div
      onClick={handlePlay}
      className="card-hover group cursor-pointer rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #16162a 0%, #0f0f1a 100%)',
        border: isCurrentTrack ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isCurrentTrack ? '0 0 20px rgba(124,58,237,0.25)' : 'none',
      }}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden">
        {beat.cover_url ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${beat.cover_url}`}
            alt={beat.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, rgba(124,58,237,0.4), #0a0a14)` }}>
            <Music size={40} style={{ color: genreColor.text, opacity: 0.5 }} />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50">
          <div className="w-14 h-14 rounded-full flex items-center justify-center btn-glow">
            {isActive
              ? <Pause size={22} fill="white" className="text-white" />
              : <Play size={22} fill="white" className="text-white ml-0.5" />
            }
          </div>
        </div>

        {/* Now playing indicator */}
        {isCurrentTrack && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
            style={{ background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-end gap-[2px] h-3">
              {isActive ? (
                <>
                  <span className="w-[3px] rounded-sm bg-white bar-1" style={{ display: 'block', minHeight: '4px' }} />
                  <span className="w-[3px] rounded-sm bg-white bar-2" style={{ display: 'block', minHeight: '4px' }} />
                  <span className="w-[3px] rounded-sm bg-white bar-3" style={{ display: 'block', minHeight: '4px' }} />
                  <span className="w-[3px] rounded-sm bg-white bar-4" style={{ display: 'block', minHeight: '4px' }} />
                </>
              ) : (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </div>
            {isActive ? 'Playing' : 'Paused'}
          </div>
        )}

        {beat.is_sold_out && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#777', backdropFilter: 'blur(8px)' }}>
            Sold Out
          </div>
        )}

        {beat.bpm && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-mono"
            style={{ background: 'rgba(0,0,0,0.65)', color: '#aaa', backdropFilter: 'blur(8px)' }}>
            {beat.bpm} BPM
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {beat.genre && (
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2"
            style={{ background: genreColor.bg, color: genreColor.text }}>
            {beat.genre}
          </span>
        )}
        <h3 className="font-bold text-white truncate text-sm leading-tight">{beat.title}</h3>
        <p className="text-xs truncate mt-0.5" style={{ color: '#8888aa' }}>{beat.producer.name}</p>

        {beat.key && (
          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded mt-1.5"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8888aa' }}>
            Key: {beat.key}
          </span>
        )}

        <div className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {cheapestLicense ? (
            <span className="font-black text-base" style={{ color: genreColor.text }}>
              NT${cheapestLicense.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm" style={{ color: '#666' }}>展示作品</span>
          )}

          {cheapestLicense && !beat.is_sold_out && (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <ShoppingCart size={12} />
              加入購物車
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
