'use client';
import { Play, Pause, ShoppingCart, Music } from 'lucide-react';
import Image from 'next/image';
import { Beat } from '@/lib/api';
import { usePlayerStore, useCartStore } from '@/lib/store';
import { incrementPlay } from '@/lib/api';

const GENRE_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  'Trap':      { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', glow: 'rgba(239,68,68,0.3)' },
  'R&B':       { bg: 'rgba(236,72,153,0.12)',  text: '#f472b6', glow: 'rgba(236,72,153,0.3)' },
  'Hip-Hop':   { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', glow: 'rgba(245,158,11,0.3)' },
  'Lo-fi':     { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', glow: 'rgba(59,130,246,0.3)' },
  'Pop':       { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', glow: 'rgba(16,185,129,0.3)' },
  'Drill':     { bg: 'rgba(124,58,237,0.12)',  text: '#a78bfa', glow: 'rgba(124,58,237,0.3)' },
  'Afrobeats': { bg: 'rgba(251,146,60,0.12)',  text: '#fb923c', glow: 'rgba(251,146,60,0.3)' },
  'EDM':       { bg: 'rgba(6,182,212,0.12)',   text: '#22d3ee', glow: 'rgba(6,182,212,0.3)' },
};
const defaultColor = { bg: 'rgba(124,58,237,0.12)', text: '#a78bfa', glow: 'rgba(124,58,237,0.3)' };

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
const mediaUrl = (url?: string | null) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`;

interface Props { beat: Beat; view?: 'grid' | 'list'; }

export default function BeatCard({ beat, view = 'grid' }: Props) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore();
  const addItem = useCartStore((s) => s.addItem);

  const isCurrentTrack = currentTrack?.id === beat.id;
  const isActive = isCurrentTrack && isPlaying;
  const gc = GENRE_COLORS[beat.genre || ''] || defaultColor;
  const coverUrl = mediaUrl(beat.cover_url);

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  // ── List View ────────────────────────────────────
  if (view === 'list') {
    return (
      <div
        className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer"
        style={{
          background: isCurrentTrack ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.025)',
          border: isCurrentTrack ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.05)',
        }}
        onClick={handlePlay}
      >
        {/* Cover + Play */}
        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
          {coverUrl ? (
            <Image src={coverUrl} alt={beat.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${gc.glow},#0a0a14)` }}>
              <Music size={16} style={{ color: gc.text, opacity: 0.7 }} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isActive
              ? <Pause size={14} fill="white" className="text-white" />
              : <Play size={14} fill="white" className="text-white ml-0.5" />}
          </div>
        </div>

        {/* Equalizer / Play indicator */}
        <div className="w-4 shrink-0 flex items-end gap-[2px] h-4">
          {isCurrentTrack ? (
            isActive ? (
              <>
                <span className="w-[3px] rounded-sm bg-purple-400 bar-1" style={{ display: 'block', minHeight: '4px' }} />
                <span className="w-[3px] rounded-sm bg-purple-400 bar-2" style={{ display: 'block', minHeight: '4px' }} />
                <span className="w-[3px] rounded-sm bg-purple-400 bar-3" style={{ display: 'block', minHeight: '4px' }} />
              </>
            ) : (
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
            )
          ) : (
            <Play size={12} style={{ color: '#555' }} />
          )}
        </div>

        {/* Title + Producer */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{beat.title}</div>
          <div className="text-xs truncate mt-0.5" style={{ color: '#8888aa' }}>{beat.producer.name}</div>
        </div>

        {/* Genre */}
        {beat.genre && (
          <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded-full shrink-0"
            style={{ background: gc.bg, color: gc.text }}>
            {beat.genre}
          </span>
        )}

        {/* BPM */}
        {beat.bpm && (
          <span className="hidden md:inline text-xs w-16 text-right shrink-0" style={{ color: '#8888aa' }}>
            {beat.bpm} BPM
          </span>
        )}

        {/* Key */}
        {beat.key && (
          <span className="hidden lg:inline text-xs w-8 text-center shrink-0" style={{ color: '#666' }}>
            {beat.key}
          </span>
        )}

        {/* Price + Cart */}
        <div className="flex items-center gap-2 shrink-0">
          {cheapestLicense ? (
            <>
              <span className="text-sm font-bold" style={{ color: gc.text }}>
                NT${cheapestLicense.price.toLocaleString()}
              </span>
              {!beat.is_sold_out && (
                <button onClick={handleAddToCart}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  style={{ background: 'rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                  <ShoppingCart size={13} />
                </button>
              )}
            </>
          ) : (
            <span className="text-xs" style={{ color: '#555' }}>展示</span>
          )}
        </div>
      </div>
    );
  }

  // ── Grid View ────────────────────────────────────
  return (
    <div
      onClick={handlePlay}
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: 'linear-gradient(160deg, #13131e 0%, #0d0d18 100%)',
        border: isCurrentTrack ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isCurrentTrack ? `0 0 24px ${gc.glow}` : 'none',
      }}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden">
        {coverUrl ? (
          <Image src={coverUrl} alt={beat.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${gc.glow} 0%,#080810 100%)` }}>
            <Music size={32} style={{ color: gc.text, opacity: 0.4 }} />
          </div>
        )}

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isCurrentTrack ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(124,58,237,0.9)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
              }}>
              {isActive
                ? <Pause size={18} fill="white" className="text-white" />
                : <Play size={18} fill="white" className="text-white ml-0.5" />}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100"
              style={{
                background: 'rgba(124,58,237,0.85)',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
              }}>
              <Play size={18} fill="white" className="text-white ml-0.5" />
            </div>
          )}
        </div>

        {/* Now playing badge */}
        {isCurrentTrack && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-white text-[11px] font-bold"
            style={{ background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-end gap-[2px] h-3">
              {isActive ? (
                <>
                  <span className="w-[3px] rounded-sm bg-white bar-1" style={{ display: 'block', minHeight: '3px' }} />
                  <span className="w-[3px] rounded-sm bg-white bar-2" style={{ display: 'block', minHeight: '3px' }} />
                  <span className="w-[3px] rounded-sm bg-white bar-3" style={{ display: 'block', minHeight: '3px' }} />
                </>
              ) : (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </div>
            {isActive ? 'Playing' : 'Paused'}
          </div>
        )}

        {beat.bpm && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#aaa', backdropFilter: 'blur(4px)' }}>
            {beat.bpm}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {beat.genre && (
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5"
            style={{ background: gc.bg, color: gc.text }}>
            {beat.genre}
          </span>
        )}
        <h3 className="font-bold text-white truncate text-sm leading-snug">{beat.title}</h3>
        <p className="text-[11px] truncate mt-0.5" style={{ color: '#8888aa' }}>{beat.producer.name}</p>

        <div className="flex items-center justify-between mt-2.5 pt-2.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {cheapestLicense ? (
            <span className="font-black text-sm" style={{ color: gc.text }}>
              NT${cheapestLicense.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs" style={{ color: '#555' }}>展示</span>
          )}

          {cheapestLicense && !beat.is_sold_out && (
            <button onClick={handleAddToCart}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
              <ShoppingCart size={11} />
              加入
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
